import pandas as pd
import numpy as np

from pathlib import Path


# ============================================
# 1. Paths
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"


# ============================================
# 2. Load datasets
# ============================================

train = pd.read_csv(DATASET_DIR / "train.csv")
test = pd.read_csv(DATASET_DIR / "test.csv")


# Remove malformed training row
train = train[
    train["type"].isin(["normal", "anomaly"])
].copy()


print("TRAIN SHAPE:", train.shape)
print("TEST SHAPE :", test.shape)


# ============================================
# 3. Label distribution
# ============================================

print("\n========== LABEL DISTRIBUTION ==========")

print("\nTraining:")
print(train["type"].value_counts())

print("\nTesting:")
print(test["type"].value_counts())


# ============================================
# 4. Basic information
# ============================================

print("\n========== DATA TYPES ==========")

print(train.dtypes)


# ============================================
# 5. Missing values
# ============================================

print("\n========== MISSING VALUES ==========")

missing = train.isnull().sum()

print(
    missing[missing > 0].sort_values(ascending=False)
)


# ============================================
# 6. Numerical feature statistics
# ============================================

numeric_features = [
    "response_size",
    "source_port",
    "status",
    "target_port",
    "response_time"
]
# Convert numeric-looking columns to numbers
for column in numeric_features:
    train[column] = pd.to_numeric(
        train[column],
        errors="coerce"
    )

print("\n========== NUMERICAL STATISTICS ==========")

print(
    train[numeric_features].describe()
)


# ============================================
# 7. Compare normal vs anomaly
# ============================================

print("\n========== NORMAL VS ANOMALY ==========")

comparison = train.groupby("type")[numeric_features].mean()

print(comparison)


# ============================================
# 8. HTTP methods
# ============================================

print("\n========== HTTP METHODS ==========")

print(
    pd.crosstab(
        train["method"],
        train["type"]
    )
)


# ============================================
# 9. HTTP status codes
# ============================================

print("\n========== STATUS CODES ==========")

print(
    pd.crosstab(
        train["status"],
        train["type"]
    )
)


# ============================================
# 10. User identity
# ============================================

print("\n========== USER IDENTITY ==========")

print(
    pd.crosstab(
        train["user_identity"],
        train["type"]
    )
)


# ============================================
# 11. Anomaly percentage by method
# ============================================

method_analysis = pd.crosstab(
    train["method"],
    train["type"],
    normalize="index"
) * 100

print("\n========== ANOMALY % BY METHOD ==========")

print(method_analysis)


# ============================================
# 12. Response time comparison
# ============================================

print("\n========== RESPONSE TIME ==========")

for label in ["normal", "anomaly"]:

    values = train[
        train["type"] == label
    ]["response_time"]

    print(f"\n{label.upper()}")

    print("Mean  :", values.mean())
    print("Median:", values.median())
    print("Min   :", values.min())
    print("Max   :", values.max())


# ============================================
# 13. Response size comparison
# ============================================

print("\n========== RESPONSE SIZE ==========")

for label in ["normal", "anomaly"]:

    values = train[
        train["type"] == label
    ]["response_size"]

    print(f"\n{label.upper()}")

    print("Mean  :", values.mean())
    print("Median:", values.median())
    print("Min   :", values.min())
    print("Max   :", values.max())


print("\n========== EDA COMPLETED ==========")