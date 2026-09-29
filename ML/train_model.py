import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import classification_report, confusion_matrix
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

X_train = pd.read_csv(DATASET_DIR / "X_train.csv")
X_test = pd.read_csv(DATASET_DIR / "X_test.csv")

y_train = pd.read_csv(DATASET_DIR / "y_train.csv")["type"]
y_test = pd.read_csv(DATASET_DIR / "y_test.csv")["type"]

print("X_train:", X_train.shape)
print("X_test :", X_test.shape)
# ============================================
# 2. Keep ONLY normal requests for training
# ============================================
normal_mask = y_train == "normal"
X_normal = X_train[normal_mask].copy()

print("\nNormal training samples:", len(X_normal))
print("Anomaly samples excluded from training:",(~normal_mask).sum())
# ============================================
# 3. Scale the features
# ============================================
scaler = StandardScaler()
X_normal_scaled = scaler.fit_transform(X_normal)
X_test_scaled = scaler.transform(X_test)
# ============================================
# 4. Create Autoencoder
# ============================================
autoencoder = MLPRegressor(hidden_layer_sizes=(12, 6, 12),activation="relu",solver="adam",learning_rate_init=0.001,max_iter=200,random_state=42,early_stopping=True,validation_fraction=0.1,n_iter_no_change=10)
# ============================================
# 5. Train on normal traffic
# ============================================

print("\nTraining Autoencoder...")

autoencoder.fit(X_normal_scaled,X_normal_scaled)

print("Training completed!")
print("Iterations:", autoencoder.n_iter_)
# ============================================
# 6. Calculate reconstruction error
# ============================================

X_normal_reconstructed = autoencoder.predict(X_normal_scaled)

normal_errors = np.mean(np.square(X_normal_scaled - X_normal_reconstructed),axis=1)

# ============================================
# 7. Determine anomaly threshold
# ============================================

threshold = np.percentile(normal_errors, 99)

print("\nAnomaly threshold:", threshold)
# ============================================
# 8. Test the model
# ============================================

X_test_reconstructed = autoencoder.predict(X_test_scaled)

test_errors = np.mean(np.square(X_test_scaled - X_test_reconstructed),axis=1)


# ============================================
# 9. Convert anomaly scores to predictions
# ============================================

predictions = np.where(test_errors>threshold,"anomaly","normal")
# ============================================
# 10. Evaluate
# ============================================

print("\nActual test labels:")
print(y_test.value_counts())

print("\nPredicted labels:")
print(pd.Series(predictions).value_counts())

print("\nConfusion Matrix:")
print(confusion_matrix(y_test,predictions,labels=["normal", "anomaly"]))

print("\nClassification Report:")
print(classification_report(y_test,predictions,labels=["normal", "anomaly"],zero_division=0))

# ============================================
# 11. Save model and scaler
# ============================================

joblib.dump(autoencoder,"autoencoder.pkl")

joblib.dump(scaler,"scaler.pkl")
joblib.dump(threshold,"threshold.pkl")

print("\nModel saved!")
print("  autoencoder.pkl")
print("  scaler.pkl")
print("  threshold.pkl")