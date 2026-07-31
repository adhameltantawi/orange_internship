# Data Catalog — Logistics Data Warehouse

> **Project:** Logistics Data Warehouse (`logistics_dwh`)
> **Database:** Microsoft SQL Server
> **Architecture:** Medallion (Bronze → Silver → Gold)
> **Last Updated:** July 2026

---

## Table of Contents

- [Overview](#overview)
- [Layer Summary](#layer-summary)
- [Bronze Layer — Raw Ingestion](#bronze-layer--raw-ingestion)
  - [Reference Tables](#reference-tables)
  - [Transaction Tables](#transaction-tables)
  - [Analytics Tables](#analytics-tables)
- [Silver Layer — Cleansed & Standardised](#silver-layer--cleansed--standardised)
- [Gold Layer — Star Schema](#gold-layer--star-schema)
  - [Dimension Tables](#dimension-tables)
  - [Fact Tables](#fact-tables)

---

## Overview

This data catalog documents every table and column across all three layers of the Logistics Data Warehouse. It serves as the single source of truth for schema definitions, data types, business descriptions, and data lineage.

| Layer | Schema | Tables | Purpose |
|---|---|---|---|
| Bronze | `bronze` | 14 | Raw ingestion — exact replica of source CSVs |
| Silver | `silver` | 14 | Cleansed, typed, deduplicated, audited |
| Gold | `gold` | 12 (7 dims + 5 facts) | Star Schema — analytics-ready |

---

## Layer Summary

```
Source CSVs (14 files)
    └── Bronze (14 tables) — BULK INSERT, no transformation
            └── Silver (14 tables) — cast, trim, dedup, validate
                    └── Gold (12 tables) — join, enrich, surrogate keys
```

All columns in Bronze are **NULLable** to absorb dirty source data without failure. Constraints are enforced starting from Silver. Gold applies `PRIMARY KEY` on every table and non-clustered indexes on all foreign key columns.

---

## Bronze Layer — Raw Ingestion

> **Schema:** `bronze`
> All columns NULLable. No transformation applied. Drop-and-recreate on each run.

---

### Reference Tables

#### `bronze.drivers`

| Column | Data Type | Description |
|---|---|---|
| `driver_id` | `NVARCHAR(20)` | Unique driver identifier (natural key) |
| `first_name` | `NVARCHAR(50)` | Driver's first name |
| `last_name` | `NVARCHAR(50)` | Driver's last name |
| `hire_date` | `DATE` | Date the driver was hired |
| `termination_date` | `DATE` | Date of termination (NULL if active) |
| `license_number` | `NVARCHAR(50)` | Commercial driver's license number |
| `license_state` | `NCHAR(2)` | Two-letter state code of license |
| `date_of_birth` | `DATE` | Driver's date of birth |
| `home_terminal` | `NVARCHAR(50)` | Assigned home terminal/facility |
| `employment_status` | `NVARCHAR(50)` | Active / Terminated / On Leave |
| `cdl_class` | `NCHAR(1)` | CDL class: A, B, or C |
| `years_experience` | `INT` | Total years of driving experience |

---

#### `bronze.customers`

| Column | Data Type | Description |
|---|---|---|
| `customer_id` | `NVARCHAR(20)` | Unique customer identifier (natural key) |
| `customer_name` | `NVARCHAR(100)` | Legal business name of the customer |
| `customer_type` | `NVARCHAR(50)` | Type classification (e.g., Shipper, Broker) |
| `credit_terms_days` | `INT` | Payment credit period in days |
| `primary_freight_type` | `NVARCHAR(50)` | Dominant freight category for this customer |
| `account_status` | `NVARCHAR(50)` | Active / Inactive / Suspended |
| `contract_start_date` | `DATE` | Date the customer contract commenced |
| `annual_revenue_potential` | `INT` | Estimated annual revenue from this account |

---

#### `bronze.facilities`

| Column | Data Type | Description |
|---|---|---|
| `facility_id` | `NVARCHAR(20)` | Unique facility identifier (natural key) |
| `facility_name` | `NVARCHAR(100)` | Name of the terminal or warehouse |
| `facility_type` | `NVARCHAR(50)` | Type: Terminal, Distribution Center, etc. |
| `city` | `NVARCHAR(50)` | City where the facility is located |
| `state` | `NCHAR(2)` | Two-letter US state code |
| `latitude` | `FLOAT` | Geographic latitude (decimal degrees) |
| `longitude` | `FLOAT` | Geographic longitude (decimal degrees) |
| `dock_doors` | `INT` | Number of loading/unloading dock doors |
| `operating_hours` | `NVARCHAR(50)` | Operating schedule (e.g., "24/7", "6AM–10PM") |

---

#### `bronze.routes`

| Column | Data Type | Description |
|---|---|---|
| `route_id` | `NVARCHAR(20)` | Unique route identifier (natural key) |
| `origin_city` | `NVARCHAR(50)` | Departure city |
| `origin_state` | `NCHAR(2)` | Two-letter state of origin |
| `destination_city` | `NVARCHAR(50)` | Arrival city |
| `destination_state` | `NCHAR(2)` | Two-letter state of destination |
| `typical_distance_miles` | `INT` | Standard route distance in miles |
| `base_rate_per_mile` | `DECIMAL(10,2)` | Base freight rate per mile |
| `fuel_surcharge_rate` | `DECIMAL(10,2)` | Fuel surcharge rate applied on top of base rate |
| `typical_transit_days` | `INT` | Expected transit time in days |

---

#### `bronze.trailers`

| Column | Data Type | Description |
|---|---|---|
| `trailer_id` | `NVARCHAR(20)` | Unique trailer identifier (natural key) |
| `trailer_number` | `INT` | Internal fleet trailer number |
| `trailer_type` | `NVARCHAR(50)` | Type: Dry Van, Reefer, Flatbed, etc. |
| `length_feet` | `INT` | Trailer length in feet |
| `model_year` | `INT` | Year of manufacture |
| `vin` | `NVARCHAR(25)` | Vehicle Identification Number |
| `acquisition_date` | `DATE` | Date the trailer was purchased |
| `status` | `NVARCHAR(50)` | Active / Out of Service / Maintenance |
| `current_location` | `NVARCHAR(50)` | Current facility or location |

---

#### `bronze.trucks`

| Column | Data Type | Description |
|---|---|---|
| `truck_id` | `NVARCHAR(20)` | Unique truck identifier (natural key) |
| `unit_number` | `INT` | Internal fleet unit number |
| `make` | `NVARCHAR(50)` | Manufacturer (e.g., Freightliner, Kenworth) |
| `model_year` | `INT` | Year of manufacture |
| `vin` | `NVARCHAR(25)` | Vehicle Identification Number |
| `acquisition_date` | `DATE` | Date the truck was purchased |
| `acquisition_mileage` | `INT` | Odometer reading at time of purchase |
| `fuel_type` | `NVARCHAR(50)` | Diesel / Natural Gas / Electric |
| `tank_capacity_gallons` | `INT` | Combined fuel tank capacity |
| `status` | `NVARCHAR(50)` | Active / Out of Service / Maintenance |
| `home_terminal` | `NVARCHAR(50)` | Assigned home terminal/facility |

---

### Transaction Tables

#### `bronze.loads`

| Column | Data Type | Description |
|---|---|---|
| `load_id` | `NVARCHAR(20)` | Unique load/shipment identifier (natural key) |
| `customer_id` | `NVARCHAR(20)` | FK → `bronze.customers.customer_id` |
| `route_id` | `NVARCHAR(20)` | FK → `bronze.routes.route_id` |
| `load_date` | `DATE` | Date the load was booked |
| `load_type` | `NVARCHAR(20)` | Full, Partial, LTL |
| `weight_lbs` | `INT` | Total cargo weight in pounds |
| `pieces` | `INT` | Number of pieces/units in shipment |
| `revenue` | `DECIMAL(18,3)` | Base revenue for the load |
| `fuel_surcharge` | `DECIMAL(18,3)` | Fuel surcharge component of revenue |
| `accessorial_charges` | `INT` | Additional charges (detention, liftgate, etc.) |
| `load_status` | `NVARCHAR(20)` | Booked / In Transit / Delivered / Cancelled |
| `booking_type` | `NVARCHAR(20)` | Spot / Contract |

---

#### `bronze.trips`

| Column | Data Type | Description |
|---|---|---|
| `trip_id` | `NVARCHAR(20)` | Unique trip identifier (natural key) |
| `load_id` | `NVARCHAR(20)` | FK → `bronze.loads.load_id` |
| `driver_id` | `NVARCHAR(20)` | FK → `bronze.drivers.driver_id` |
| `truck_id` | `NVARCHAR(20)` | FK → `bronze.trucks.truck_id` |
| `trailer_id` | `NVARCHAR(20)` | FK → `bronze.trailers.trailer_id` |
| `dispatch_date` | `DATE` | Date the trip was dispatched |
| `actual_distance_miles` | `INT` | Actual miles driven on the trip |
| `actual_duration_hours` | `FLOAT` | Total trip time in hours |
| `fuel_gallons_used` | `FLOAT` | Fuel consumed during the trip |
| `average_mpg` | `FLOAT` | Miles per gallon achieved on the trip |
| `idle_time_hours` | `FLOAT` | Total engine idle time in hours |
| `trip_status` | `NVARCHAR(15)` | Completed / In Progress / Cancelled |

---

#### `bronze.fuel_purchases`

| Column | Data Type | Description |
|---|---|---|
| `fuel_purchase_id` | `NVARCHAR(20)` | Unique transaction identifier (natural key) |
| `trip_id` | `NVARCHAR(20)` | FK → `bronze.trips.trip_id` |
| `truck_id` | `NVARCHAR(20)` | FK → `bronze.trucks.truck_id` |
| `driver_id` | `NVARCHAR(20)` | FK → `bronze.drivers.driver_id` |
| `purchase_date` | `DATETIME2` | Full timestamp of the fuel purchase |
| `location_city` | `NVARCHAR(20)` | City where fuel was purchased |
| `location_state` | `NCHAR(2)` | Two-letter state of purchase location |
| `gallons` | `FLOAT` | Number of gallons purchased |
| `price_per_gallon` | `DECIMAL(10,3)` | Price per gallon at time of purchase |
| `total_cost` | `DECIMAL(18,3)` | Total cost of the fuel transaction |
| `fuel_card_number` | `NVARCHAR(20)` | Fleet fuel card number used |

---

#### `bronze.maintenance_records`

| Column | Data Type | Description |
|---|---|---|
| `maintenance_id` | `NVARCHAR(20)` | Unique service record identifier (natural key) |
| `truck_id` | `NVARCHAR(20)` | FK → `bronze.trucks.truck_id` |
| `maintenance_date` | `DATE` | Date of the maintenance service |
| `maintenance_type` | `NVARCHAR(20)` | Preventive / Corrective / Inspection |
| `odometer_reading` | `INT` | Truck odometer at time of service |
| `labor_hours` | `FLOAT` | Hours of labor charged |
| `labor_cost` | `DECIMAL(18,3)` | Cost of labor |
| `parts_cost` | `DECIMAL(18,3)` | Cost of parts used |
| `total_cost` | `DECIMAL(18,3)` | Total service cost (labor + parts) |
| `facility_location` | `NVARCHAR(20)` | Service facility or shop location |
| `downtime_hours` | `FLOAT` | Hours the truck was out of service |
| `service_description` | `NVARCHAR(50)` | Brief description of work performed |

---

#### `bronze.safety_incidents`

| Column | Data Type | Description |
|---|---|---|
| `incident_id` | `NVARCHAR(20)` | Unique incident identifier (natural key) |
| `trip_id` | `NVARCHAR(20)` | FK → `bronze.trips.trip_id` |
| `truck_id` | `NVARCHAR(20)` | FK → `bronze.trucks.truck_id` |
| `driver_id` | `NVARCHAR(20)` | FK → `bronze.drivers.driver_id` |
| `incident_date` | `DATETIME2` | Full timestamp of the incident |
| `incident_type` | `NVARCHAR(50)` | Collision / Violation / Near-Miss / Cargo |
| `location_city` | `NVARCHAR(20)` | City where incident occurred |
| `location_state` | `NCHAR(2)` | Two-letter state of incident |
| `at_fault_flag` | `NVARCHAR(5)` | 'True' / 'False' — driver at fault |
| `injury_flag` | `NVARCHAR(5)` | 'True' / 'False' — injury reported |
| `vehicle_damage_cost` | `DECIMAL(18,3)` | Estimated vehicle damage cost |
| `cargo_damage_cost` | `DECIMAL(18,3)` | Estimated cargo damage cost |
| `claim_amount` | `DECIMAL(18,3)` | Insurance claim amount filed |
| `preventable_flag` | `NVARCHAR(5)` | 'True' / 'False' — deemed preventable |
| `description` | `NVARCHAR(200)` | Narrative description of the incident |

---

#### `bronze.delivery_events`

| Column | Data Type | Description |
|---|---|---|
| `event_id` | `NVARCHAR(20)` | Unique delivery event identifier (natural key) |
| `load_id` | `NVARCHAR(20)` | FK → `bronze.loads.load_id` |
| `trip_id` | `NVARCHAR(20)` | FK → `bronze.trips.trip_id` |
| `event_type` | `NVARCHAR(15)` | Pickup / Delivery |
| `facility_id` | `NVARCHAR(20)` | FK → `bronze.facilities.facility_id` |
| `scheduled_datetime` | `NVARCHAR(50)` | Scheduled time (raw string from source) |
| `actual_datetime` | `NVARCHAR(50)` | Actual arrival/departure time (raw string) |
| `detention_minutes` | `INT` | Minutes spent waiting at facility |
| `on_time_flag` | `NVARCHAR(5)` | 'True' / 'False' — arrived on schedule |
| `location_city` | `NVARCHAR(50)` | City of the pickup/delivery event |
| `location_state` | `NCHAR(2)` | Two-letter state of event location |

---

### Analytics Tables

#### `bronze.driver_monthly_metrics`

| Column | Data Type | Description |
|---|---|---|
| `driver_id` | `NVARCHAR(20)` | FK → `bronze.drivers.driver_id` |
| `month` | `DATE` | First day of the metric month (YYYY-MM-01) |
| `trips_completed` | `INT` | Total trips completed in the month |
| `total_miles` | `INT` | Total miles driven in the month |
| `total_revenue` | `DECIMAL(18,3)` | Total revenue generated in the month |
| `average_mpg` | `DECIMAL(10,3)` | Average fuel efficiency for the month |
| `total_fuel_gallons` | `DECIMAL(18,3)` | Total fuel consumed in the month |
| `on_time_delivery_rate` | `FLOAT` | Ratio of on-time deliveries (0.0 – 1.0) |
| `average_idle_hours` | `FLOAT` | Average idle engine hours per trip |

---

#### `bronze.truck_utilization_metrics`

| Column | Data Type | Description |
|---|---|---|
| `truck_id` | `NVARCHAR(20)` | FK → `bronze.trucks.truck_id` |
| `month` | `DATE` | First day of the metric month (YYYY-MM-01) |
| `trips_completed` | `INT` | Total trips completed in the month |
| `total_miles` | `INT` | Total miles driven in the month |
| `total_revenue` | `DECIMAL(18,3)` | Total revenue generated in the month |
| `average_mpg` | `DECIMAL(10,3)` | Average fuel efficiency for the month |
| `maintenance_events` | `INT` | Number of maintenance events in the month |
| `maintenance_cost` | `DECIMAL(18,3)` | Total maintenance spend in the month |
| `downtime_hours` | `FLOAT` | Total out-of-service hours in the month |
| `utilization_rate` | `FLOAT` | Ratio of active days to total days (0.0 – 1.0) |

---

## Silver Layer — Cleansed & Standardised

> **Schema:** `silver`
> Mirrors the Bronze schema with tightened data types, added transformations, and an audit column.

The Silver layer applies the following transformations to every table:

| Transformation | Details |
|---|---|
| `TRIM` | All `NVARCHAR` columns stripped of leading/trailing whitespace |
| `UPPER` | State codes, VINs, and boolean flags forced to uppercase |
| `ROW_NUMBER()` | Duplicates on primary (or composite) key removed, first record kept |
| Range validation | Negative values on numeric columns (`cost`, `distance`, `gallons`, etc.) set to `NULL` |
| Type casting | Raw strings cast to proper `DATE`, `DECIMAL`, `INT` as defined in Silver DDL |
| `dwh_create_date` | `DATETIME2` column added recording when the record was loaded into Silver |

> The Silver schema matches Bronze column-for-column, with the addition of `dwh_create_date` on every table. For full Silver DDL, see `scripts/silver/01_create_reference.sql`, `02_create_transactions.sql`, `03_create_analytics.sql`.

---

## Gold Layer — Star Schema

> **Schema:** `gold`
> Dimensional model with surrogate keys, enriched columns, and performance indexes.

---

### Dimension Tables

#### `gold.dim_driver`

> **Source:** `silver.drivers` | **Grain:** One row per driver

| Column | Data Type | Key | Description |
|---|---|---|---|
| `driver_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `driver_id` | `NVARCHAR(20)` | NK | Natural key — traceability to source |
| `first_name` | `NVARCHAR(50)` | | Driver's first name |
| `last_name` | `NVARCHAR(50)` | | Driver's last name |
| `full_name` | `NVARCHAR(101)` | | *Derived:* first_name + ' ' + last_name |
| `hire_date` | `DATE` | | Date hired |
| `termination_date` | `DATE` | | Date terminated (NULL if active) |
| `license_number` | `NVARCHAR(50)` | | CDL license number |
| `license_state` | `NCHAR(2)` | | State of CDL issuance |
| `date_of_birth` | `DATE` | | Date of birth |
| `home_terminal` | `NVARCHAR(50)` | | Assigned home terminal |
| `employment_status` | `NVARCHAR(50)` | | Active / Terminated / On Leave |
| `cdl_class` | `NCHAR(1)` | | CDL class: A, B, or C |
| `years_experience` | `INT` | | Total years of experience |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.dim_truck`

> **Source:** `silver.trucks` | **Grain:** One row per truck

| Column | Data Type | Key | Description |
|---|---|---|---|
| `truck_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `truck_id` | `NVARCHAR(20)` | NK | Natural key |
| `unit_number` | `INT` | | Internal fleet unit number |
| `make` | `NVARCHAR(50)` | | Truck manufacturer |
| `model_year` | `INT` | | Year of manufacture |
| `vin` | `NVARCHAR(25)` | | Vehicle Identification Number |
| `acquisition_date` | `DATE` | | Purchase date |
| `acquisition_mileage` | `INT` | | Odometer at purchase |
| `fuel_type` | `NVARCHAR(50)` | | Diesel / Natural Gas / Electric |
| `tank_capacity_gallons` | `INT` | | Total fuel tank capacity |
| `status` | `NVARCHAR(50)` | | Active / Out of Service / Maintenance |
| `home_terminal` | `NVARCHAR(50)` | | Assigned home terminal |
| `truck_age_years` | `INT` | | *Derived:* current year − model_year |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.dim_trailer`

> **Source:** `silver.trailers` | **Grain:** One row per trailer

| Column | Data Type | Key | Description |
|---|---|---|---|
| `trailer_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `trailer_id` | `NVARCHAR(20)` | NK | Natural key |
| `trailer_number` | `INT` | | Internal fleet number |
| `trailer_type` | `NVARCHAR(50)` | | Dry Van / Reefer / Flatbed / etc. |
| `length_feet` | `INT` | | Trailer length in feet |
| `model_year` | `INT` | | Year of manufacture |
| `vin` | `NVARCHAR(25)` | | Vehicle Identification Number |
| `acquisition_date` | `DATE` | | Purchase date |
| `status` | `NVARCHAR(50)` | | Active / Out of Service / Maintenance |
| `current_location` | `NVARCHAR(50)` | | Current facility or city |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.dim_customer`

> **Source:** `silver.customers` | **Grain:** One row per customer

| Column | Data Type | Key | Description |
|---|---|---|---|
| `customer_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `customer_id` | `NVARCHAR(20)` | NK | Natural key |
| `customer_name` | `NVARCHAR(100)` | | Legal business name |
| `customer_type` | `NVARCHAR(50)` | | Shipper / Broker / 3PL / etc. |
| `credit_terms_days` | `INT` | | Credit period in days |
| `primary_freight_type` | `NVARCHAR(50)` | | Primary freight category |
| `account_status` | `NVARCHAR(50)` | | Active / Inactive / Suspended |
| `contract_start_date` | `DATE` | | Contract commencement date |
| `annual_revenue_potential` | `INT` | | Estimated annual revenue |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.dim_facility`

> **Source:** `silver.facilities` | **Grain:** One row per facility

| Column | Data Type | Key | Description |
|---|---|---|---|
| `facility_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `facility_id` | `NVARCHAR(20)` | NK | Natural key |
| `facility_name` | `NVARCHAR(100)` | | Full facility name |
| `facility_type` | `NVARCHAR(50)` | | Terminal / Distribution Center / etc. |
| `city` | `NVARCHAR(50)` | | City name |
| `state` | `NCHAR(2)` | | Two-letter US state code |
| `latitude` | `FLOAT` | | Geographic latitude |
| `longitude` | `FLOAT` | | Geographic longitude |
| `dock_doors` | `INT` | | Number of dock doors |
| `operating_hours` | `NVARCHAR(50)` | | Operating schedule |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.dim_route`

> **Source:** `silver.routes` | **Grain:** One row per route

| Column | Data Type | Key | Description |
|---|---|---|---|
| `route_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `route_id` | `NVARCHAR(20)` | NK | Natural key |
| `origin_city` | `NVARCHAR(50)` | | Departure city |
| `origin_state` | `NCHAR(2)` | | Two-letter origin state |
| `destination_city` | `NVARCHAR(50)` | | Arrival city |
| `destination_state` | `NCHAR(2)` | | Two-letter destination state |
| `typical_distance_miles` | `INT` | | Standard route distance |
| `base_rate_per_mile` | `DECIMAL(10,2)` | | Base freight rate per mile |
| `fuel_surcharge_rate` | `DECIMAL(10,2)` | | Fuel surcharge rate |
| `typical_transit_days` | `INT` | | Expected transit time (days) |
| `lane_description` | `NVARCHAR(120)` | | *Derived:* "Origin City, ST → Destination City, ST" |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.dim_date`

> **Source:** Generated (2020–2030) | **Grain:** One row per calendar day

| Column | Data Type | Key | Description |
|---|---|---|---|
| `date_key` | `INT` | 🔑 PK | Date in YYYYMMDD integer format |
| `full_date` | `DATE` | | Full calendar date |
| `year` | `INT` | | Calendar year |
| `quarter` | `INT` | | Quarter (1–4) |
| `month` | `INT` | | Month number (1–12) |
| `month_name` | `NVARCHAR(10)` | | Month name (e.g., "January") |
| `week` | `INT` | | ISO week number (1–53) |
| `day_of_month` | `INT` | | Day of month (1–31) |
| `day_of_week` | `INT` | | Day of week (1=Monday – 7=Sunday) |
| `day_name` | `NVARCHAR(10)` | | Day name (e.g., "Monday") |
| `is_weekend` | `BIT` | | 1=Weekend, 0=Weekday |
| `year_month` | `NVARCHAR(7)` | | Format: "YYYY-MM" |

---

### Fact Tables

#### `gold.fact_trip`

> **Source:** `silver.trips` + `silver.loads` | **Grain:** One row per trip
> **Indexes:** `driver_key`, `truck_key`, `trailer_key`, `customer_key`, `route_key`, `dispatch_date_key`

| Column | Data Type | Key | Description |
|---|---|---|---|
| `trip_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `driver_key` | `INT` | FK → dim_driver | Dispatched driver |
| `truck_key` | `INT` | FK → dim_truck | Truck used on the trip |
| `trailer_key` | `INT` | FK → dim_trailer | Trailer used on the trip |
| `customer_key` | `INT` | FK → dim_customer | Customer who booked the load |
| `route_key` | `INT` | FK → dim_route | Route travelled |
| `dispatch_date_key` | `INT` | FK → dim_date | Dispatch date (YYYYMMDD) |
| `trip_id` | `NVARCHAR(20)` | NK | Natural key — traceability |
| `load_id` | `NVARCHAR(20)` | NK | Related load natural key |
| `actual_distance_miles` | `INT` | Measure | Actual miles driven |
| `actual_duration_hours` | `FLOAT` | Measure | Total trip duration in hours |
| `fuel_gallons_used` | `FLOAT` | Measure | Fuel consumed |
| `average_mpg` | `FLOAT` | Measure | Average fuel efficiency |
| `idle_time_hours` | `FLOAT` | Measure | Engine idle time |
| `revenue` | `DECIMAL(18,3)` | Measure | Base load revenue |
| `fuel_surcharge` | `DECIMAL(18,3)` | Measure | Fuel surcharge revenue |
| `accessorial_charges` | `INT` | Measure | Additional charges |
| `total_revenue` | `DECIMAL(18,3)` | Measure | *Derived:* revenue + fuel_surcharge + accessorial |
| `weight_lbs` | `INT` | Measure | Cargo weight |
| `pieces` | `INT` | Measure | Number of cargo pieces |
| `load_type` | `NVARCHAR(20)` | Descriptor | Full / Partial / LTL |
| `load_status` | `NVARCHAR(20)` | Descriptor | Delivered / Cancelled / etc. |
| `booking_type` | `NVARCHAR(20)` | Descriptor | Spot / Contract |
| `trip_status` | `NVARCHAR(15)` | Descriptor | Completed / In Progress |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.fact_fuel_purchase`

> **Source:** `silver.fuel_purchases` | **Grain:** One row per fuel transaction
> **Indexes:** `driver_key`, `truck_key`, `purchase_date_key`

| Column | Data Type | Key | Description |
|---|---|---|---|
| `fuel_purchase_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `driver_key` | `INT` | FK → dim_driver | Driver who fuelled |
| `truck_key` | `INT` | FK → dim_truck | Truck that was fuelled |
| `purchase_date_key` | `INT` | FK → dim_date | Purchase date (YYYYMMDD) |
| `fuel_purchase_id` | `NVARCHAR(20)` | NK | Natural key |
| `trip_id` | `NVARCHAR(20)` | NK | Associated trip natural key |
| `gallons` | `FLOAT` | Measure | Gallons purchased |
| `price_per_gallon` | `DECIMAL(10,3)` | Measure | Price per gallon |
| `total_cost` | `DECIMAL(18,3)` | Measure | Total transaction cost |
| `location_city` | `NVARCHAR(20)` | Descriptor | City of purchase |
| `location_state` | `NCHAR(2)` | Descriptor | State of purchase |
| `fuel_card_number` | `NVARCHAR(20)` | Descriptor | Fleet card used |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.fact_maintenance`

> **Source:** `silver.maintenance_records` | **Grain:** One row per service record
> **Indexes:** `truck_key`, `maintenance_date_key`

| Column | Data Type | Key | Description |
|---|---|---|---|
| `maintenance_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `truck_key` | `INT` | FK → dim_truck | Truck serviced |
| `maintenance_date_key` | `INT` | FK → dim_date | Service date (YYYYMMDD) |
| `maintenance_id` | `NVARCHAR(20)` | NK | Natural key |
| `odometer_reading` | `INT` | Measure | Odometer at time of service |
| `labor_hours` | `FLOAT` | Measure | Hours of labor |
| `labor_cost` | `DECIMAL(18,3)` | Measure | Labor cost |
| `parts_cost` | `DECIMAL(18,3)` | Measure | Parts cost |
| `total_cost` | `DECIMAL(18,3)` | Measure | Total service cost |
| `downtime_hours` | `FLOAT` | Measure | Out-of-service hours |
| `maintenance_type` | `NVARCHAR(20)` | Descriptor | Preventive / Corrective / Inspection |
| `facility_location` | `NVARCHAR(20)` | Descriptor | Service shop location |
| `service_description` | `NVARCHAR(50)` | Descriptor | Work performed description |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.fact_safety`

> **Source:** `silver.safety_incidents` | **Grain:** One row per incident
> **Indexes:** `driver_key`, `truck_key`, `incident_date_key`

| Column | Data Type | Key | Description |
|---|---|---|---|
| `safety_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `driver_key` | `INT` | FK → dim_driver | Driver involved |
| `truck_key` | `INT` | FK → dim_truck | Truck involved |
| `incident_date_key` | `INT` | FK → dim_date | Incident date (YYYYMMDD) |
| `incident_id` | `NVARCHAR(20)` | NK | Natural key |
| `trip_id` | `NVARCHAR(20)` | NK | Related trip natural key |
| `vehicle_damage_cost` | `DECIMAL(18,3)` | Measure | Vehicle damage cost |
| `cargo_damage_cost` | `DECIMAL(18,3)` | Measure | Cargo damage cost |
| `claim_amount` | `DECIMAL(18,3)` | Measure | Insurance claim amount |
| `total_damage_cost` | `DECIMAL(18,3)` | Measure | *Derived:* vehicle + cargo damage |
| `incident_type` | `NVARCHAR(50)` | Descriptor | Collision / Violation / Near-Miss |
| `location_city` | `NVARCHAR(20)` | Descriptor | City of incident |
| `location_state` | `NCHAR(2)` | Descriptor | State of incident |
| `at_fault_flag` | `NVARCHAR(5)` | Flag | 'True' / 'False' |
| `injury_flag` | `NVARCHAR(5)` | Flag | 'True' / 'False' |
| `preventable_flag` | `NVARCHAR(5)` | Flag | 'True' / 'False' |
| `description` | `NVARCHAR(200)` | Descriptor | Incident narrative |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

#### `gold.fact_delivery`

> **Source:** `silver.delivery_events` + joins to loads/trips dimensions | **Grain:** One row per pickup or delivery event
> **Indexes:** `facility_key`, `driver_key`, `truck_key`, `customer_key`, `route_key`, `event_date_key`

| Column | Data Type | Key | Description |
|---|---|---|---|
| `delivery_key` | `INT IDENTITY` | 🔑 PK | Surrogate primary key |
| `facility_key` | `INT` | FK → dim_facility | Facility where event occurred |
| `driver_key` | `INT` | FK → dim_driver | Assigned driver |
| `truck_key` | `INT` | FK → dim_truck | Truck used |
| `customer_key` | `INT` | FK → dim_customer | Customer associated |
| `route_key` | `INT` | FK → dim_route | Route for the load |
| `event_date_key` | `INT` | FK → dim_date | Event date (YYYYMMDD) |
| `event_id` | `NVARCHAR(20)` | NK | Natural key |
| `load_id` | `NVARCHAR(20)` | NK | Related load natural key |
| `trip_id` | `NVARCHAR(20)` | NK | Related trip natural key |
| `detention_minutes` | `INT` | Measure | Minutes of detention at facility |
| `event_type` | `NVARCHAR(15)` | Descriptor | Pickup / Delivery |
| `scheduled_datetime` | `TIME` | Descriptor | Scheduled arrival/departure time |
| `actual_datetime` | `TIME` | Descriptor | Actual arrival/departure time |
| `on_time_flag` | `NVARCHAR(5)` | Flag | 'True' / 'False' |
| `location_city` | `NVARCHAR(50)` | Descriptor | Event city |
| `location_state` | `NCHAR(2)` | Descriptor | Event state |
| `dwh_create_date` | `DATETIME2` | | DWH load timestamp |

---

## Key Legend

| Symbol | Meaning |
|---|---|
| 🔑 PK | Primary Key |
| FK | Foreign Key reference |
| NK | Natural Key (retained for traceability) |
| Measure | Additive numeric fact — can be aggregated |
| Descriptor | Non-additive attribute describing the event |
| Flag | Boolean-style indicator ('True' / 'False') |
| *Derived* | Column computed during ETL load, not from source |
