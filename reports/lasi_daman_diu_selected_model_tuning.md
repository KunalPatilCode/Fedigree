# Fedigree Selected Model Tuning Report

**Status:** exploratory tuning; unweighted; not clinically validated.

Selected algorithms: Diabetes = Random Forest; CVD composite = Logistic Regression.
Tuning selection was based on 3-fold training-split CV ROC-AUC. The held-out test split was not used in hyperparameter search, but it has been examined in earlier work and is not independent external validation.

## diabetes — random_forest

### Best parameters

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

### Cross-validation performance (training split)

| Metric | Mean | Std (ROC-AUC only) |
|---|---:|---:|
| ROC-AUC | 0.8082 | 0.0096 |
| Balanced accuracy | 0.7375 | — |
| F1-score | 0.4895 | — |

### Hold-out metrics (baseline vs tuned)

| Metric | Baseline | Tuned |
|---|---:|---:|
| Accuracy | 0.7727 | 0.7172 |
| Balanced Accuracy | 0.6646 | 0.7477 |
| Sensitivity | 0.5000 | 0.7941 |
| Specificity | 0.8293 | 0.7012 |
| Precision | 0.3778 | 0.3553 |
| F1 Score | 0.4304 | 0.4909 |
| Roc Auc | 0.7165 | 0.7593 |

Confusion matrix baseline: TN=136, FP=28, FN=17, TP=17
Confusion matrix tuned: TN=115, FP=49, FN=7, TP=27

Tuned model artifact: `models\diabetes_random_forest_tuned_lasi_dd.joblib`

## Limitations

- Diabetes is self-reported diagnosed status, not future diabetes risk.
- CVD composite is report-defined: hypertension OR chronic heart disease OR stroke; not CAD-specific or a 10-year risk score.
- Metrics are unweighted and from one small regional sample.
- The held-out split has been examined previously. Do not claim independent validation.
- No tuning outcome guarantees improved clinical performance.
