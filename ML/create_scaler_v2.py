import pandas as pd
import joblib

from pathlib import Path
from sklearn.preprocessing import StandardScaler


# ============================================
# PATHS
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"


# ============================================
# LOAD V2 TRAINING DATA
# ============================================

X_train = pd.read_csv(
    DATASET_DIR / "X_train_v2.csv"
)

y_train = pd.read_csv(
    DATASET_DIR / "y_train_v2.csv"
)


print("X_train shape:", X_train.shape)


# ============================================
# KEEP ONLY NORMAL TRAFFIC
# ============================================

normal_mask = (
    y_train["type"] == "normal"
)

X_normal = X_train[
    normal_mask
].copy()


print(
    "Normal training samples:",
    len(X_normal)
)


# ============================================
# CREATE SCALER
# ============================================

scaler = StandardScaler()

X_normal_scaled = scaler.fit_transform(
    X_normal
)


# ============================================
# DISPLAY FEATURES
# ============================================

print()
print("========================================")
print("V2 SCALER")
print("========================================")

print(
    "Feature count:",
    len(scaler.feature_names_in_)
)

print(
    "Features:"
)

for i, feature in enumerate(
    scaler.feature_names_in_,
    start=1
):

    print(
        f"{i}. {feature}"
    )


# ============================================
# SAVE SCALER
# ============================================

output_path = (
    BASE_DIR / "scaler_v2.pkl"
)

joblib.dump(
    scaler,
    output_path
)


print()
print(
    "Scaler saved successfully!"
)

print(
    "Path:",
    output_path
)

print(
    "Scaler feature count:",
    len(
        scaler.feature_names_in_
    )
)

print("========================================")