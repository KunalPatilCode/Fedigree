# LASI Daman & Diu Exploratory Model Summary

See the full per-model documentation:

- [`MODEL_1_DIABETES.md`](../MODEL_1_DIABETES.md)
- [`MODEL_2_CVD_COMPOSITE.md`](../MODEL_2_CVD_COMPOSITE.md)
- [`MODEL_CONTRACT.md`](../MODEL_CONTRACT.md)

## Data audit
- Source rows: 991, all coded as Daman and Diu.
- Diabetes target `HT003`: 171 Yes, 815 No, 5 missing (986 usable records).
- LASI-defined CVD composite (`HT002` OR `HT006` OR `HT007`): 327 positive, 659 negative, 5 unknown (986 usable records).
- Chronic heart disease alone (`HT006`): 27 Yes among the 986 records with known heart-disease status.

## Hold-out metrics
Single 80/20 stratified split, `random_state=42`; metrics are unweighted and exploratory.

| Task | Algorithm | Accuracy | Sensitivity | Specificity | Precision | F1 | ROC-AUC | TN | FP | FN | TP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Diabetes | Logistic Regression | 69.70% | 55.88% | 72.56% | 29.69% | 38.78% | 0.7626 | 119 | 45 | 15 | 19 |
| Diabetes | Random Forest | 77.27% | 50.00% | 82.93% | 37.78% | 43.04% | 0.7159 | 136 | 28 | 17 | 17 |
| CVD composite | Logistic Regression | 73.23% | 57.58% | 81.06% | 60.32% | 58.91% | 0.7586 | 107 | 25 | 28 | 38 |
| CVD composite | Random Forest | 70.20% | 54.55% | 78.03% | 55.38% | 54.96% | 0.7312 | 103 | 29 | 30 | 36 |

## Interpretation
These results are not clinical performance claims. There is no independent test cohort, no external validation, and no survey-weighted analysis. The diabetes model classifies self-reported previous diagnosis, while the CVD model classifies a broad self-reported composite of hypertension, chronic heart disease, or stroke. It is not CAD-specific or a future risk score.
