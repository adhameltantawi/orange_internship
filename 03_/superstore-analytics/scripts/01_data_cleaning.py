"""
Phase 1 — Data Cleaning & Feature Engineering (XLSX edition)
Superstore Sales & Profitability Analytics

Reads:  data/raw/ODC_Excel_Task.xlsx  (3 sheets: Orders, People, Return)
        Uses built-in zipfile + xml.etree — no openpyxl needed.
Writes: data/processed/superstore_clean.csv

Run from the superstore-analytics/ directory:
    python scripts/01_data_cleaning.py
"""

import os
import re
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

import pandas as pd
import numpy as np

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH   = os.path.join(BASE_DIR, "data", "raw", "ODC_Excel_Task.xlsx")
CLEAN_PATH = os.path.join(BASE_DIR, "data", "processed", "superstore_clean.csv")
NS = {"ns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# ── XLSX reader (no openpyxl) ─────────────────────────────────────────────────
def read_xlsx_sheet(path, sheet_index):
    """
    Read a single sheet from an xlsx file into a DataFrame.
    sheet_index: 1-based index matching xl/worksheets/sheet{n}.xml
    Returns a DataFrame with the first row as header.
    """
    with zipfile.ZipFile(path) as z:
        # Shared strings table
        try:
            ss_xml  = z.read("xl/sharedStrings.xml").decode("utf-8")
            ss_root = ET.fromstring(ss_xml)
            shared  = [
                si.findtext(".//ns:t", default="", namespaces=NS)
                for si in ss_root.findall("ns:si", NS)
            ]
        except KeyError:
            shared = []

        # Sheet XML
        sheet_xml  = z.read(f"xl/worksheets/sheet{sheet_index}.xml").decode("utf-8")
        sheet_root = ET.fromstring(sheet_xml)

        rows_data = []
        for row in sheet_root.findall(".//ns:row", NS):
            cells = {}
            for cell in row.findall("ns:c", NS):
                ref   = cell.get("r", "")          # e.g. "A1"
                ctype = cell.get("t", "")
                val   = cell.findtext("ns:v", default=None, namespaces=NS)
                if val is None:
                    cells[ref] = None
                elif ctype == "s":                  # shared string
                    cells[ref] = shared[int(val)] if shared else val
                elif ctype == "b":                  # boolean
                    cells[ref] = bool(int(val))
                else:
                    # numeric (dates stored as serial numbers)
                    try:
                        cells[ref] = float(val)
                    except (ValueError, TypeError):
                        cells[ref] = val
            rows_data.append(cells)

    if not rows_data:
        return pd.DataFrame()

    # Determine column order from cell references
    all_refs = set()
    for r in rows_data:
        all_refs.update(r.keys())

    def col_letter_to_idx(ref):
        """Convert A1->0, B1->1, AA1->26, etc."""
        letters = re.sub(r"\d", "", ref)
        idx = 0
        for ch in letters:
            idx = idx * 26 + (ord(ch.upper()) - ord("A") + 1)
        return idx - 1

    # Build ordered list of unique column letters
    col_letters = sorted(
        {re.sub(r"\d", "", ref) for ref in all_refs if re.sub(r"\d", "", ref)},
        key=col_letter_to_idx
    )
    col_letter_idx = {c: i for i, c in enumerate(col_letters)}
    n_cols = len(col_letters)

    # Reconstruct as list-of-lists
    table = []
    for r in rows_data:
        row_arr = [None] * n_cols
        for ref, val in r.items():
            letter = re.sub(r"\d", "", ref)
            if letter in col_letter_idx:
                row_arr[col_letter_idx[letter]] = val
        table.append(row_arr)

    df = pd.DataFrame(table[1:], columns=table[0])
    return df


# ── Excel serial date -> Python datetime ─────────────────────────────────────
EXCEL_EPOCH = datetime(1899, 12, 30)

def excel_date(val):
    try:
        n = float(val)
        return EXCEL_EPOCH + timedelta(days=n)
    except (TypeError, ValueError):
        return pd.NaT


print("=" * 65)
print("PHASE 1 -- Data Cleaning & Feature Engineering (XLSX)")
print("=" * 65)

# ── Load all 3 sheets ─────────────────────────────────────────────────────────
print("\n[LOAD] Reading Orders sheet...")
df = read_xlsx_sheet(RAW_PATH, sheet_index=1)
rows_before, cols_before = df.shape
print(f"  Orders:  {rows_before:,} rows x {cols_before} cols")
print(f"  Columns: {list(df.columns)}")

print("[LOAD] Reading People sheet...")
df_people = read_xlsx_sheet(RAW_PATH, sheet_index=2)
# First row is actual header (Regional Manager / Region) — already parsed
print(f"  People:  {df_people.shape[0]} rows x {df_people.shape[1]} cols")
print(f"  Columns: {list(df_people.columns)}")

print("[LOAD] Reading Return sheet...")
df_return = read_xlsx_sheet(RAW_PATH, sheet_index=3)
print(f"  Return:  {df_return.shape[0]} rows x {df_return.shape[1]} cols")
print(f"  Columns: {list(df_return.columns)}")

# ── Normalize People & Return ─────────────────────────────────────────────────
# People sheet: our XLSX reader uses the very first row as column names
# (which are generic "Column1"/"Column2"). The actual header row
# "Regional Manager / Region" is the FIRST data row -> drop it, then rename.
df_people.columns = ["Regional Manager", "Region_people"]
df_people = df_people.dropna(how="all")
# Drop any row where the "manager" cell is literally "Regional Manager" (the real header)
df_people = df_people[df_people["Regional Manager"] != "Regional Manager"].reset_index(drop=True)

# Return: single column of returned Order IDs
# Column names may be 'Column1'/'Column2' or 'Returned'/'Order ID'
return_cols = list(df_return.columns)
print(f"\n[INFO] Return cols raw: {return_cols}")

# Find the column that looks like Order IDs
order_id_col = None
returned_col = None
for col in return_cols:
    sample_vals = df_return[col].dropna().astype(str).head(10).tolist()
    if any(re.match(r"[A-Z]{2}-\d{4}-\d+", v) for v in sample_vals):
        order_id_col = col
    elif any(v.lower() in ("yes", "no", "returned", "1", "true") for v in sample_vals):
        returned_col = col

# Fallback: first col is Order ID, second is status
if order_id_col is None and len(return_cols) >= 1:
    order_id_col = return_cols[0]
if returned_col is None and len(return_cols) >= 2:
    returned_col = return_cols[1]

# Build a set of returned Order IDs
if order_id_col:
    returned_ids = set(
        df_return[order_id_col].dropna().astype(str)
        .str.strip()
        .loc[lambda s: s.str.match(r"[A-Z]{2}-\d{4}-\d+")]
    )
else:
    returned_ids = set()
print(f"[INFO] Returned orders identified: {len(returned_ids):,}")

# ── 1. Parse date columns ─────────────────────────────────────────────────────
for col in ["Order Date", "Ship Date"]:
    df[col] = df[col].apply(excel_date)
    n_bad = df[col].isna().sum()
    if n_bad:
        print(f"[WARN] {col}: {n_bad} rows could not be parsed -> dropped")
        df = df.dropna(subset=[col])

print(f"\n[DATE] Order Date range: {df['Order Date'].min().date()} -> {df['Order Date'].max().date()}")
print(f"       Ship  Date range: {df['Ship Date'].min().date()}  -> {df['Ship Date'].max().date()}")

# ── 2. Numeric columns ────────────────────────────────────────────────────────
for col in ["Sales", "Profit", "Discount", "Quantity", "Row ID"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Postal Code: keep as string (may be alphanumeric for Canada)
df["Postal Code"] = df["Postal Code"].apply(
    lambda x: str(int(float(x))) if pd.notna(x) and str(x).replace(".", "").isdigit()
    else str(x).strip() if pd.notna(x) else None
)

# ── 3. Derived date columns ────────────────────────────────────────────────────
df["Order Year"]    = df["Order Date"].dt.year
df["Order Month"]   = df["Order Date"].dt.month
df["Order Quarter"] = df["Order Date"].dt.quarter
df["Order Weekday"] = df["Order Date"].dt.day_name()

# ── 4. Shipping Delay ─────────────────────────────────────────────────────────
df["Shipping Delay"] = (df["Ship Date"] - df["Order Date"]).dt.days
n_neg = (df["Shipping Delay"] < 0).sum()
if n_neg:
    print(f"[WARN] {n_neg} rows have negative Shipping Delay -> set to NaN")
    df.loc[df["Shipping Delay"] < 0, "Shipping Delay"] = np.nan

# ── 5. Financial derived columns ──────────────────────────────────────────────
df["Profit Margin"] = np.where(df["Sales"] != 0, df["Profit"] / df["Sales"], np.nan)
df["Unit Price"]    = np.where(df["Quantity"] != 0, df["Sales"] / df["Quantity"], np.nan)

tertile_low, tertile_high = df["Sales"].quantile([1/3, 2/3])
df["Order Value Bucket"] = pd.cut(
    df["Sales"],
    bins=[-np.inf, tertile_low, tertile_high, np.inf],
    labels=["Low", "Medium", "High"]
)
print(f"\n[FEATURE] Order Value Bucket: Low <= ${tertile_low:.2f} | Medium <= ${tertile_high:.2f} | High > ${tertile_high:.2f}")

# ── 6. Flags ──────────────────────────────────────────────────────────────────
df["Is_Negative_Profit"] = df["Profit"] < 0
df["Has_Discount"]       = df["Discount"] > 0

# ── 7. Is_Returned flag (from Return sheet) ───────────────────────────────────
df["Is_Returned"] = df["Order ID"].astype(str).str.strip().isin(returned_ids)
print(f"[FEATURE] Returned orders flagged: {df['Is_Returned'].sum():,}")

# ── 8. Regional Manager (from People sheet) ───────────────────────────────────
# Build Region -> Manager lookup
manager_lookup = (df_people[["Regional Manager", "Region_people"]]
                  .dropna()
                  .set_index("Region_people")["Regional Manager"]
                  .to_dict())
print(f"[FEATURE] Regional manager lookup: {manager_lookup}")

# Standardize Region names before join
df["Region"] = df["Region"].astype(str).str.strip().str.title()
df["Regional Manager"] = df["Region"].map(manager_lookup)
print(f"[FEATURE] Regional Manager assigned to {df['Regional Manager'].notna().sum():,} rows")

# ── 9. Standardize text fields ────────────────────────────────────────────────
text_title = ["Ship Mode", "Segment", "Country/Region", "City",
              "State/Province", "Region", "Category", "Sub-Category"]
text_strip  = ["Order ID", "Customer ID", "Customer Name", "Product ID", "Product Name"]

for col in text_title:
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip().str.title()
for col in text_strip:
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip()

# ── 10. Postal Code validation ─────────────────────────────────────────────────
def validate_postal(row):
    country = str(row.get("Country/Region", "")).strip().lower()
    postal  = str(row.get("Postal Code", "")).strip()
    if "canada" in country:
        return "CA_ok"
    return "US_ok" if re.fullmatch(r"\d{5}", postal) else f"US_invalid({postal})"

df["_postal_check"] = df.apply(validate_postal, axis=1)
invalid = df[~df["_postal_check"].str.contains("ok")]["_postal_check"].value_counts()
if not invalid.empty:
    print(f"\n[POSTAL] {len(invalid)} distinct invalid US postal codes found (leading-zero issue).")
else:
    print("\n[POSTAL] All postal codes pass validation.")
df = df.drop(columns=["_postal_check"])

# ── 11. Before / After Summary ────────────────────────────────────────────────
rows_after, cols_after = df.shape
rows_dropped = rows_before - rows_after
new_cols = [c for c in df.columns if c not in ["Row ID","Order ID","Order Date","Ship Date",
            "Ship Mode","Customer ID","Customer Name","Segment","Country/Region","City",
            "State/Province","Postal Code","Region","Product ID","Category","Sub-Category",
            "Product Name","Sales","Quantity","Discount","Profit"]]

print("\n" + "-" * 65)
print("DATA QUALITY SUMMARY")
print("-" * 65)
print(f"  Rows before  : {rows_before:>7,}")
print(f"  Rows after   : {rows_after:>7,}  ({rows_dropped} dropped)")
print(f"  Cols before  : {cols_before:>7}")
print(f"  Cols after   : {cols_after:>7}  (+{len(new_cols)} new)")
print(f"  New columns  : {new_cols}")
print(f"\n  Null counts (key derived cols):")
for col in ["Shipping Delay","Profit Margin","Unit Price","Order Value Bucket"]:
    print(f"    {col:<22}: {df[col].isna().sum():,} nulls")
print(f"\n  Negative profit rows : {df['Is_Negative_Profit'].sum():,}  ({df['Is_Negative_Profit'].mean()*100:.1f}%)")
print(f"  Rows with discount   : {df['Has_Discount'].sum():,}  ({df['Has_Discount'].mean()*100:.1f}%)")
print(f"  Returned orders      : {df['Is_Returned'].sum():,}  ({df['Is_Returned'].mean()*100:.1f}%)")
print(f"\n  Profit Margin stats:")
print(df["Profit Margin"].describe().to_string())
print(f"\n  Shipping Delay (days) stats:")
print(df["Shipping Delay"].describe().to_string())
print("-" * 65)

# ── 12. Save ───────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(CLEAN_PATH), exist_ok=True)
df.to_csv(CLEAN_PATH, index=False)
print(f"\n[SAVE] Cleaned file -> {CLEAN_PATH}")
print(f"       Shape: {df.shape[0]:,} rows x {df.shape[1]} cols")
print(f"\n[OK] Phase 1 complete.\n")
