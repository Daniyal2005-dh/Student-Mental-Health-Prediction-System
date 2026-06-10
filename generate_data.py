import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_student_data(num_records=1000):
    np.random.seed(42)
    random.seed(42)
    
    courses = [
        'Engineering', 'CSE', 'BIT', 'BCS', 'Business Administration', 
        'Laws', 'Psychology', 'Education', 'Medicine', 'Art & Design'
    ]
    
    years = ['year 1', 'year 2', 'year 3', 'year 4']
    cgpas = ['0 - 1.99', '2.00 - 2.49', '2.50 - 2.99', '3.00 - 3.49', '3.50 - 4.00']
    
    data = []
    start_date = datetime(2025, 1, 1)
    
    for i in range(num_records):
        timestamp = start_date + timedelta(
            days=random.randint(0, 365),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        gender = np.random.choice(['Male', 'Female'], p=[0.45, 0.55])
        age = int(np.random.choice([18, 19, 20, 21, 22, 23, 24], p=[0.15, 0.20, 0.25, 0.15, 0.12, 0.08, 0.05]))
        course = np.random.choice(courses)
        
        # Year of study correlates with age
        if age <= 19:
            year_of_study = np.random.choice(['year 1', 'year 2'], p=[0.8, 0.2])
        elif age <= 21:
            year_of_study = np.random.choice(['year 2', 'year 3', 'year 4'], p=[0.3, 0.5, 0.2])
        else:
            year_of_study = np.random.choice(['year 3', 'year 4'], p=[0.2, 0.8])
            
        cgpa = np.random.choice(cgpas, p=[0.05, 0.15, 0.25, 0.35, 0.20])
        marital_status = np.random.choice(['Yes', 'No'], p=[0.08, 0.92])
        
        # Calculate latent stress factors that influence depression, anxiety, panic attacks
        # Course stress weight
        course_stress = 0.5 if course in ['Engineering', 'CSE', 'Medicine', 'Laws'] else 0.0
        # CGPA stress weight (both low CGPA and extremely high CGPA can cause stress)
        cgpa_stress = 0.4 if cgpa in ['0 - 1.99', '2.00 - 2.49'] else (0.2 if cgpa == '3.50 - 4.00' else -0.2)
        # Year stress weight (final year has higher stress)
        year_stress = 0.3 if year_of_study == 'year 4' else -0.1
        # Age stress
        age_stress = 0.2 if age >= 22 else 0.0
        # Marital status stress
        marital_stress = 0.4 if marital_status == 'Yes' else 0.0
        
        base_logit = -1.8 + course_stress + cgpa_stress + year_stress + age_stress + marital_stress
        
        # 1. Depression probability
        prob_dep = 1 / (1 + np.exp(-base_logit))
        depression = np.random.choice(['Yes', 'No'], p=[prob_dep, 1 - prob_dep])
        
        # 2. Anxiety probability (correlated with depression and base stress)
        anxiety_logit = base_logit + (1.2 if depression == 'Yes' else 0.0) + 0.3
        prob_anx = 1 / (1 + np.exp(-anxiety_logit))
        anxiety = np.random.choice(['Yes', 'No'], p=[prob_anx, 1 - prob_anx])
        
        # 3. Panic attack probability (correlated with anxiety and depression)
        panic_logit = base_logit + (1.0 if anxiety == 'Yes' else 0.0) + (0.5 if depression == 'Yes' else 0.0) - 0.2
        prob_panic = 1 / (1 + np.exp(-panic_logit))
        panic_attack = np.random.choice(['Yes', 'No'], p=[prob_panic, 1 - prob_panic])
        
        # 4. Specialist treatment seeking (correlated with severity of symptoms)
        symptoms_count = sum([1 for sym in [depression, anxiety, panic_attack] if sym == 'Yes'])
        if symptoms_count == 3:
            prob_treatment = 0.75
        elif symptoms_count == 2:
            prob_treatment = 0.45
        elif symptoms_count == 1:
            prob_treatment = 0.20
        else:
            prob_treatment = 0.02
            
        treatment = np.random.choice(['Yes', 'No'], p=[prob_treatment, 1 - prob_treatment])
        
        data.append([
            timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            gender,
            age,
            course,
            year_of_study,
            cgpa,
            marital_status,
            depression,
            anxiety,
            panic_attack,
            treatment
        ])
        
    df = pd.DataFrame(data, columns=[
        'Timestamp',
        'Choose your gender',
        'Age',
        'What is your course?',
        'Your current year of Study',
        'What is your CGPA?',
        'Marital status',
        'Do you have Depression?',
        'Do you have Anxiety?',
        'Do you have Panic attack?',
        'Did you seek any specialist for a treatment?'
    ])
    
    df.to_csv('student_mental_health.csv', index=False)
    print(f"Dataset generated: {num_records} records saved to 'student_mental_health.csv'")
    
    # Print target distributions
    print("\nTarget Variable Distributions:")
    print("Depression:\n", df['Do you have Depression?'].value_counts(normalize=True))
    print("Anxiety:\n", df['Do you have Anxiety?'].value_counts(normalize=True))
    print("Panic Attacks:\n", df['Do you have Panic attack?'].value_counts(normalize=True))

if __name__ == "__main__":
    generate_student_data(1200)
