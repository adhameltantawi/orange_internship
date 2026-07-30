# Superstore Sales & Profitability Analytics

> A complete end-to-end analytics project built on the classic Superstore dataset —
> from raw XLSX ingestion through interactive dashboard and executive summary.
>
> 📊 **Google Sheets Final Project**: [View Spreadsheet](https://docs.google.com/spreadsheets/d/1DzC_F7FBdHq74oyqFFGS8J7uRxDZ4gHD5_RjSmjgjBQ/edit?usp=sharing)

---

## Project Overview

This repository delivers a **full analytics pipeline** for a 4-year (2023–2026)
retail dataset covering ~10,200 transactions across the United States and Canada.
The analysis answers three core business questions:

1. **Where is money being lost** — and why?
2. **Which customers and products** drive the most value?
3. **What levers** can management pull to improve blended margin?

---

## Dataset

| Attribute | Detail |
|---|---|
| Source file | `ODC_Excel_Task.xlsx` |
| Sheets | **Orders** (10,194 rows × 21 cols), **People** (4 regional managers), **Return** (296 returned orders) |
| Date range | 2023-01-03 → 2026-12-30 |
| Geography | United States & Canada · 4 Regions · 49 States/Provinces |
| Products | 3 Categories · 17 Sub-Categories · 1,862 unique products |
| Customers | 800 unique · 5,111 unique orders |
| Financials | Sales $0.44–$22,638 · Profit –$6,600–$8,400 |

### Columns added during cleaning

| New Column | Description |
|---|---|
| `Order Year/Month/Quarter/Weekday` | Date parts for time-series analysis |
| `Shipping Delay` | Ship Date − Order Date (days) |
| `Profit Margin` | Profit / Sales |
| `Unit Price` | Sales / Quantity |
| `Order Value Bucket` | Low / Medium / High (Sales tertiles) |
| `Is_Negative_Profit` | Boolean flag |
| `Has_Discount` | Boolean flag |
| `Is_Returned` | Joined from the **Return** sheet |
| `Regional Manager` | Joined from the **People** sheet |

---

## Repository Structure

```
superstore-analytics/
├── README.md
├── data/
│   ├── raw/
│   │   ├── ODC_Excel_Task.xlsx        ← original 3-sheet workbook
│   │   └── ODC_Excel_Task.csv         ← legacy CSV (not used by scripts)
│   └── processed/
│       └── superstore_clean.csv       ← 10,194 rows × 33 cols
├── scripts/
│   ├── 01_data_cleaning.py            ← Phase 1: XLSX reader + feature eng.
│   ├── 02_eda.py                      ← Phase 2: EDA + 6 charts
│   └── 03_advanced_analysis.py        ← Phase 3: RFM, discount, heatmap
├── reports/
│   ├── eda_report.md                  ← 6-section EDA narrative
│   ├── advanced_insights.md           ← 6-section advanced narrative
│   └── figures/                       ← 11 PNG charts (120 dpi)
│       ├── 01_univariate_distributions.png
│       ├── 02_time_series.png
│       ├── 03_categorical_breakdowns.png
│       ├── 04_correlation_analysis.png
│       ├── 05_top_bottom.png
│       ├── 06_negative_profit.png
│       ├── 07_rfm_segments.png
│       ├── 08_subcat_margin_ranking.png
│       ├── 09_discount_sensitivity.png
│       ├── 10_region_segment_matrix.png
│       └── 11_shipping_performance.png
├── dashboard/
│   ├── superstore_dashboard.html      ← single-file interactive dashboard
│   └── data.json                      ← pre-aggregated chart data
└── outputs/
    └── executive_summary.md           ← 2-page business summary
```

---

## How to Reproduce

> **Requirements:** Python 3.9+ with `pandas`, `matplotlib`, `numpy`, `scipy`.
> No internet access is needed — the XLSX reader uses only Python built-ins.

```powershell
# From the superstore-analytics/ directory:

# Phase 1 — Clean & enrich (reads XLSX, writes superstore_clean.csv)
python scripts/01_data_cleaning.py

# Phase 2 — EDA (reads clean CSV, writes eda_report.md + 6 PNGs)
python scripts/02_eda.py

# Phase 3 — Advanced analysis (writes advanced_insights.md + 5 PNGs)
python scripts/03_advanced_analysis.py
```

### Open the Dashboard

The dashboard requires **no server** for data — it reads `data.json` via `fetch()`,
which means you need to open it through a simple local server:

```powershell
# From the dashboard/ directory:
python -m http.server 8080
# Then open: http://localhost:8080/superstore_dashboard.html
```

---

## Key Findings

| # | Finding | Metric |
|---|---|---|
| 1 | Total revenue over the 4-year period | **$2,326,534** |
| 2 | Total profit (blended margin 12.6%) | **$292,297** |
| 3 | Average YoY Sales growth | **+15.7%** |
| 4 | Orders with negative profit | **1,901 (18.6%)** |
| 5 | Returned orders | **296 (5.8%)** |
| 6 | Best-performing region | **West — $110,799 profit** (Sadie Pawthorne) |
| 7 | Discount threshold where margin turns negative | **>20% discount → –37% avg margin** |
| 8 | Highest-margin category | **Technology — 17.4% margin** |
| 9 | Lowest-margin category | **Furniture — 2.6% margin** |
| 10 | Sub-category with largest cumulative loss | **Binders — –$38,563** |

---

## Dashboard Features

The interactive dashboard (`dashboard/superstore_dashboard.html`) provides:

- **6 KPI cards**: Total Sales, Profit, Margin %, Orders, AOV, Returned Orders
- **Cross-filtering filters**: Year · Region · Category · Segment
- **Sales & Profit trend** (monthly line chart, 2023–2026)
- **Category & Sub-Category breakdowns** (grouped bar)
- **Region × Segment profit margin heatmap** (green/red color-coded)
- **Top 10 Products by Sales** (horizontal bar)
- **Discount vs Profit Margin scatter** (2,000-point sample)
- **Sales & Profit by Ship Mode** (bar chart)

---

## Notes

- The XLSX reader in `01_data_cleaning.py` uses only Python built-ins
  (`zipfile` + `xml.etree.ElementTree`) — no `openpyxl` required.
- Postal codes for New England states (e.g., MA, NH, RI) have leading-zero
  truncation in the source file — flagged in the cleaning output but not dropped.
- The `Is_Returned` flag joins on **Order ID** level; a single returned order
  may contain multiple line items (rows), so 296 returned orders → 800 flagged rows.

---

## Author

Superstore Analytics · Orange Internship · 2026
