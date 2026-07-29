# Project Plan — Superstore Sales & Profitability Analytics

This plan breaks the engagement into **7 phases**. Each phase is a self-contained
prompt: paste it into a fresh (or the same) Claude conversation, one at a time.
Every phase reads its inputs from files on disk and writes its outputs back to
disk — so context never has to hold the whole project at once, and you never
hit a length/token limit mid-analysis. Phase 6 merges everything into the final
deliverable.

**Dataset already profiled (Phase 0 complete):**
- 10,194 rows × 21 columns, 0 nulls, 0 duplicate rows
- Order Date range: 2023-01-03 → 2026-12-30
- Country/Region: United States, Canada | Region: West/East/South/Central
- Segment: Consumer/Corporate/Home Office | Category: Office Supplies/Furniture/Technology (17 sub-categories)
- 804 unique customers, 5,111 unique orders
- Sales range $0.44–$22,638 | Profit range -$6,600–$8,400 | ~1,901 rows (18.6%) have negative profit

**Repo structure this plan builds toward:**
```
superstore-analytics/
├── README.md
├── PROJECT_PLAN.md
├── data/
│   ├── raw/ODC_Excel_Task.csv
│   └── processed/superstore_clean.csv
├── scripts/
│   ├── 01_data_cleaning.py
│   ├── 02_eda.py
│   └── 03_advanced_analysis.py
├── reports/
│   ├── eda_report.md
│   ├── advanced_insights.md
│   └── figures/*.png
├── dashboard/
│   └── superstore_dashboard.html
└── outputs/
    └── executive_summary.md
```

---

## Phase 0 — Setup & Data Profiling ✅ (done)
Load the raw file, check schema/dtypes, nulls, duplicates, date range,
cardinality of categorical fields, and summary statistics of numeric fields.
Output: this profile (already captured above).

---

## Phase 1 — Data Cleaning & Feature Engineering
```
Using /mnt/user-data/uploads/ODC_Excel_Task.csv (encoding='latin1'), do the following
and save a cleaned CSV to data/processed/superstore_clean.csv:

1. Parse Order Date and Ship Date as dates.
2. Add derived columns:
   - Order Year, Order Month, Order Quarter, Order Weekday
   - Shipping Delay (days) = Ship Date - Order Date
   - Profit Margin = Profit / Sales
   - Unit Price = Sales / Quantity
   - Order Value Bucket (Low/Medium/High based on Sales tertiles)
3. Standardize text fields (trim whitespace, consistent casing) and validate
   Postal Code formatting per country.
4. Flag rows with negative profit and rows with 0% vs >0% discount.
5. Print a before/after data quality summary (row counts, dtype changes,
   new columns, any rows dropped and why).
6. Save the cleaned file and confirm the path/shape.

Keep the script itself in scripts/01_data_cleaning.py so it's reproducible.
```

---

## Phase 2 — Exploratory Data Analysis (EDA)
```
Using data/processed/superstore_clean.csv, perform EDA and save findings to
reports/eda_report.md with supporting charts saved to reports/figures/:

1. Univariate: distributions of Sales, Profit, Quantity, Discount, Profit
   Margin, Shipping Delay (histograms + boxplots, note outliers).
2. Time series: monthly/quarterly Sales and Profit trend 2023-2026, YoY growth.
3. Categorical breakdowns: Sales & Profit by Category, Sub-Category, Region,
   Segment, Ship Mode, Country.
4. Correlation analysis: Discount vs Profit Margin, Quantity vs Sales,
   Shipping Delay vs Ship Mode.
5. Top/bottom 10 products and customers by Sales and by Profit.
6. Deep-dive on negative-profit orders: which categories/sub-categories/discount
   bands drive losses.
7. Summarize 8-10 key findings in plain language at the top of the report.

Save the script as scripts/02_eda.py.
```

---

## Phase 3 — Advanced Analysis
```
Using data/processed/superstore_clean.csv, run advanced analysis and save
findings to reports/advanced_insights.md:

1. Customer segmentation (RFM: Recency, Frequency, Monetary) — cluster
   customers into tiers (e.g., Champions, At Risk, Loyal, New) and summarize
   revenue/profit contribution per tier.
2. Product/category profitability ranking — which sub-categories should be
   discounted less or discontinued based on margin.
3. Discount sensitivity — profit margin vs discount band (0%, 0-10%, 10-20%,
   20%+), identify the discount threshold where profit turns negative.
4. Regional/segment performance matrix — Sales vs Profit Margin quadrant
   per Region x Segment.
5. Shipping performance — average delay by Ship Mode and Region, and whether
   slower shipping correlates with lower repeat purchase.
6. 5 concrete, prioritized business recommendations tied to the numbers above.

Save the script as scripts/03_advanced_analysis.py.
```

---

## Phase 4 — Interactive Dashboard
```
Using data/processed/superstore_clean.csv, build an interactive single-file
HTML dashboard (dashboard/superstore_dashboard.html) with:

1. KPI header: Total Sales, Total Profit, Profit Margin %, Total Orders, AOV.
2. Filters: Year, Region, Category, Segment (all cross-filtering the charts).
3. Charts: Sales & Profit trend over time; Sales by Category/Sub-Category;
   Profit Margin by Region x Segment heatmap; Top 10 products; Discount vs
   Profit Margin scatter.
4. Clean, professional styling — no default/templated look, consistent
   color system, responsive layout.

Use Chart.js or vanilla SVG/D3, no build step — must open directly in a browser.
```

---

## Phase 5 — Documentation (README)
```
Write README.md for this GitHub repo covering: project overview, dataset
description, repo structure, how to reproduce each phase (scripts/*.py in
order), summary of key findings, and how to open the dashboard. Professional
tone, suitable for a portfolio/BI-consulting case study.
```
*(A first version of this README is already produced alongside this plan —
revise it once Phases 1-4 outputs exist so the "Key Findings" section reflects
real numbers rather than placeholders.)*

---

## Phase 6 — Final Merge & Delivery
```
Consolidate everything produced in Phases 1-5 into the final repo:

1. Verify the folder structure matches PROJECT_PLAN.md exactly.
2. Merge the three reports (eda_report.md, advanced_insights.md) plus the
   dashboard into a single outputs/executive_summary.md (2-3 pages: business
   context, method, top findings, recommendations, links to full reports
   and the dashboard file).
3. Do a final pass on README.md to make sure every link/path resolves and
   the "Key Findings" section is filled in with real numbers.
4. Zip or list all deliverables so they're ready to commit/push to GitHub.
```

---

### Why phases, not one giant prompt
Each phase writes its output to disk before the next one starts, so a new
conversation only ever needs to load *files*, not the entire prior
conversation — this is what keeps every step well within response and
context limits, however large the dataset or however deep the analysis gets.
