# Project Requirements — Logistics Data Warehouse

> **Project:** Logistics Data Warehouse (`logistics_dwh`)
> **Author:** Adham El-Tantawi
> **Version:** 1.0
> **Date:** July 2026
> **Status:** ✅ Complete

---

## Table of Contents

- [Project Overview](#project-overview)
- [Business Objectives](#business-objectives)
- [Scope](#scope)
- [Stakeholders](#stakeholders)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Technical Requirements](#technical-requirements)
- [Data Requirements](#data-requirements)
- [Pipeline Requirements](#pipeline-requirements)
- [Data Quality Requirements](#data-quality-requirements)
- [Reporting & Analytics Requirements](#reporting--analytics-requirements)
- [Constraints & Assumptions](#constraints--assumptions)
- [Deliverables](#deliverables)
- [Success Criteria](#success-criteria)

---

## Project Overview

The **Logistics Data Warehouse** project establishes an end-to-end analytical platform for a Class 8 trucking company. Raw operational data from 14 source systems is consolidated, cleansed, and transformed into a unified Star Schema that supports business intelligence, executive reporting, and data-driven decision-making across fleet operations, finance, and customer management.

| Attribute | Value |
|---|---|
| **Domain** | Logistics & Transportation |
| **Company Type** | Class 8 Trucking (Long-Haul) |
| **Data Period** | 2022 – 2024 |
| **Geography** | United States |
| **Source Records** | ~361,000 |
| **Database Platform** | Microsoft SQL Server |

---

## Business Objectives

The following business objectives drive this project:

| # | Objective | Priority |
|---|---|---|
| 1 | Unify fleet, dispatch, fuel, and finance data into a single platform | 🔴 High |
| 2 | Enable executive-level KPI reporting on revenue, margins, and on-time delivery | 🔴 High |
| 3 | Identify the most and least profitable routes and customers | 🔴 High |
| 4 | Track driver performance (on-time rate, MPG, safety record) | 🔴 High |
| 5 | Monitor fleet health through maintenance cost and downtime analysis | 🟡 Medium |
| 6 | Detect seasonal patterns affecting load volumes and freight rates | 🟡 Medium |
| 7 | Provide audit-ready data lineage from source CSV to dashboard | 🟡 Medium |
| 8 | Enable data quality monitoring at each pipeline stage | 🟢 Standard |

---

## Scope

### In Scope

- Ingestion of **14 source CSV files** into a Bronze staging layer
- Cleansing and standardisation into a **Silver layer** (14 tables)
- Dimensional modelling into a **Gold Star Schema** (7 dimensions + 5 fact tables)
- Stored procedure-based ETL pipeline with error handling and logging
- Data quality validation scripts for Silver and Gold layers
- Executive dashboard in **Google Sheets**
- **Power BI** semantic model connected to the Gold layer
- Full technical documentation (README, data catalog, schema docs)

### Out of Scope

- Real-time or streaming ingestion
- Incremental / change-data-capture (CDC) loading
- SCDs beyond Type 1 (overwrite)
- Source system integration beyond CSV files
- Cloud deployment (Azure, AWS, GCP)
- Role-based access control or data security policies

---

## Stakeholders

| Role | Responsibility |
|---|---|
| **Data Engineer** | Pipeline development, ETL design, testing, documentation |
| **Operations Manager** | Primary consumer of fleet and driver KPI reports |
| **Finance Team** | Revenue, cost, and margin analysis |
| **Safety Officer** | Safety incident tracking and risk analysis |
| **BI Analyst** | Dashboard development and insight communication |

---

## Functional Requirements

### FR-01 — Data Ingestion (Bronze Layer)

| ID | Requirement |
|---|---|
| FR-01.1 | The system SHALL ingest all 14 source CSV files via `BULK INSERT` into the Bronze schema |
| FR-01.2 | Bronze tables SHALL accept all data types as `NULL` to avoid ingestion failures |
| FR-01.3 | Each Bronze table SHALL be truncated before reload (idempotent) |
| FR-01.4 | A master orchestrator stored procedure (`bronze.load_bronze`) SHALL execute all Bronze loads in sequence |
| FR-01.5 | The pipeline SHALL print per-table row counts and execution time on each run |

---

### FR-02 — Data Cleansing (Silver Layer)

| ID | Requirement |
|---|---|
| FR-02.1 | All string columns SHALL have leading/trailing whitespace removed (`TRIM`) |
| FR-02.2 | State codes, VINs, and boolean flags SHALL be converted to uppercase (`UPPER`) |
| FR-02.3 | Duplicate records SHALL be removed using `ROW_NUMBER()` partitioned on primary keys |
| FR-02.4 | Negative values on numeric columns (`cost`, `distance`, `gallons`) SHALL be set to `NULL` |
| FR-02.5 | Raw strings SHALL be cast to appropriate data types (`DATE`, `DECIMAL`, `INT`) |
| FR-02.6 | Every Silver table SHALL include a `dwh_create_date` audit column (`DATETIME2`) |
| FR-02.7 | A master orchestrator stored procedure (`silver.load_silver`) SHALL execute all Silver loads in sequence |

---

### FR-03 — Dimensional Modelling (Gold Layer)

| ID | Requirement |
|---|---|
| FR-03.1 | The Gold layer SHALL implement a Star Schema with 7 dimension tables and 5 fact tables |
| FR-03.2 | All dimension tables SHALL use surrogate keys (`INT IDENTITY`) as primary keys |
| FR-03.3 | Natural keys SHALL be retained alongside surrogate keys for traceability |
| FR-03.4 | A date dimension (`gold.dim_date`) SHALL be generated spanning 2020–2030 |
| FR-03.5 | Derived columns SHALL be computed during load (e.g., `full_name`, `truck_age_years`, `lane_description`, `total_revenue`, `total_damage_cost`) |
| FR-03.6 | Non-clustered indexes SHALL be created on all foreign key columns in fact tables |
| FR-03.7 | A master orchestrator stored procedure (`gold.load_gold`) SHALL execute all Gold loads in sequence |

---

### FR-04 — Pipeline Orchestration

| ID | Requirement |
|---|---|
| FR-04.1 | Each layer SHALL be executable with a single `EXEC` command |
| FR-04.2 | The full pipeline SHALL be executable in three sequential commands |
| FR-04.3 | All ETL scripts SHALL be idempotent (safe to re-run without error) |
| FR-04.4 | DDL (schema creation) SHALL be separated from DML (data loading) scripts |

---

### FR-05 — Reporting & Dashboards

| ID | Requirement |
|---|---|
| FR-05.1 | An executive dashboard SHALL be delivered in Google Sheets using Gold Layer data |
| FR-05.2 | A Power BI semantic model SHALL connect directly to the Gold Star Schema |
| FR-05.3 | An HTML preview dashboard SHALL be available without a database connection |
| FR-05.4 | A Jupyter Notebook SHALL document exploratory data analysis findings |

---

## Non-Functional Requirements

### Performance

| ID | Requirement |
|---|---|
| NFR-P1 | The full end-to-end pipeline (Bronze → Silver → Gold) SHALL complete in under 10 minutes on standard hardware |
| NFR-P2 | Non-clustered indexes on fact table FKs SHALL ensure sub-second BI filter/slicer response times |
| NFR-P3 | The truncate-and-load strategy SHALL avoid row-by-row cursors in favour of set-based operations |

### Reliability

| ID | Requirement |
|---|---|
| NFR-R1 | Each ETL stored procedure SHALL wrap operations in a `TRY/CATCH` block |
| NFR-R2 | The pipeline SHALL be fully idempotent — re-running any step SHALL produce the same result |
| NFR-R3 | Schema creation scripts SHALL use `IF OBJECT_ID(...) IS NOT NULL DROP TABLE` to prevent object conflicts |

### Maintainability

| ID | Requirement |
|---|---|
| NFR-M1 | All SQL scripts SHALL follow a consistent formatting standard (capitalised keywords, 4-space indentation) |
| NFR-M2 | Each script file SHALL include a standardised header block (purpose, tables, dependencies, warnings) |
| NFR-M3 | ETL and DDL scripts SHALL be separated into distinct, numbered files |
| NFR-M4 | The repository SHALL use a logical folder structure separating `scripts/` from `tests/` |

### Traceability

| ID | Requirement |
|---|---|
| NFR-T1 | All Gold tables SHALL include a `dwh_create_date` audit timestamp |
| NFR-T2 | Natural keys SHALL be retained in all Gold tables to trace records back to their Bronze source |
| NFR-T3 | The `tests/` directory SHALL provide a documented audit trail of all data quality decisions |

---

## Technical Requirements

| Category | Requirement |
|---|---|
| **Database** | Microsoft SQL Server 2019 or later (Express edition acceptable) |
| **Client Tool** | SQL Server Management Studio (SSMS) 18 or later |
| **Script Execution** | SSMS `:r` command for sequential file loading |
| **Data Format** | UTF-8 encoded CSV files with defined column order |
| **BI Tool** | Power BI Desktop (`.pbip` format) for the semantic model |
| **Notebook** | Python 3 / Jupyter Notebook for EDA |
| **Version Control** | Git / GitHub for all SQL and documentation files |
| **OS** | Windows (SSMS dependency) |

---

## Data Requirements

### Source Data

| Requirement | Detail |
|---|---|
| 14 CSV files | Must be placed in `datasets/reference/`, `datasets/transactions/`, `datasets/analytics/` |
| File encoding | UTF-8 |
| File delimiter | Comma (`,`) |
| Column headers | Row 1 of each file |
| Date format | ISO 8601 (`YYYY-MM-DD`) |
| Null representation | Empty field (no quoted NULL strings) |

### Data Volume

| Table Category | Approximate Record Count |
|---|---|
| Reference / Dimension | ~500–2,000 rows per table |
| Transaction | ~50,000–100,000 rows per table |
| Pre-Aggregated | ~5,000–20,000 rows per table |
| **Total** | **~361,000 rows** |

### Sensitive Data

This project uses **synthetic simulation data** only. No real personal, financial, or commercially sensitive information is present. Standard data handling precautions still apply in any production deployment.

---

## Pipeline Requirements

### Execution Order

```
1. scripts/init_database.sql            — Database creation (once only)

2. scripts/bronze/01_create_reference.sql
   scripts/bronze/02_create_transactions.sql
   scripts/bronze/03_create_analytics.sql
   scripts/bronze/04_load_reference.sql
   scripts/bronze/05_load_transactions.sql
   scripts/bronze/06_load_analytics.sql
   scripts/bronze/07_load_bronze_layer.sql
   → EXEC bronze.load_bronze

3. scripts/silver/01_create_reference.sql
   scripts/silver/02_create_transactions.sql
   scripts/silver/03_create_analytics.sql
   scripts/silver/04_load_drivers.sql … 17_load_truck_utilization_metrics.sql
   scripts/silver/18_load_silver_layer.sql
   → EXEC silver.load_silver

4. scripts/gold/01_create_dimensions.sql
   scripts/gold/02_create_facts.sql
   scripts/gold/03_load_dimensions.sql
   scripts/gold/04_load_facts.sql
   scripts/gold/05_load_gold_layer.sql
   → EXEC gold.load_gold
```

### Stored Procedure Summary

| Procedure | Layer | Action |
|---|---|---|
| `bronze.load_bronze` | Bronze | Orchestrates all 14 Bronze table loads |
| `silver.load_silver` | Silver | Orchestrates all 14 Silver table cleanse-and-load |
| `gold.load_gold` | Gold | Populates all 7 dimensions then all 5 fact tables |

---

## Data Quality Requirements

### Quality Dimensions

| Dimension | Definition | Implementation |
|---|---|---|
| **Completeness** | No NULL in mandatory fields | NULL checks on all ID, date, and name columns |
| **Uniqueness** | No duplicate primary keys | `ROW_NUMBER()` deduplication in Silver ETL + validation queries in tests/ |
| **Validity** | Values within expected domain | Date logic checks, negative value detection |
| **Consistency** | Uniform formatting of categorical values | `TRIM` + `UPPER` applied in Silver |
| **Range** | Numeric and date values within business bounds | Min/max sanity checks in Silver validation |
| **Referential Integrity** | No orphaned foreign keys | FK orphan checks in Gold test scripts |
| **Reconciliation** | Row counts match between layers | Silver-to-Gold count comparison in test scripts |

### Test Coverage Requirement

| Layer | Coverage Target |
|---|---|
| Bronze → Silver | One test script **per source table** (14 scripts minimum) |
| Silver → Gold | One test script for **all dimensions** + one for **all facts** |

---

## Reporting & Analytics Requirements

### Dashboard KPIs

| Category | KPI |
|---|---|
| **Revenue** | Total revenue, revenue per route, revenue per customer |
| **Operations** | Trips completed, on-time delivery rate, average trip distance |
| **Fleet** | Truck utilisation rate, average MPG, fuel cost per mile |
| **Maintenance** | Total maintenance cost, downtime hours, cost by truck age |
| **Safety** | Incident count, total damage cost, at-fault rate, preventable rate |
| **Driver** | Driver on-time rate, total miles, average MPG, safety score |

### Analytical Questions

The warehouse SHALL be capable of answering all of the following:

1. Which drivers have the highest on-time delivery rates?
2. Which routes are the most profitable (highest revenue, lowest cost)?
3. How does truck age correlate with maintenance cost and downtime?
4. What is the average fuel cost per trip by route and driver?
5. Which customers generate the highest total and average revenue?
6. How do seasonal patterns (by quarter/month) affect load volumes and rates?
7. What is the fleet utilisation rate per truck per month?
8. Which safety incidents were most costly, and are they preventable?
9. Which facilities cause the most detention time?
10. What is the average MPG by truck make and model year?

---

## Constraints & Assumptions

### Constraints

| # | Constraint |
|---|---|
| C1 | The pipeline runs on-premises on a Windows machine — no cloud infrastructure |
| C2 | All transformations are implemented in T-SQL (no Python/Spark ETL) |
| C3 | The database uses Truncate-and-Load — no incremental/CDC approach |
| C4 | SCD Type 1 only — dimension history is overwritten on each reload |
| C5 | Source CSV files are not version-controlled (gitignored) |

### Assumptions

| # | Assumption |
|---|---|
| A1 | Source CSV files are available and correctly formatted with matching column headers |
| A2 | The `BULK INSERT` file paths in Bronze load scripts are updated to match the local machine |
| A3 | SQL Server has `BULK INSERT` permissions enabled |
| A4 | The dataset is synthetic and does not require PII handling or GDPR compliance |
| A5 | The date dimension spanning 2020–2030 covers the full range of source data |

---

## Deliverables

| # | Deliverable | Status |
|---|---|---|
| 1 | `scripts/` — Full SQL ETL pipeline (Bronze, Silver, Gold) | ✅ Complete |
| 2 | `tests/` — Data quality validation scripts (18 total) | ✅ Complete |
| 3 | `docs/data_architecture.png` — Architecture diagram | ✅ Complete |
| 4 | `docs/data_flow.png` — Pipeline flow diagram | ✅ Complete |
| 5 | `docs/entity_relationships.png` — ERD | ✅ Complete |
| 6 | Google Sheets Executive Dashboard | ✅ Complete |
| 7 | `dashboard.Report/` + `dashboard.SemanticModel/` — Power BI | ✅ Complete |
| 8 | `logistics_dashboard.html` — HTML dashboard preview | ✅ Complete |
| 9 | `logistics_analysis.ipynb` — EDA Notebook | ✅ Complete |
| 10 | `README.md` — Project documentation | ✅ Complete |
| 11 | `docs/data_catalog.md` — Full schema data catalog | ✅ Complete |
| 12 | `docs/Project_Requirements.md` — This document | ✅ Complete |

---

## Success Criteria

The project is considered **successfully complete** when all of the following criteria are met:

| # | Criterion | Validation Method |
|---|---|---|
| SC1 | All 14 Bronze tables load from CSV without errors | `EXEC bronze.load_bronze` completes with row counts |
| SC2 | All 14 Silver tables pass deduplication and type validation | Silver quality check scripts return 0 issues |
| SC3 | All 7 Gold dimensions populate with correct surrogate keys | Dimension count matches Silver source tables |
| SC4 | All 5 Gold fact tables load with no orphaned foreign keys | Gold quality check scripts return 0 FK violations |
| SC5 | Silver-to-Gold row counts reconcile within expected tolerance | Reconciliation scripts show 100% match |
| SC6 | Executive dashboard displays revenue, on-time, and fleet KPIs | Dashboard accessible via Google Sheets link |
| SC7 | Power BI semantic model connects to Gold layer without errors | Model loads in Power BI Desktop |
| SC8 | Full pipeline re-run produces identical results (idempotency) | Three-command refresh completes without errors |
