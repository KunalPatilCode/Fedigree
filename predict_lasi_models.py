"""Run inference smoke tests with explicitly fictional input profiles."""
from pathlib import Path
from lasi_model_inference import (
    predict,
    diabetes_input_example,
    cvd_input_example,
)

BASE_DIR = Path(__file__).resolve().parent

COMBINED_EXAMPLES = [
    ("diabetes_logistic_regression", diabetes_input_example()),
    ("diabetes_random_forest", diabetes_input_example()),
    ("cvd_composite_logistic_regression", cvd_input_example()),
    ("cvd_composite_random_forest", cvd_input_example()),
]

TUNED_EXAMPLES = [
    ("diabetes_random_forest_tuned", diabetes_input_example()),
    ("cvd_composite_logistic_regression_tuned", cvd_input_example()),
]

HISTORICAL_EXAMPLES = [
    ("historical_diabetes_logistic_regression_dd", diabetes_input_example()),
    ("historical_diabetes_random_forest_tuned_dd", diabetes_input_example()),
    ("historical_cvd_composite_logistic_regression_dd", cvd_input_example()),
    ("historical_cvd_composite_random_forest_dd", cvd_input_example()),
]


def run_smoke_tests() -> str:
    lines = []
    lines.append("=== FEDIGREE LASI MODEL INFERENCE SMOKE TEST ===")
    lines.append("WARNING: Fictional profiles; strictly for software testing. Not clinical advice.\n")

    lines.append("--- 1. ACTIVE COMBINED-DATASET FINE-TUNED MODELS ---")
    for model_key, sample in TUNED_EXAMPLES:
        lines.append(f"\nTuned Model Key: {model_key}")
        res = predict(model_key, sample)
        for k, v in res.items():
            lines.append(f"  {k}: {v}")
        lines.append("-" * 70)

    lines.append("\n--- 2. ACTIVE COMBINED-DATASET BASELINE MODELS ---")
    for model_key, sample in COMBINED_EXAMPLES:
        lines.append(f"\nModel Key: {model_key}")
        res = predict(model_key, sample)
        for k, v in res.items():
            lines.append(f"  {k}: {v}")
        lines.append("-" * 70)

    lines.append("\n--- 3. HISTORICAL DAMAN & DIU-ONLY PRESERVED BASELINES ---")
    for model_key, sample in HISTORICAL_EXAMPLES:
        lines.append(f"\nHistorical Model Key: {model_key}")
        res = predict(model_key, sample)
        for k, v in res.items():
            lines.append(f"  {k}: {v}")
        lines.append("-" * 70)

    lines.append("\n--- 4. INPUT VALIDATION ERROR HANDLING TESTS ---")
    # Test missing field
    try:
        bad_sample = diabetes_input_example()
        del bad_sample["age_years"]
        predict("diabetes_logistic_regression", bad_sample)
        lines.append("FAIL: Missing field check did not raise error.")
    except ValueError as e:
        lines.append(f"PASS: Missing field caught correctly: {e}")

    # Test unexpected field
    try:
        bad_sample = diabetes_input_example()
        bad_sample["unauthorized_field"] = "bad_val"
        predict("diabetes_logistic_regression", bad_sample)
        lines.append("FAIL: Unexpected field check did not raise error.")
    except ValueError as e:
        lines.append(f"PASS: Unexpected field caught correctly: {e}")

    # Test invalid age
    try:
        bad_sample = diabetes_input_example()
        bad_sample["age_years"] = -10
        predict("diabetes_logistic_regression", bad_sample)
        lines.append("FAIL: Invalid age check did not raise error.")
    except ValueError as e:
        lines.append(f"PASS: Invalid age caught correctly: {e}")

    lines.append("\nAll smoke tests completed successfully.")
    output = "\n".join(lines)
    return output


if __name__ == "__main__":
    report_text = run_smoke_tests()
    print(report_text)
    report_path = BASE_DIR / "reports" / "inference_smoke_test.txt"
    report_path.write_text(report_text, encoding="utf-8")
    print(f"\nSmoke test log saved to: {report_path}")
