# Superstore Sales — Exploratory Data Analysis

## Overview

This project performs a structured **Exploratory Data Analysis (EDA)** on the Superstore Sales dataset. The analysis covers end-to-end data profiling — from initial inspection and data-type validation through quality auditing, cleaning, and visual distribution analysis — producing a clean, analysis-ready dataset.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Dataset Description](#dataset-description)
3. [Analysis Pipeline](#analysis-pipeline)
4. [Key Findings](#key-findings)
5. [Technologies](#technologies)
6. [Getting Started](#getting-started)

---

## Project Structure

```
project_1/
├── dataset.csv                    # Raw Superstore Sales data (18 columns, ~9,800 rows)
├── superstoredataanalysis.ipynb   # Main analysis notebook
└── README.md                      # Project documentation
```

---

## Dataset Description

The dataset contains **9,800+ transactional records** from a US-based retail superstore, spanning orders across Furniture, Office Supplies, and Technology categories.

| Column | Type | Description |
|---|---|---|
| Row ID | Integer | Unique row identifier |
| Order ID | String | Unique order identifier |
| Order Date / Ship Date | Date | Order placement and shipment dates |
| Ship Mode | Categorical | Shipping method (Standard Class, Second Class, First Class, Same Day) |
| Customer ID / Customer Name | String | Customer identifiers |
| Segment | Categorical | Customer segment (Consumer, Corporate, Home Office) |
| Country / City / State | String | Geographic location |
| Postal Code | String | Postal code (converted from numeric) |
| Region | Categorical | Sales region (East, West, South, Central) |
| Product ID / Product Name | String | Product identifiers |
| Category / Sub-Category | Categorical | Product classification |
| Sales | Float | Revenue generated per transaction |

---

## Analysis Pipeline

The notebook follows a systematic, section-by-section workflow. Every code block is preceded by a markdown cell explaining the objective and the expected outcome.

### Phase 1 — Data Profiling

| Step | Description |
|---|---|
| Shape & Preview | Inspect dimensions, head/tail rows |
| Data Types | Review dtypes via `info()` and `dtypes` |
| Type Corrections | Convert date columns to `datetime`; cast `Postal Code` to `string` |
| Feature Engineering | Derive `Days to Ship` (shipping duration) and `Order Month` |

### Phase 2 — Descriptive Statistics

| Step | Description |
|---|---|
| Numerical Summary | `describe()` for central tendency, spread, and range |
| Categorical Summary | `describe(include='object')` for frequency and cardinality |
| Combined Summary | Transposed `describe(include='all')` for a unified view |

### Phase 3 — Data Quality Audit & Cleaning

| Issue | Detection Method | Resolution |
|---|---|---|
| Missing Values | `isnull().sum()` + heatmap visualization | Filled `Postal Code` nulls with `05401` (Burlington, VT) |
| Duplicate Rows | `duplicated().sum()` | Dropped exact duplicates; reset index |
| Leading/Trailing Whitespace | Compared raw vs. `.str.strip()` per column | Stripped all object-type columns |
| Spelling & Casing Inconsistencies | Printed unique values for key categorical columns | Standardized to Title Case |
| Outliers | IQR method with boxplot visualization | Capped `Sales` at upper IQR fence (Winsorization) |

### Phase 4 — Distribution Analysis

| Type | Visualizations |
|---|---|
| Numerical | Histograms with KDE, box-marginal plots for `Sales` and `Days to Ship` |
| Categorical | Bar charts for `Category`, `Sub-Category`, `Ship Mode`, Top 10 States |
| Categorical | Donut charts for `Segment` and `Region` |
| Cross-analysis | Overlaid histogram of `Sales` segmented by `Category` |

---

## Key Findings

- **Postal Code nulls** — All 11 missing values belonged to Burlington, Vermont; resolved with code `05401`.
- **Sales distribution** — Heavily right-skewed; the majority of transactions fall below $500, with outliers exceeding $5,000.
- **Shipping** — Standard Class is the dominant shipping mode (~60% of orders). Most orders ship within 3–5 days.
- **Category split** — Office Supplies leads in order volume, while Technology leads in average order value.
- **Geographic concentration** — California, New York, and Texas account for the highest order counts.

---

## Technologies

| Library | Version | Purpose |
|---|---|---|
| Python | 3.x | Core language |
| pandas | — | Data manipulation and analysis |
| numpy | — | Numerical computation |
| matplotlib | — | Static plots and subplots |
| seaborn | — | Statistical visualizations |
| plotly | — | Interactive charts (histograms, bar, pie) |

---

## Getting Started

### Prerequisites

```bash
pip install pandas numpy matplotlib seaborn plotly
```

### Run the Notebook

```bash
jupyter notebook superstoredataanalysis.ipynb
```

Then select **Kernel > Restart & Run All** to execute the full pipeline.

---

## Notes

- The notebook is structured with **markdown documentation between every two code blocks** for full readability.
- All detected data quality issues are **diagnosed and resolved in-place** within the notebook.
- The final cleaned dataset is ready for downstream tasks such as dashboarding, forecasting, or predictive modeling.