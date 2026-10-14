# Fedigree — Final Model Selection and Diabetes Fine-Tuning Summary

**Dataset:** LASI Wave 1 Individual Daman & Diu extract (991 rows; 986 usable target labels per task). **All metrics are exploratory, unweighted, and not clinical validation.**

## Final engineering selection

- **Model 1 — Diabetes:** use the latest tuned Random Forest artifact `models/diabetes_random_forest_tuned_lasi_dd.joblib` as a sensitivity-focused experimental candidate.
- **Model 2 — CVD composite:** retain the original baseline Logistic Regression artifact `models/cvd_composite_logistic_regression_lasi_dd.joblib`. Do not select or overwrite it with a tuned CVD candidate.

## Diabetes Random Forest: baseline vs latest tuned run

| Metric | Baseline Random Forest | Latest tuned Random Forest |
|---|---:|---:|
| Accuracy | 77.27% | 71.72% |
| Balanced accuracy | 66.46% | 74.77% |
| Sensitivity / recall-positive | 50.00% | 79.41% |
| Specificity | 82.93% | 70.12% |
| Precision | 37.78% | 35.53% |
| F1-score | 43.04% | 49.09% |
| ROC-AUC | 0.7165 | 0.7593 |
| TN | 136 | 115 |
| FP | 28 | 49 |
| FN | 17 | 7 |
| TP | 17 | 27 |

The current tuned run has higher sensitivity, balanced accuracy, F1 and ROC-AUC compared with baseline, but lower accuracy/specificity and more false positives. It identifies more positive reported-diagnosis cases but generates more false alarms. This trade-off must be understood; it is not an across-the-board improvement.

### Latest tuning procedure and selected settings

- Sampled Random Forest parameter search.
- 3-fold `StratifiedKFold` CV, within the training split only.
- Selection metric: mean CV ROC-AUC.
- Best mean CV ROC-AUC: 0.8082326; standard deviation 0.0096056.
- Best mean CV balanced accuracy: 0.7375405.
- Best mean CV F1: 0.489451.

Selected parameters:

```json
{
  "model__n_estimators": 200,
  "model__min_samples_split": 15,
  "model__min_samples_leaf": 8,
  "model__max_features": "sqrt",
  "model__max_depth": 4,
  "model__class_weight": "balanced"
}
```

Selected artifact: `models/diabetes_random_forest_tuned_lasi_dd.joblib`.

## CVD composite: keep baseline Logistic Regression

| Metric | Selected baseline Logistic Regression | Baseline Random Forest comparison |
|---|---:|---:|
| Accuracy | 73.23% | 69.70% |
| Balanced accuracy | 69.32% | 65.91% |
| Sensitivity | 57.58% | 54.55% |
| Specificity | 81.06% | 77.27% |
| Precision | 60.32% | 54.55% |
| F1-score | 58.91% | 54.55% |
| ROC-AUC | 0.7586 | 0.7316 |
| TN | 107 | 102 |
| FP | 25 | 30 |
| FN | 28 | 30 |
| TP | 38 | 36 |

No further tuning is selected for Model 2. This choice is provisional and meant for the engineering prototype only.

## Diabetes baseline comparison reference

| Metric | Logistic Regression baseline | Random Forest baseline |
|---|---:|---:|
| Accuracy | 69.70% | 77.27% |
| Balanced accuracy | 64.22% | 66.46% |
| Sensitivity | 55.88% | 50.00% |
| Specificity | 72.56% | 82.93% |
| Precision | 29.69% | 37.78% |
| F1-score | 38.78% | 43.04% |
| ROC-AUC | 0.7626 | 0.7165 |

## Model smoke test

The latest local run showed all four inference keys generated structured results using fictional example profiles. These are software smoke tests, not evaluation on true held-out respondents.

## Critical interpretation limits

- Diabetes predicts LASI self-reported diagnosis (`HT003`), not future diabetes onset.
- CVD composite is self-reported hypertension OR chronic heart disease OR stroke; it is not CAD-specific or future 10-year risk.
- Test metrics are unweighted; LASI survey weights, strata and clusters were not applied.
- The hold-out set was inspected during prior model selection, so these metrics are not an independent final estimate. Use a prespecified untouched test set or external validation before making stronger performance claims.
- Do not treat class probabilities as calibrated individual risk percentages.
- Do not use for diagnosis, triage, or medical decisions. Do not publicly upload row-level LASI data or identifiers.
