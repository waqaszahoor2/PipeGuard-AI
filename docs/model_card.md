# Model Card

## Status

**Not approved.**

No `approved_model.joblib` is included. The any-active-leak target derived from the
supplied leakage-flow columns is positive for 97.8% of 2018 and 100% of 2019.
Consequently, a latest chronological test period cannot measure two-class
classification performance.

## Intended use

Research and portfolio demonstration of:

- past-only hydraulic feature engineering;
- chronological and event-aware evaluation;
- calibrated probability and operational alert metrics;
- artifact validation and responsible deployment gating.

## Not intended for

- confirmed leak diagnosis;
- autonomous repair decisions;
- corrosion or wall-thickness estimation;
- direct transfer to a different utility;
- safety-critical operation without field validation.

## Approval criteria

The export pipeline requires a two-class validation and final test period, valid
PR-AUC, event recall, false-alarm and calibration metrics, deterministic API/notebook
consistency, and an explicit approval flag.
