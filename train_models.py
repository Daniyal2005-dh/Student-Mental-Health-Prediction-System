import pandas as pd
import numpy as np
import pickle
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

def train_and_evaluate():
    # 1. Load Data
    df = pd.read_csv('student_mental_health.csv')
    
    # 2. Handle missing values (if any) - in survey data, check for nulls
    # Let's ensure columns are stripped of spaces
    df.columns = [col.strip() for col in df.columns]
    
    # Define features and targets
    # Standard columns:
    # 'Choose your gender', 'Age', 'What is your course?', 'Your current year of Study', 'What is your CGPA?', 'Marital status'
    
    # Target definition (Composite Mental Health Risk Level)
    dep = (df['Do you have Depression?'] == 'Yes').astype(int)
    anx = (df['Do you have Anxiety?'] == 'Yes').astype(int)
    panic = (df['Do you have Panic attack?'] == 'Yes').astype(int)
    
    # Risk Level: 0 = Low Risk, 1 = Moderate Risk, 2 = High Risk
    df['Risk_Level'] = np.where((dep + anx + panic) >= 2, 2, np.where((dep + anx + panic) == 1, 1, 0))
    
    # Features
    feature_cols = [
        'Choose your gender',
        'Age',
        'What is your course?',
        'Your current year of Study',
        'What is your CGPA?',
        'Marital status'
    ]
    
    X = df[feature_cols]
    y = df['Risk_Level']
    
    # Preprocessing
    categorical_features = ['Choose your gender', 'What is your course?', 'Your current year of Study', 'What is your CGPA?', 'Marital status']
    numeric_features = ['Age']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse=False), categorical_features)
        ]
    )
    
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Fit and transform
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Save preprocessor
    with open('preprocessor.pkl', 'wb') as f:
        pickle.dump(preprocessor, f)
        
    # Get preprocessed feature names
    cat_encoder = preprocessor.named_transformers_['cat']
    encoded_cat_features = list(cat_encoder.get_feature_names_out(categorical_features))
    feature_names = numeric_features + encoded_cat_features
    
    # 3. Model Training & Evaluation
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42),
        'SVM': SVC(probability=True, C=1.0, kernel='rbf', random_state=42),
        'XGBoost': XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, eval_metric='mlogloss')
    }
    
    metrics_summary = {}
    
    for name, model in models.items():
        # Train
        model.fit(X_train_processed, y_train)
        
        # Save model
        with open(f'{name.lower()}_model.pkl', 'wb') as f:
            pickle.dump(model, f)
            
        # Predict
        y_pred = model.predict(X_test_processed)
        y_prob = model.predict_proba(X_test_processed)
        
        # Metrics
        acc = accuracy_score(y_test, y_pred)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        metrics_summary[name] = {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'confusion_matrix': cm
        }
        
        # Feature importances (for tree-based models)
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            # Sort importances
            indices = np.argsort(importances)[::-1]
            top_features = []
            # Take top 10 features
            for idx in indices[:12]:
                top_features.append({
                    'feature': feature_names[idx],
                    'importance': float(importances[idx])
                })
            metrics_summary[name]['feature_importances'] = top_features
        elif name == 'SVM':
            # SVM does not have feature importances directly for rbf kernel, so we omit or compute permutation importances.
            # We can use RF or XGBoost feature importances for display.
            metrics_summary[name]['feature_importances'] = []
            
    # Save metrics JSON
    with open('metrics.json', 'w') as f:
        json.dump(metrics_summary, f, indent=4)
        
    print("Models trained and evaluated successfully!")
    print(f"Random Forest Accuracy: {metrics_summary['RandomForest']['accuracy']:.4f}")
    print(f"SVM Accuracy: {metrics_summary['SVM']['accuracy']:.4f}")
    print(f"XGBoost Accuracy: {metrics_summary['XGBoost']['accuracy']:.4f}")

if __name__ == '__main__':
    train_and_evaluate()
