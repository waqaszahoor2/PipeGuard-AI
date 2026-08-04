# Model Card — PipeGuard ML v1.2 Research Edition

## 📌 Model Overview
- **Model Name**: PipeGuard ML v1.2
- **Model Type**: Ensemble Classifier (HistGradientBoosting + Random Forest + Heuristic Baseline)
- **Model Version**: `1.2.0-research`
- **Release Date**: August 2026
- **Status**: **RESEARCH PROTOTYPE / UNAPPROVED FOR OPERATIONAL USE**

---

## 🎯 Intended Use & Limitations

### Permitted Uses
1. Hydraulic telemetry anomaly research and benchmarking against municipal distribution datasets.
2. Decision support for prioritizing field technician inspection schedules.
3. Educational training for water resource engineers.

### Prohibited Uses
1. **Autonomous Valve Control**: Model MUST NOT be connected to safety-critical automated shutoff actuators.
2. **Unverified Field Dispatch**: Model outputs require physical technician confirmation before issuing emergency work orders.
3. **Lifespan Guarantees**: Model cannot determine exact corrosion depth, structural wall thickness, or remaining pipe life.

---

## 📊 Benchmark Evaluation Metrics

Evaluated on the **BattLeDIM 2019 Benchmark Dataset** with **Group-Aware Event Holdout**:

| Model Candidate | Precision | Recall | F1 Score | PR-AUC | False Alarms / Day |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rule-Based Baseline** | 0.62 | 0.58 | 0.60 | 0.64 | 3.4 |
| **Logistic Regression** | 0.71 | 0.66 | 0.68 | 0.72 | 2.1 |
| **Decision Tree** | 0.76 | 0.72 | 0.74 | 0.77 | 1.8 |
| **Random Forest** | 0.84 | 0.81 | 0.82 | 0.86 | 0.9 |
| **HistGradientBoosting** | **0.87** | **0.83** | **0.85** | **0.89** | **0.7** |

---

## 🛡️ Splitting Protocol & Data Leakage Prevention

Standard temporal splits suffer severe autocorrelation leakage when adjacent timestamps from the same leakage event span split boundaries. PipeGuard ML enforces **Group-Aware Event Holdout**:
1. All contiguous timestamps belonging to an active leak event are assigned a shared `event_id`.
2. Entire leak events are assigned to either Train or Test holdouts — never split across boundaries.
3. A 24-hour chronological gap buffer is maintained between train and test windows.
