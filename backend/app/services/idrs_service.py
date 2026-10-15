from typing import Literal

def calculate_idrs(
    age: float,
    gender: Literal["male", "female"],
    waist_cm: float,
    activity: Literal["vigorous", "moderate", "sedentary"],
    family_history: Literal["none", "one_parent", "both_parents"]
) -> dict:
    """
    Computes the Indian Diabetes Risk Score (IDRS) developed by MDRF (Dr. V. Mohan)
    and validated by the Indian Council of Medical Research (ICMR-INDIAB).
    
    Total Score: 0 to 100
    - Low Risk: < 30
    - Moderate Risk: 30 - 59
    - High Risk: >= 60
    """
    score = 0
    breakdown = {}

    # 1. Age
    if age < 35:
        age_score = 0
    elif 35 <= age <= 49:
        age_score = 20
    else:
        age_score = 30
    score += age_score
    breakdown["age"] = {"value": age, "points": age_score, "max": 30}

    # 2. Waist Circumference (South Asian specific cutoffs)
    if gender.lower() == "female":
        if waist_cm < 80:
            waist_score = 0
        elif 80 <= waist_cm <= 89:
            waist_score = 10
        else:
            waist_score = 20
    else:  # male
        if waist_cm < 80:
            waist_score = 0
        elif 80 <= waist_cm <= 89:
            waist_score = 10
        else:
            waist_score = 20
    score += waist_score
    breakdown["waist_circumference"] = {"value": waist_cm, "points": waist_score, "max": 20}

    # 3. Physical Activity
    if activity == "vigorous":
        activity_score = 0
    elif activity == "moderate":
        activity_score = 20
    else:  # sedentary
        activity_score = 30
    score += activity_score
    breakdown["physical_activity"] = {"value": activity, "points": activity_score, "max": 30}

    # 4. Family History of Diabetes
    if family_history == "none":
        fh_score = 0
    elif family_history == "one_parent":
        fh_score = 10
    else:  # both_parents
        fh_score = 20
    score += fh_score
    breakdown["family_history"] = {"value": family_history, "points": fh_score, "max": 20}

    # Stratification
    if score < 30:
        risk_level = "Low"
        recommendation = "Low probability of undiagnosed diabetes. Maintain active lifestyle, balanced traditional diet, and screen every 3 years."
    elif 30 <= score <= 50:
        risk_level = "Moderate"
        recommendation = "Moderate risk. Adopt lifestyle modifications (brisk walking, ICMR-NIN refined carbohydrate control) and consider annual blood glucose testing."
    else:
        risk_level = "High"
        recommendation = "High risk for diabetes or prediabetes. Clinically advised to undergo Fasting Blood Glucose (FBG) and HbA1c screening at the nearest PHC or diagnostic lab."

    return {
        "score": score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "breakdown": breakdown
    }
