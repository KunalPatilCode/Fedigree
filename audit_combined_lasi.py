
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"

FILES = [
    "Individual_Daman_and_Diu.xlsx",
    "Individual_Maharashtra.xlsx",
]

REQUIRED = [
    "prim_key",
    "stateid",
    "state",
    "stateindividualweight",
    "ht002",
    "ht003",
    "ht006",
    "ht007",
]

def inspect_file(filename):
    path = DATA_DIR / filename

    print("\n" + "=" * 75)
    print(f"FILE: {filename}")

    if not path.exists():
        print(f"ERROR: File not found: {path}")
        return None

    # Read the header, then load only relevant columns
    header = pd.read_excel(path, nrows=0)
    original_names = list(header.columns)

    normalized = {
        str(column).strip().lower(): column
        for column in original_names
    }

    missing = [name for name in REQUIRED if name not in normalized]
    if missing:
        print("Missing expected columns:", missing)
        return None

    selected = [normalized[name] for name in REQUIRED]
    df = pd.read_excel(path, usecols=selected)
    df.columns = [str(c).strip().lower() for c in df.columns]

    print("Full row count:", len(df))
    print("Unique respondent IDs:", df["prim_key"].nunique())
    print("Duplicate respondent IDs:", int(df["prim_key"].duplicated().sum()))
    print("State counts:")
    print(df["state"].value_counts(dropna=False).to_string())

    for col in ["ht002", "ht003", "ht006", "ht007"]:
        print(f"\n{col} raw value counts:")
        print(df[col].value_counts(dropna=False).sort_index().to_dict())

        yes = int(df[col].eq(1).sum())
        no = int(df[col].eq(2).sum())
        other_or_missing = int((~df[col].isin([1, 2])).sum())

        print(f"Code 1: {yes} | Code 2: {no} | Other/missing: {other_or_missing}")

    # Composite target: positive if any diagnosis is yes;
    # negative only if all three diagnoses are explicitly no.
    cvd_cols = ["ht002", "ht006", "ht007"]
    positive = df[cvd_cols].eq(1).any(axis=1)
    negative = df[cvd_cols].eq(2).all(axis=1)

    print("\nCVD composite audit:")
    print("Positive:", int(positive.sum()))
    print("Negative:", int(negative.sum()))
    print("Unresolved/missing:", int((~positive & ~negative).sum()))

    return df


frames = []

for filename in FILES:
    result = inspect_file(filename)
    if result is not None:
        frames.append((filename, result))

if len(frames) == 2:
    dd = frames[0][1]
    mh = frames[1][1]

    print("\n" + "=" * 75)
    print("COMBINED DATASET CHECK")
    print("Total rows:", len(dd) + len(mh))

    for col in ["ht002", "ht003", "ht006", "ht007"]:
        print(f"\nCombined {col}:")
        print(
            pd.concat([dd[col], mh[col]])
            .value_counts(dropna=False)
            .sort_index()
            .to_dict()
        )

    overlap = set(dd["prim_key"].dropna()) & set(mh["prim_key"].dropna())
    print("\nOverlapping respondent IDs:", len(overlap))

print("\nAudit complete. No models were trained or changed.")
