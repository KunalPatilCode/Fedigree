# Fedigree LASI Model Comparison — Current Final Selection

| Task | Selected artifact | Selection rationale | Status |
|---|---|---|---|
| Diabetes diagnosis | `models/diabetes_random_forest_tuned_lasi_dd.joblib` | Sensitivity 79.41%, F1 49.09%, ROC-AUC 0.7593; false negatives 7. Trade-off: accuracy 71.72%, specificity 70.12%, false positives 49. | Sensitivity-focused experimental candidate |
| CVD composite | `models/cvd_composite_logistic_regression_lasi_dd.joblib` | Baseline is better than CVD Random Forest on listed metrics in the current split. Accuracy 73.23%, sensitivity 57.58%, F1 58.91%, ROC-AUC 0.7586. | Baseline retained; no tuning selected |

All figures are exploratory, unweighted metrics from a single stratified 80/20 split in a Daman & Diu survey subset. The split was inspected during model selection and is not independent validation. Models are not clinically validated and must not be used for medical decisions.
