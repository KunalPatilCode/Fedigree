
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent / "data"

FILES = [
    "Individual_Daman_and_Diu.xlsx",
    "Individual_Maharashtra.xlsx",
]

KEYWORDS = [
    "diabet", "blood_sugar", "hypertens", "heart",
    "cardiac", "stroke", "cholesterol", "blood_pressure",
    "ht006", "ht007", "ht008", "ht009", "ht010",
    "age", "sex", "gender", "weight", "education",
    "physical", "activity", "tobacco", "smok",
]

for filename in FILES:
    path = DATA_DIR / filename
    print("\n" + "=" * 75)
    print("FILE:", filename)

    df = pd.read_excel(path, nrows=1000)
    matches = [
        col for col in df.columns
        if any(key in str(col).lower() for key in KEYWORDS)
    ]

    for col in matches:
        series = df[col]
        print(f"\n{col}")
        print("  dtype:", series.dtype)
        print("  non-missing:", series.notna().sum())
        print("  sample values:", series.dropna().unique()[:12])

print("\nInspection complete.")
