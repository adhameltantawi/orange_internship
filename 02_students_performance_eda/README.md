# 📊 Students Performance in Exams — Exploratory Data Analysis

## Overview

This project performs a structured **Exploratory Data Analysis (EDA)** on the *Students Performance in Exams* dataset. The analysis follows a three-phase pipeline — **Data Cleaning → EDA → Insights** — producing a clean, well-documented, analysis-ready notebook with 10 business-style questions answered with evidence.

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
| total_score | Sum of math + reading + writing |
| average_score | Mean of the three scores |
| result | Pass (avg ≥ 50) / Fail |
| grade | Letter grade (A–F) |

---

## Analysis Pipeline

The notebook follows a systematic, section-by-section workflow. Every code block is preceded by a markdown cell explaining the objective and the expected outcome.

### Phase 1 — Data Cleaning

| Step | Description | Result |
|---|---|---|
| Shape & Preview | Inspect dimensions, head/tail rows | 1,000 rows × 8 columns |
| Data Types (`dtypes`) | Review dtypes via `info()` and `dtypes` | 5 object + 3 int64 |
| Descriptive Statistics | `describe()` for numerical & categorical | Central tendency & spread |
| Missing Values | `isnull().sum()` per column | ✅ Zero nulls found |
| Duplicate Rows | `duplicated().sum()` | ✅ Zero duplicates found |
| Whitespace | Compared raw vs. `.str.strip()` per column | ✅ No whitespace issues |
| Spelling & Casing | Printed unique values for all categorical columns | ✅ Consistent — no fixes needed |
| Format Standardisation | Renamed columns to `snake_case`; ensured integer dtypes | ✅ Columns renamed |
| Feature Engineering | Created `total_score`, `average_score`, `result`, `grade` | 4 new columns added |
| Outlier Detection | IQR method with box plot visualisation | Outliers found in lower tails |
| Outlier Treatment | Winsorization (capping at IQR fences) | ✅ Outliers capped |

### Phase 2 — Exploratory Data Analysis

| Type | Visualisations |
|---|---|
| Numerical | Histograms with marginal box plots for each score; average score violin |
| Skewness & Kurtosis | Quantified deviation from normality |
| Categorical | Bar charts for gender, parental education, test prep; donut charts for race/ethnicity, lunch type |
| Grade Distribution | Bar chart of letter grades (A–F) |
| Pass/Fail | Donut chart of overall pass rate |
| Correlation | Heatmap of score columns |
| Scatter Matrix | Pair plot coloured by gender |
| Cross-analysis | Grouped box plots (gender × scores), violin plots (test prep × scores), grouped bars (education × scores, lunch × scores, race × scores) |
| Sunburst | Hierarchical view: Gender → Lunch → Test Prep |

### Phase 3 — Insights (10 Questions Answered)

| # | Question | Key Finding |
|---|---|---|
| Q1 | Do females outperform males? | Males lead Math; Females lead Reading & Writing |
| Q2 | Does parental education affect scores? | Yes — clear positive linear trend |
| Q3 | Does the test prep course help? | Yes — 5–8 point boost across all subjects |
| Q4 | Does lunch type impact performance? | Largest gap (~10–12 pts); socio-economic proxy |
| Q5 | Which ethnic group scores highest? | Group E highest; Group A lowest |
| Q6 | Are the three scores correlated? | Reading & Writing ≈ 0.95; Math ≈ 0.80 |
| Q7 | What defines the top 10%? | Female, standard lunch, prep course, educated parents |
| Q8 | What defines the bottom 10%? | Male, free/reduced lunch, no prep, lower parent education |
| Q9 | Lunch × test prep interaction? | Standard + completed = best combo; prep partially offsets low SES |
| Q10 | Gender × test prep interaction? | Prep course benefits both genders equally |

---

## Key Findings

- **No data quality issues** — zero nulls, zero duplicates, no whitespace or spelling problems.
- **Gender gap** — Males lead in Math; Females lead in Reading and Writing.
- **Parental education matters** — Higher parental education → higher student scores (linear trend).
- **Test prep course works** — Students who completed it scored 5–8 points higher across all subjects.
- **Lunch type is the strongest predictor** — Standard lunch students outperform free/reduced by ~10–12 points (socio-economic proxy).
- **Group E** tops all racial/ethnic groups; **Group A** scores lowest.
- **Reading & Writing** are near-perfectly correlated (r ≈ 0.95); Math is related but more independent.
- **Combined effect** — Standard lunch + prep course is the best combination; the prep course can partially offset low socio-economic status.

---

## Technologies

| Library | Purpose |
|---|---|
| Python 3.x | Core language |
| pandas | Data manipulation and analysis |
| numpy | Numerical computation |
| plotly | Interactive charts (histograms, bar, pie, scatter, heatmap, sunburst) |
| scipy | Statistical functions (skewness, kurtosis) |

---

## Getting Started

### Prerequisites

```bash
pip install pandas numpy plotly scipy
```

### Run the Notebook

```bash
jupyter notebook students_performance_eda.ipynb
```

Then select **Kernel > Restart & Run All** to execute the full pipeline.

---

## Notes

- The notebook is structured with **markdown documentation between every two code blocks** for full readability.
- All detected data quality issues are **diagnosed and resolved in-place** within the notebook.
- Visualisations use `plotly.express` with a **dark theme** (`plotly_dark`) for clean, interactive charts.
- The final cleaned dataset is ready for downstream tasks such as dashboarding, predictive modelling, or reporting.
