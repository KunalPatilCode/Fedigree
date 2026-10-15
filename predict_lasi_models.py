"""Run inference smoke tests with explicitly fictional input profiles."""
from lasi_model_inference import (
    predict, diabetes_input_example, cvd_input_example,
)

EXAMPLES = [
    ("diabetes_logistic_regression", diabetes_input_example()),
    ("diabetes_random_forest", diabetes_input_example()),
    ("cvd_composite_logistic_regression", cvd_input_example()),
    ("cvd_composite_random_forest", cvd_input_example()),
]

if __name__ == "__main__":
    print("=== FEDIGREE LASI MODEL INFERENCE SMOKE TEST ===")
    print("WARNING: Fictional profiles; not clinical advice.\n")
    for model_key, sample in EXAMPLES:
        print(model_key)
        print(predict(model_key, sample))
        print("-" * 70)
