import pandas as pd
import numpy as np
import joblib

from tensorflow.keras.models import load_model # type: ignore
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    accuracy_score
)

# ============================================
# 1. Paths
# ============================================

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

# ============================================
# 2. Load model and scaler
# ============================================

model = load_model(
    BASE_DIR / "api_sentinel_autoencoder_v2.keras"
)

scaler = joblib.load(
    DATASET_DIR / "scaler_v2.pkl"
)

print("V2 Model loaded successfully!")

# ============================================
# 3. Load test data
# ============================================

X_test = pd.read_csv(
    DATASET_DIR / "X_test_v2.csv"
)

y_test = pd.read_csv(
    DATASET_DIR / "y_test_v2.csv"
)["type"]

print("Test samples:", len(X_test))

# ============================================
# 4. Scale test data
# ============================================

X_test_scaled = scaler.transform(X_test)

# ============================================
# 5. Calculate reconstruction error
# ============================================

X_reconstructed = model.predict(
    X_test_scaled,
    verbose=0
)

errors = np.mean(
    np.square(
        X_test_scaled - X_reconstructed
    ),
    axis=1
)

# ============================================
# 6. Determine threshold
# ============================================

X_train = pd.read_csv(
    DATASET_DIR / "X_train_v2.csv"
)

X_train_scaled = scaler.transform(X_train)

X_train_reconstructed = model.predict(
    X_train_scaled,
    verbose=0
)

train_errors = np.mean(
    np.square(
        X_train_scaled - X_train_reconstructed
    ),
    axis=1
)

# ============================================
# Calculate threshold using NORMAL traffic only
# ============================================

y_train = pd.read_csv(
    DATASET_DIR / "y_train_v2.csv"
)["type"]

normal_mask = (
    y_train == "normal"
)

normal_train_errors = train_errors[
    normal_mask.values
]

threshold = np.percentile(
    normal_train_errors,
    95
)

print("Threshold:", threshold)
joblib.dump(
    threshold,
    DATASET_DIR / "threshold_v2.pkl"
)

print(
    "Threshold saved as: threshold_v2.pkl"
)

# ============================================
# 7. Predict
# ============================================

y_pred = np.where(
    errors > threshold,
    "anomaly",
    "normal"
)

# ============================================
# 8. Evaluation
# ============================================

print("\nActual labels:")
print(y_test.value_counts())

print("\nPredicted labels:")
print(pd.Series(y_pred).value_counts())

print("\nAccuracy:")
print(accuracy_score(y_test, y_pred))

print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y_test,
        y_pred,
        labels=["normal", "anomaly"]
    )
)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred
    )
)

# ============================================
# 9. Save results
# ============================================

results = X_test.copy()

results["actual"] = y_test.values
results["reconstruction_error"] = errors
results["predicted"] = y_pred

results.to_csv(
    DATASET_DIR / "test_results_v2.csv",
    index=False
)

print("\nSaved:")
print("test_results_v2.csv")

print("\n========================================")
print("V2 EVALUATION COMPLETED")
print("========================================")