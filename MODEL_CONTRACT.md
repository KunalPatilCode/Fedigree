# Fedigree Model 1 — Input/Output Contract

## Status

This contract matches the current experimental pipeline trained on **synthetic labels**. It is for software integration testing only, not clinical use. When a real approved dataset is available, revise the schema and retrain/evaluate together.

## Required input fields (9)

| Field | Type | Allowed values / validation |
|---|---|---|
| `age_years` | integer | 18–120 for this prototype |
| `bmi_kg_m2` | number | 10–80 for this prototype |
| `waist_circumference_cm` | number | 30–250 for this prototype |
| `family_history_diabetes` | integer | 0 or 1 |
| `hypertension_history` | integer | 0 or 1 |
| `tobacco_use` | integer | 0 or 1 |
| `sex` | string | `Male`, `Female` (categories in current synthetic training data only) |
| `physical_activity_level` | string | `Low`, `Moderate`, `High` |
| `diet_pattern` | string | `Balanced`, `Mixed`, `High_sugar_processed` |

`family_history_diabetes`, `hypertension_history`, and `tobacco_use`: `0` means no and `1` means yes in this prototype schema.

## Example JSON request

```json
{
  "age_years": 45,
  "bmi_kg_m2": 27.0,
  "waist_circumference_cm": 90.0,
  "family_history_diabetes": 1,
  "hypertension_history": 0,
  "tobacco_use": 0,
  "sex": "Male",
  "physical_activity_level": "Low",
  "diet_pattern": "Mixed"
}
```

## Output fields

- `model_name`: `logistic_regression` or `random_forest`
- `predicted_synthetic_label`: `0` or `1`, based on artificial training labels
- `synthetic_positive_label_probability`: model score for synthetic class 1; **not** a clinical risk percentage
- `model_status`: `experimental_synthetic_data_only`
- `notice`: warning explaining limitations

## Integration notes

- Backend should pass all nine fields and preserve the exact field names/categories.
- Do not expose the synthetic class/probability as a real-world diabetes diagnosis or medical risk assessment.
- Do not use `joblib` artifacts from an untrusted source. Pin the Python/scikit-learn environment for reproducibility.
- On receipt of approved clinical data, inspect its codebook/labels and data-use terms; update the schema, retrain and evaluate before enabling any clinical claims.
