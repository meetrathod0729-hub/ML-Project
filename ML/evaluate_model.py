import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)


# ============================================
# 1. Paths
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"


# ============================================
# 2. Load test data
# ============================================

X_test = pd.read_csv(DATASET_DIR / "X_test.csv")
y_test = pd.read_csv(DATASET_DIR / "y_test.csv")["type"]


# ============================================
# 3. Load trained model
# ============================================

model = joblib.load(BASE_DIR / "autoencoder.pkl")
scaler = joblib.load(BASE_DIR / "scaler.pkl")
threshold = joblib.load(BASE_DIR / "threshold.pkl")


print("Model loaded successfully!")
print("Test samples:", len(X_test))
print("Threshold:", threshold)


# ============================================
# 4. Scale test data
# ============================================

X_test_scaled = scaler.transform(X_test)


# ============================================
# 5. Calculate reconstruction error
# ============================================

X_reconstructed = model.predict(X_test_scaled)

errors = np.mean(
    np.square(X_test_scaled - X_reconstructed),
    axis=1
)


# ============================================
# 6. Make predictions
# ============================================

predictions = np.where(
    errors > threshold,
    "anomaly",
    "normal"
)
# ============================================
# Save detailed prediction results
# ============================================

original_test = pd.read_csv(DATASET_DIR / "test.csv")

original_test["anomaly_score"] = errors
original_test["predicted_type"] = predictions

original_test["correct"] = (
    original_test["type"] == original_test["predicted_type"]
)

original_test.to_csv(
    DATASET_DIR / "test_results.csv",
    index=False
)

print("\nDetailed results saved to:")
print(DATASET_DIR / "test_results.csv")


# ============================================
# 7. Evaluation
# ============================================

print("\nActual labels:")
print(y_test.value_counts())

print("\nPredicted labels:")
print(pd.Series(predictions).value_counts())


print("\nAccuracy:")
print(accuracy_score(y_test, predictions))


print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y_test,
        predictions,
        labels=["normal", "anomaly"]
    )
)


print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        labels=["normal", "anomaly"],
        zero_division=0
    )
)


# ============================================
# 8. Show anomaly score information
# ============================================

print("\nError statistics:")
print("Minimum:", errors.min())
print("Maximum:", errors.max())
print("Mean   :", errors.mean())
print("Median :", np.median(errors))

print("\nEvaluation completed!")