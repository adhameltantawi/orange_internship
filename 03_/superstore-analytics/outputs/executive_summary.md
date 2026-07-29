# Executive Summary — Superstore Sales & Profitability Analytics

**Prepared for:** Orange Internship Review  
**Period covered:** January 2023 – December 2026  
**Dataset:** ODC_Excel_Task.xlsx · 10,194 transactions · 800 customers · 5,111 orders  

---

## 1. Business Context

This analysis covers four years of retail sales data across the United States and Canada,
spanning three product categories (Furniture, Office Supplies, Technology), four sales
regions managed by dedicated Regional Managers, and three customer segments (Consumer,
Corporate, Home Office).

The core objective was to identify **where profit is leaking**, **which customers and
products drive outsized value**, and **what concrete actions** management can take to
improve the blended margin from its current 12.6%.

---

## 2. Methodology

| Phase | Technique | Output |
|---|---|---|
| Data Cleaning | XLSX parsing (3 sheets merged), date engineering, postal validation | `superstore_clean.csv` (33 cols) |
| EDA | Univariate distributions, time-series, categorical breakdowns, correlation | `eda_report.md` + 6 charts |
| Advanced Analysis | RFM segmentation, discount sensitivity, Region×Segment matrix, shipping | `advanced_insights.md` + 5 charts |
| Dashboard | Chart.js interactive dashboard with cross-filtering | `superstore_dashboard.html` |

All scripts use only standard Python libraries plus `pandas`, `matplotlib`, `numpy`,
and `scipy` — no cloud or BI tools required.

---

## 3. Top Findings

### 3.1 Revenue & Profitability Snapshot

| KPI | Value |
|---|---|
| Total Sales (4 years) | **$2,326,534** |
| Total Profit | **$292,297** |
| Blended Profit Margin | **12.6%** |
| Unique Orders | **5,111** |
| Average Order Value | **$455** |
| Orders with Negative Profit | **1,901 (18.6%)** |
| Returned Orders | **296 (5.8%)** |

Sales have grown at an average of **+15.7% YoY** with clear Q4 seasonal peaks
in every year — consistent with holiday/year-end spending patterns.

---

### 3.2 Category Performance

| Category | Sales | Profit | Margin |
|---|---|---|---|
| Technology | $839,893 | $146,543 | **17.4%** |
| Office Supplies | $731,893 | $126,023 | **17.2%** |
| Furniture | $754,748 | $19,730 | **2.6%** |

**Technology and Office Supplies deliver 17%+ margins**, while **Furniture barely breaks
even at 2.6%.** Furniture's share of total sales (32%) is significantly larger than its
share of profit (7%) — a structural drag on blended performance.

---

### 3.3 The Discount Problem

| Discount Band | Avg Margin |
|---|---|
| 0% (no discount) | **+29.6%** |
| 1–10% | +16.6% |
| 11–20% | +11.5% |
| **>20%** | **–37.3%** |

Every 10 percentage points of additional discount costs roughly 9 points of margin.
Orders discounted above 20% produce an **average margin of –37%** — meaning the
business loses $0.37 for every $1 of revenue on these transactions.
With 18.6% of all orders unprofitable, the discount policy is the single largest
controllable margin lever available.

---

### 3.4 Regional Performance

| Region | Manager | Profit |
|---|---|---|
| West | Sadie Pawthorne | **$110,799** |
| East | Chuck Magee | $94,883 |
| South | Fred Suzuki | $46,749 |
| Central | Roxanne Rodriguez | $39,865 |

The **West** leads by a wide margin. **Central and South** together contribute only
30% of total profit despite carrying ~45% of order volume — suggesting either a
less-favorable product mix or more aggressive discounting in those territories.

---

### 3.5 Customer Segmentation (RFM)

RFM scoring (Recency × Frequency × Monetary) produced five customer tiers.
**Champions** (highest combined score) generate disproportionate revenue and profit.
**At-Risk and Lost** customers represent recoverable revenue through targeted win-back
campaigns — even a 10% reactivation rate would meaningfully lift top-line revenue.

---

### 3.6 Worst Sub-Category: Binders

**Binders** produced a cumulative loss of **–$38,563** across all returned and
discounted orders — the largest single sub-category loss in the dataset.
Tables and Bookcases (Furniture) follow closely. These three sub-categories alone
account for the majority of the negative-profit problem.

---

## 4. Recommendations

### Priority 1 — Enforce a 20% Discount Hard Cap ⚡ High Impact / Quick Win
> Margin turns **negative** above 20%. Implement approval-gate enforcement so no
> sales rep can offer >20% without VP sign-off. Estimated recoverable loss from
> 1,901 unprofitable orders: **>$200K** in improved margin opportunity.

### Priority 2 — Restructure Furniture Pricing 📦 High Impact / Medium Effort
> Furniture runs at 2.6% margin — below the cost of capital for most retailers.
> Reprice Tables and Bookcases, eliminate discretionary discounting on this category,
> and renegotiate supplier terms. Target: bring Furniture margin above 8%.

### Priority 3 — Launch a Champion Retention Program 🏆 Medium Impact / Low Effort
> The top RFM tier is small but disproportionately valuable. A lightweight loyalty
> program (exclusive early access, free priority shipping, quarterly check-ins) will
> defend this revenue base at low marginal cost.

### Priority 4 — Win-Back At-Risk & Lost Customers 📧 Medium Impact / Low Effort
> Personalized email sequences with a time-limited offer (within the 20% cap) targeting
> customers with >90-day recency. Even 10% reactivation adds meaningful incremental revenue.

### Priority 5 — Realign Sales Incentives Toward High-Margin Categories 🎯 High Impact / Medium Effort
> Current compensation structure likely incentivizes volume over margin. Shifting
> commission multipliers to reward Technology and Office Supplies over Furniture
> will naturally correct the category mix over time.
> Goal: raise blended margin from **12.6% → 18%+** within 2 fiscal years.

---

## 5. Deliverables

| File | Description |
|---|---|
| [`scripts/01_data_cleaning.py`](../scripts/01_data_cleaning.py) | XLSX ingestion + feature engineering |
| [`scripts/02_eda.py`](../scripts/02_eda.py) | Exploratory data analysis |
| [`scripts/03_advanced_analysis.py`](../scripts/03_advanced_analysis.py) | RFM, discount, shipping analysis |
| [`reports/eda_report.md`](../reports/eda_report.md) | Full EDA narrative + 6 charts |
| [`reports/advanced_insights.md`](../reports/advanced_insights.md) | Advanced insights + 5 charts |
| [`dashboard/superstore_dashboard.html`](../dashboard/superstore_dashboard.html) | Interactive Chart.js dashboard |
| [`data/processed/superstore_clean.csv`](../data/processed/superstore_clean.csv) | Cleaned 33-column dataset |

---

*Superstore Analytics · Orange Internship · 2026*
