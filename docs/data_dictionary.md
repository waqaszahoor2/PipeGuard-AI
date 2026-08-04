# Data Dictionary

## BattLeDIM research module

| Field family | Unit | Role |
|---|---|---|
| Timestamp | five-minute datetime | time index |
| 33 pressure node columns | metres | predictor |
| 3 flow link columns | m³/h | predictor |
| T1 | metres | tank-level predictor |
| 82 demand node columns | L/h | contextual predictor |
| leakage pipe columns | m³/h | target source |

## Calgary public asset module

| Field | Meaning |
|---|---|
| globalid | stable public asset identifier |
| p_zone | pressure-zone category |
| status_ind | asset status |
| length | segment length in metres |
| diam | diameter in millimetres |
| material | recorded material |
| year | installation year |
| multilinestring | WGS84 line geometry |

Pipe age is calculated from the recorded installation year and a stated reference
year. It is not predicted by AI.
