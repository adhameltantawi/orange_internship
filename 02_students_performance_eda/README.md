# 📊 From Fails to A's — Student Performance Analytics

[![Kaggle](https://img.shields.io/badge/View%20on-Kaggle-20BEFF?logo=kaggle&logoColor=white)](https://www.kaggle.com/code/adhameltantawi/students-performance-eda-clean-structured-anal)

> 🔗 **Kaggle Notebook:** [students-performance-eda-clean-structured-anal](https://www.kaggle.com/code/adhameltantawi/students-performance-eda-clean-structured-anal)

---

## Overview

This project performs a structured **Exploratory Data Analysis (EDA)** on the *Students Performance in Exams* dataset. The analysis follows a six-phase pipeline — **Setup → Data Cleaning → Feature Engineering → EDA → Insights → Recommendations** — producing a clean, well-documented notebook with 10 targeted questions answered with evidence.

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
02_students_performance_eda/
├── students_performance.csv        # Raw dataset (1,000 student records, 8 columns)
├── students_performance_eda.ipynb  # Main analysis notebook
└── README.md                       # Project documentation (this file)
```

---

## Dataset Description

The dataset contains **1,000 student records** with demographic information and exam scores across three subjects.

| Column | Type | Description |
|---|---|---|
| gender | Categorical | Student gender (male / female) |
| race/ethnicity | Categorical | Ethnic group (group A – E) |
| parental level of education | Categorical | Highest education level of parent |
| lunch | Categorical | Lunch program type (standard / free-reduced) |
| test preparation course | Categorical | Whether the student completed a prep course |
| math score | Integer | Math exam score (0–100) |
| reading score | Integer | Reading exam score (0–100) |
| writing score | Integer | Writing exam score (0–100) |

**Engineered Features** (created during analysis):

| Column | Description |
|---|---|
| total_score | Sum of math + reading + writing (max 300) |
| percentage | `total_score / 300 × 100` — overall percentage |
| grade | Letter grade (A–F) using `pd.cut` |
| result | Pass (percentage ≥ 50) / Fail |

---

## Analysis Pipeline

The notebook follows a systematic, section-by-section workflow. Every code block is preceded by a markdown cell explaining the objective and expected outcome.

### Phase 1 — Setup & Data Loading

| Step | Description | Result |
|---|---|---|
| Import Libraries | Load pandas, numpy, plotly | All libraries ready |
| Configuration | Define `COLORS`, `EDU_ORDER`, `GRADE_COLORS` | Centralised style constants |
| Helper Functions | `style()`, `plot_bar()`, `plot_pie()`, `plot_hist_by_group()`, `compare_groups()`, `profile_segment()`, `investigate_extreme_scores()` | Reusable modular functions |
| Load Dataset | Auto-detect local / Kaggle path | 1,000 rows × 8 columns |

### Phase 2 — Data Quality Audit & Cleaning

| Step | Description | Result |
|---|---|---|
| Data Types | `info()` and `dtypes` | 5 object + 3 int64 |
| Descriptive Statistics | `describe(include='all').T` | Central tendency & spread |
| Missing Values | `isnull().sum()` per column | ✅ Zero nulls found |
| Duplicate Rows | `duplicated().sum()` | ✅ Zero duplicates found |
| Whitespace | Strip & inspect all object columns | ✅ No whitespace issues |
| Spelling & Casing | Printed unique values for all categoricals | ✅ Consistent — no fixes needed |
| Column Standardisation | Renamed to `snake_case`; ensured numeric dtypes | ✅ Done |

### Phase 3 — Feature Engineering

| Step | Description |
|---|---|
| Derived Columns | `total_score`, `percentage`, `grade` (via `pd.cut`), `result` |
| Extreme Score Investigation | Examine zero-score and perfect-score students |
| Note on Outliers | Zero scores are **real students who failed** — kept as-is |

### Phase 4 — Exploratory Data Analysis

| Type | Visualisations |
|---|---|
| Numerical | Histograms with marginal box plots; percentage by test prep |
| Skewness & Kurtosis | Quantified deviation from normality |
| Categorical | Bar charts for gender, education, test prep; donut charts for race/ethnicity, lunch |
| Grade Distribution | Bar chart (A–F); grade × gender cross-tab |
| Pass/Fail | Donut chart of overall pass rate |
| Correlation | Heatmap of score columns |
| Scatter Matrix | Pair plot coloured by gender |
| Box Plots | Score distributions by gender |
| Sunburst | Hierarchical: Gender → Lunch → Test Prep |

### Phase 5 — Insights (10 Questions Answered)

| # | Question | Key Finding |
|---|---|---|
| Q1 | Do females outperform males? | Males lead Math; Females lead Reading & Writing |
| Q2 | Does parental education affect scores? | Yes — clear positive linear trend |
| Q3 | Does the test prep course help? | Yes — 5–8 point boost across all subjects |
| Q4 | Does lunch type impact performance? | Largest gap (~10–12 pts); socio-economic proxy |
| Q5 | Which ethnic group scores highest? | Group E highest; Group A lowest |
| Q6 | Are the three scores correlated? | Reading & Writing ≈ 0.95; Math ≈ 0.80 |
| Q7 | A-Grade vs. F-Grade — what separates them? | Standard lunch + test prep + educated parents vs. the opposite |
| Q8 | Lunch × test prep interaction? | Standard + completed = best combo; prep partially offsets low SES |
| Q9 | Gender × test prep interaction? | Prep course benefits both genders equally |
| Q10 | Are low-scoring students real outliers? | No — they are real struggling students; removing them would be wrong |

---

## Key Findings

- **No data quality issues** — zero nulls, zero duplicates, no whitespace or spelling problems.
- **Gender gap** — Males lead in Math; Females lead in Reading and Writing.
- **Parental education matters** — Higher parental education → higher student scores (linear trend).
- **Test prep course works** — Students who completed it scored 5–8 points higher across all subjects.
- **Lunch type is the strongest predictor** — Standard lunch students outperform free/reduced by ~10–12 points (socio-economic proxy).
- **Group E** tops all racial/ethnic groups; **Group A** scores lowest.
- **Reading & Writing** are near-perfectly correlated (r ≈ 0.95); Math is related but more independent.
- **Zero scores are valid data** — they represent students who genuinely struggled, not data errors.
- **Combined effect** — Standard lunch + prep course is the best combination; the prep course can partially offset low socio-economic status.

---

## Technologies

| Library | Purpose |
|---|---|
| Python 3.x | Core language |
| pandas | Data manipulation and analysis |
| numpy | Numerical computation |
| plotly | Interactive charts (histograms, bar, pie, scatter, heatmap, sunburst) |

---

## Getting Started

### Prerequisites

```bash
pip install pandas numpy plotly
```

### Run Locally

```bash
jupyter notebook students_performance_eda.ipynb
```

Then select **Kernel > Restart & Run All** to execute the full pipeline.

### Run on Kaggle

Click the badge below to open the notebook directly on Kaggle:

[![Kaggle](https://img.shields.io/badge/Open%20in-Kaggle-20BEFF?logo=kaggle&logoColor=white)](https://www.kaggle.com/code/adhameltantawi/students-performance-eda-clean-structured-anal)

---

## Notes

- The notebook uses **helper functions** (`plot_bar`, `plot_pie`, `compare_groups`, etc.) to keep code DRY and modular.
- All visualisations use `plotly.express` with a **dark theme** (`plotly_dark`) for clean, interactive charts.
- **Zero scores are preserved intentionally** — removing them would hide the students who need the most educational support.
- The final cleaned dataset is ready for downstream tasks such as dashboarding, predictive modelling, or reporting.
