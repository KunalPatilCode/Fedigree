export interface IDRSInput {
  age: number;
  gender: "male" | "female";
  waistCm: number;
  activity: "vigorous" | "moderate" | "sedentary";
  familyHistory: "none" | "one_parent" | "both_parents";
}

export interface IDRSResult {
  score: number;
  riskLevel: "Low" | "Moderate" | "High";
  recommendation: string;
  breakdown: {
    age: { value: number; points: number; max: number };
    waist: { value: number; points: number; max: number };
    activity: { value: string; points: number; max: number };
    familyHistory: { value: string; points: number; max: number };
  };
}

/**
 * Validated Indian Diabetes Risk Score (IDRS)
 * Developed by Madras Diabetes Research Foundation (Dr. V. Mohan / ICMR)
 */
export function calculateClientIDRS(input: IDRSInput): IDRSResult {
  let score = 0;

  // 1. Age
  let agePoints = 0;
  if (input.age < 35) {
    agePoints = 0;
  } else if (input.age <= 49) {
    agePoints = 20;
  } else {
    agePoints = 30;
  }
  score += agePoints;

  // 2. Waist circumference (South Asian phenotypic cutoffs)
  let waistPoints = 0;
  if (input.gender === "female") {
    if (input.waistCm < 80) waistPoints = 0;
    else if (input.waistCm <= 89) waistPoints = 10;
    else waistPoints = 20;
  } else {
    if (input.waistCm < 80) waistPoints = 0;
    else if (input.waistCm <= 89) waistPoints = 10;
    else waistPoints = 20;
  }
  score += waistPoints;

  // 3. Physical activity
  let actPoints = 0;
  if (input.activity === "vigorous") actPoints = 0;
  else if (input.activity === "moderate") actPoints = 20;
  else actPoints = 30; // sedentary
  score += actPoints;

  // 4. Family history
  let fhPoints = 0;
  if (input.familyHistory === "none") fhPoints = 0;
  else if (input.familyHistory === "one_parent") fhPoints = 10;
  else fhPoints = 20; // both parents
  score += fhPoints;

  let riskLevel: "Low" | "Moderate" | "High" = "Low";
  let recommendation = "";

  if (score < 30) {
    riskLevel = "Low";
    recommendation = "Low likelihood of undiagnosed diabetes. Maintain active routine, balanced whole-grain diet, and re-screen every 3 years.";
  } else if (score <= 50) {
    riskLevel = "Moderate";
    recommendation = "Moderate risk. Adopt daily brisk walking (30 mins), reduce refined sugars/flour, and consider annual fasting blood glucose screening.";
  } else {
    riskLevel = "High";
    recommendation = "High risk for diabetes or prediabetes. Clinically recommended to get Fasting Plasma Glucose (FPG) and HbA1c tests done at a local PHC or clinic.";
  }

  return {
    score,
    riskLevel,
    recommendation,
    breakdown: {
      age: { value: input.age, points: agePoints, max: 30 },
      waist: { value: input.waistCm, points: waistPoints, max: 20 },
      activity: { value: input.activity, points: actPoints, max: 30 },
      familyHistory: { value: input.familyHistory, points: fhPoints, max: 20 },
    },
  };
}
