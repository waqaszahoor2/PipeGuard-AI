# PipeGuard AI — Data Dictionary & Telemetry Schema

This document defines all data fields, units, telemetry metrics, and risk calculation formulas used within PipeGuard AI.

---

## 🚰 Pipeline Asset Attributes (`PipelineAsset`)

| Attribute | Data Type | Units | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `pipe_id` | String | - | Unique municipal pipe identifier | `PIPE-CAL-1001` |
| `location` | String | - | Street address or geographic landmark | `14th St & 8th Ave SW, Calgary` |
| `zone` | String | - | Municipal pressure management zone | `DOWNTOWN` |
| `latitude` | Float | Decimal Deg | WGS84 latitude coordinate | `51.0458` |
| `longitude` | Float | Decimal Deg | WGS84 longitude coordinate | `-114.0892` |
| `installation_year`| Integer | Year (YYYY) | Original installation date | `1978` |
| `pipe_age` | Integer | Years | Calculated age (`2026 - installation_year`)| `48` |
| `material` | Enum String | - | Pipe wall material (`Cast Iron`, `Ductile Iron`, `PVC`, `Steel`, `Polyethylene`, `Concrete`) | `Cast Iron` |
| `diameter_mm` | Integer | Millimeters | Nominal internal diameter | `300` |
| `length_m` | Float | Meters | Physical segment length | `245.5` |
| `max_capacity_lps` | Float | Liters/sec | Maximum rated hydraulic flow capacity | `320.0` |
| `pressure_bar` | Float | bar | Operating line pressure | `3.2` |
| `flow_rate_lps` | Float | Liters/sec | Current discharge flow rate | `185.4` |
| `temperature_c` | Float | °Celsius | Fluid temperature | `11.2` |
| `operational_status`| Enum String | - | Operating status (`Active`, `Maintenance Required`, `Under Repair`, `Inactive`) | `Maintenance Required` |
| `inspection_status` | Enum String | - | Field verification status (`Passed`, `Scheduled`, `Pending Review`, `Failed - Action Required`) | `Failed - Action Required` |
| `risk_score` | Integer | 0 - 100 | Composite vulnerability risk index | `88` |
| `risk_level` | Enum String | - | Severity classification (`Low`, `Medium`, `High`, `Critical`) | `Critical` |
| `last_inspection_date`| Date String| YYYY-MM-DD | Date of last field inspection | `2025-11-14` |

---

## 🧮 Risk Score Calculation Formula

$$\text{Risk Index} = \min\Big(99, \max\big(5, S_{\text{pressure}} + S_{\text{flow}} + S_{\text{age}} + S_{\text{material}}\big)\Big)$$

Where:
- **$S_{\text{pressure}}$**: Added risk from pressure drop ($+40$ for $>1.5\text{ bar}$, $+20$ for $>0.5\text{ bar}$).
- **$S_{\text{flow}}$**: Added risk from flow rate variation ($+25$ for $>35\text{ L/s}$, $+12$ for $>15\text{ L/s}$).
- **$S_{\text{age}}$**: Added risk from pipe age ($+22$ for Cast Iron $>50\text{ years}$, $+12$ for Cast Iron $>30\text{ years}$).
- **$S_{\text{material}}$**: Material vulnerability weighting.
