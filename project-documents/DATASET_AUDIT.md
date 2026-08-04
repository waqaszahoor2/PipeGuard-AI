# Dataset Audit Summary

Generated from the included research package.

## BattLeDIM L-Town

| Year | File family | Rows | Data columns | Missing values | Duplicate timestamps |
|---|---|---:|---:|---:|---:|
| 2018 | Pressures | 105,120 | 33 | 0 | 0 |
| 2018 | Flows | 105,120 | 3 | 0 | 0 |
| 2018 | Levels | 105,120 | 1 | 0 | 0 |
| 2018 | Demands | 105,120 | 82 | 0 | 0 |
| 2018 | Leakages | 105,120 | 14 | 0 | 0 |
| 2019 | Pressures | 105,120 | 33 | 0 | 0 |
| 2019 | Flows | 105,120 | 3 | 0 | 0 |
| 2019 | Levels | 105,120 | 1 | 0 | 0 |
| 2019 | Demands | 105,120 | 82 | 0 | 0 |
| 2019 | Leakages | 105,120 | 23 | 0 | 0 |

- 2018 any-active-leak positive rate: **97.80%**
- 2019 any-active-leak positive rate: **100.00%**
- Timestamp format parsed without failures.
- Measurements are aligned at five-minute intervals.
- 2018 leakage data contains 14 leaking-link columns; 2019 contains 23.

## Calgary public data

| Dataset | Rows | Core missing values |
|---|---:|---|
| Public Water Main | 60,740 | pressure zone: 1,466 |
| Water Main Breaks | 37,516 | break type: 17 |
| Community Boundaries | 313 | sector: 1; SRG: 60; structure: 1 |

## Modelling decision

The supplied any-active-leak definition produces a one-class latest chronological
period. The project therefore refuses to export an approved classifier or fabricate
final metrics. The complete training and approval pipeline remains included.
