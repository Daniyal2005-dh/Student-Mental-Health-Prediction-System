from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import pickle
import json
import os

app = FastAPI(title="Student Mental Health Prediction API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models and data
preprocessor = None
models = {}
metrics = {}
df_raw = None

# Load models and preprocessing pipelines
@app.on_event("startup")
def load_assets():
    global preprocessor, models, metrics, df_raw
    try:
        # Load data
        if os.path.exists("student_mental_health.csv"):
            df_raw = pd.read_csv("student_mental_health.csv")
            # Clean column names
            df_raw.columns = [col.strip() for col in df_raw.columns]
        else:
            print("Warning: student_mental_health.csv not found.")

        # Load preprocessor
        if os.path.exists("preprocessor.pkl"):
            with open("preprocessor.pkl", "rb") as f:
                preprocessor = pickle.load(f)
        else:
            print("Warning: preprocessor.pkl not found.")

        # Load models
        for name in ["randomforest", "svm", "xgboost"]:
            filename = f"{name}_model.pkl"
            if os.path.exists(filename):
                with open(filename, "rb") as f:
                    models[name] = pickle.load(f)
            else:
                print(f"Warning: {filename} not found.")

        # Load metrics
        if os.path.exists("metrics.json"):
            with open("metrics.json", "r") as f:
                metrics = json.load(f)
        else:
            print("Warning: metrics.json not found.")
            
        print("Backend assets loaded successfully!")
    except Exception as e:
        print(f"Error loading backend assets: {str(e)}")


class PredictionInput(BaseModel):
    gender: str = Field(..., example="Male", description="Gender of the student")
    age: int = Field(..., example=20, description="Age of the student")
    course: str = Field(..., example="Engineering", description="Course name")
    year_of_study: str = Field(..., example="year 2", description="Current year of study")
    cgpa: str = Field(..., example="3.00 - 3.49", description="CGPA range")
    marital_status: str = Field(..., example="No", description="Marital status")


def get_recommendations(risk_level, inputs):
    recommendations = []
    
    if risk_level == 2:  # High Risk
        recommendations = [
            "We highly recommend booking an appointment with the University Counseling Center or a certified mental health specialist. Professional support is crucial.",
            "Consider discussing academic adjustments (e.g., assignment extensions, exam accommodations) with your course advisor to ease current workload stress.",
            "Reach out to a trusted family member, close friend, or mentor to share what you are experiencing. You don't have to carry this alone.",
            "Incorporate structured stress-reduction techniques into your daily routine, such as guided mindfulness, deep breathing exercises, or progressive muscle relaxation."
        ]
    elif risk_level == 1:  # Moderate Risk
        recommendations = [
            "Consider scheduling an initial chat with a student counselor or peer support group to talk through your current stressors.",
            "Audit your weekly schedule: establish clear boundaries between study hours and personal time to prevent academic burnout.",
            "Focus on sleep hygiene: aim for 7-8 hours of consistent sleep, and limit screen time before bed.",
            "Engage in regular physical activity (e.g., a 30-minute daily walk, yoga, or gym sessions), which has been clinically proven to reduce mild anxiety and mood fluctuations."
        ]
    else:  # Low Risk
        recommendations = [
            "Maintain your healthy habits: continue balancing academics with hobbies, social connections, and exercise.",
            "Practice proactive stress management, checking in with your emotional well-being during high-pressure periods like midterm and final exams.",
            "Keep up healthy social connections and sleep routines to build strong resilience."
        ]
        
    # Context-specific recommendations
    if inputs.cgpa in ["0 - 1.99", "2.00 - 2.49"]:
        recommendations.append("Academic resources: Reach out to the student academic support cell for tutoring, study planning, or time-management workshops to help improve your CGPA and relieve academic anxiety.")
    if inputs.course in ["Engineering", "CSE", "Medicine", "Laws"]:
        recommendations.append("Peer Support: Join study circles or student societies in your department to share the workload and learn from peer experiences in these demanding courses.")
    if inputs.marital_status == "Yes":
        recommendations.append("Work-Life Balance: Balancing marital life and academic responsibilities can be challenging. Seek counseling specifically focused on time-management and family-study equilibrium.")
        
    return recommendations


@app.get("/api/health")
def health_check():
    return {"status": "ok", "models_loaded": list(models.keys())}


@app.get("/api/metrics")
def get_model_metrics():
    if not metrics:
        raise HTTPException(status_code=500, detail="Model metrics are not available.")
    return metrics


@app.get("/api/eda")
def get_eda_data():
    if df_raw is None:
        raise HTTPException(status_code=500, detail="Survey dataset is not available.")
        
    # Calculate composite risk index for the whole dataset to show statistical trends
    dep = (df_raw['Do you have Depression?'] == 'Yes').astype(int)
    anx = (df_raw['Do you have Anxiety?'] == 'Yes').astype(int)
    panic = (df_raw['Do you have Panic attack?'] == 'Yes').astype(int)
    df_raw['Risk_Level'] = np.where((dep + anx + panic) >= 2, 2, np.where((dep + anx + panic) == 1, 1, 0))
    
    # 1. Age distribution vs Risk Level
    age_risk = df_raw.groupby(['Age', 'Risk_Level']).size().unstack(fill_value=0).reset_index()
    age_data = []
    for _, row in age_risk.iterrows():
        age_data.append({
            "age": int(row['Age']),
            "Low Risk": int(row.get(0, 0)),
            "Moderate Risk": int(row.get(1, 0)),
            "High Risk": int(row.get(2, 0))
        })
        
    # 2. Gender vs Symptoms
    gender_stats = []
    for g in df_raw['Choose your gender'].unique():
        sub = df_raw[df_raw['Choose your gender'] == g]
        dep_rate = (sub['Do you have Depression?'] == 'Yes').mean() * 100
        anx_rate = (sub['Do you have Anxiety?'] == 'Yes').mean() * 100
        panic_rate = (sub['Do you have Panic attack?'] == 'Yes').mean() * 100
        gender_stats.append({
            "gender": g,
            "Depression %": round(dep_rate, 2),
            "Anxiety %": round(anx_rate, 2),
            "Panic Attacks %": round(panic_rate, 2),
            "count": len(sub)
        })
        
    # 3. CGPA vs Stress/Risk Level
    cgpa_risk = df_raw.groupby(['What is your CGPA?', 'Risk_Level']).size().unstack(fill_value=0).reset_index()
    cgpa_data = []
    # Sort CGPA ranges
    cgpa_order = ['0 - 1.99', '2.00 - 2.49', '2.50 - 2.99', '3.00 - 3.49', '3.50 - 4.00']
    cgpa_risk['cgpa_order'] = cgpa_risk['What is your CGPA?'].apply(
        lambda x: cgpa_order.index(x) if x in cgpa_order else 99
    )
    cgpa_risk = cgpa_risk.sort_values('cgpa_order')
    
    for _, row in cgpa_risk.iterrows():
        cgpa_data.append({
            "cgpa": row['What is your CGPA?'],
            "Low Risk": int(row.get(0, 0)),
            "Moderate Risk": int(row.get(1, 0)),
            "High Risk": int(row.get(2, 0))
        })
        
    # 4. Top courses vs Risk levels
    course_risk = df_raw.groupby(['What is your course?', 'Risk_Level']).size().unstack(fill_value=0)
    course_risk['Total'] = course_risk.sum(axis=1)
    course_risk = course_risk.sort_values(by='Total', ascending=False).head(8).reset_index()
    
    course_data = []
    for _, row in course_risk.iterrows():
        course_data.append({
            "course": row['What is your course?'],
            "Low Risk": int(row.get(0, 0)),
            "Moderate Risk": int(row.get(1, 0)),
            "High Risk": int(row.get(2, 0)),
            "Total": int(row['Total'])
        })
        
    # 5. Treatment seeking behavior by Risk Level
    treatment_risk = df_raw.groupby(['Risk_Level', 'Did you seek any specialist for a treatment?']).size().unstack(fill_value=0).reset_index()
    treatment_data = []
    risk_labels = {0: "Low Risk", 1: "Moderate Risk", 2: "High Risk"}
    for _, row in treatment_risk.iterrows():
        r_lvl = row['Risk_Level']
        treatment_data.append({
            "risk": risk_labels[r_lvl],
            "Sought Treatment": int(row.get('Yes', 0)),
            "No Treatment": int(row.get('No', 0))
        })
        
    # 6. Overall stats
    total_records = len(df_raw)
    dep_total = int((df_raw['Do you have Depression?'] == 'Yes').sum())
    anx_total = int((df_raw['Do you have Anxiety?'] == 'Yes').sum())
    panic_total = int((df_raw['Do you have Panic attack?'] == 'Yes').sum())
    
    overall = {
        "total": total_records,
        "depression_rate": round(dep_total / total_records * 100, 1),
        "anxiety_rate": round(anx_total / total_records * 100, 1),
        "panic_rate": round(panic_total / total_records * 100, 1),
        "low_risk_rate": round(int((df_raw['Risk_Level'] == 0).sum()) / total_records * 100, 1),
        "mod_risk_rate": round(int((df_raw['Risk_Level'] == 1).sum()) / total_records * 100, 1),
        "high_risk_rate": round(int((df_raw['Risk_Level'] == 2).sum()) / total_records * 100, 1)
    }
    
    return {
        "age_distribution": age_data,
        "gender_comparison": gender_stats,
        "cgpa_impact": cgpa_data,
        "course_impact": course_data,
        "treatment_behavior": treatment_data,
        "overall_stats": overall
    }


@app.post("/api/predict")
def predict(inputs: PredictionInput):
    if preprocessor is None or not models:
        raise HTTPException(
            status_code=500, 
            detail="Machine learning pipeline is not initialized. Please ensure models are trained."
        )
        
    # Construct DataFrame for the input
    input_df = pd.DataFrame([{
        'Choose your gender': inputs.gender,
        'Age': inputs.age,
        'What is your course?': inputs.course,
        'Your current year of Study': inputs.year_of_study,
        'What is your CGPA?': inputs.cgpa,
        'Marital status': inputs.marital_status
    }])
    
    try:
        # Preprocess input
        processed = preprocessor.transform(input_df)
        
        predictions = {}
        ensemble_probs = np.zeros(3)  # Array for 3 classes: Low, Moderate, High
        
        # Get predictions for all models
        for name, model in models.items():
            prob = model.predict_proba(processed)[0]  # Array of probabilities for class [0, 1, 2]
            pred = int(np.argmax(prob))
            
            # Map risk levels
            risk_label = "Low Risk" if pred == 0 else ("Moderate Risk" if pred == 1 else "High Risk")
            
            predictions[name] = {
                "risk_level": pred,
                "label": risk_label,
                "probabilities": {
                    "Low Risk": round(float(prob[0]), 3),
                    "Moderate Risk": round(float(prob[1]), 3),
                    "High Risk": round(float(prob[2]), 3)
                }
            }
            # Simple average ensemble weighting (could also weight by model accuracy)
            ensemble_probs += prob / len(models)
            
        ensemble_pred = int(np.argmax(ensemble_probs))
        ensemble_label = "Low Risk" if ensemble_pred == 0 else ("Moderate Risk" if ensemble_pred == 1 else "High Risk")
        
        # Get actionable recommendations
        recommendations = get_recommendations(ensemble_pred, inputs)
        
        response = {
            "model_predictions": predictions,
            "ensemble": {
                "risk_level": ensemble_pred,
                "label": ensemble_label,
                "probabilities": {
                    "Low Risk": round(float(ensemble_probs[0]), 3),
                    "Moderate Risk": round(float(ensemble_probs[1]), 3),
                    "High Risk": round(float(ensemble_probs[2]), 3)
                }
            },
            "recommendations": recommendations,
            "inputs": inputs.dict()
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
