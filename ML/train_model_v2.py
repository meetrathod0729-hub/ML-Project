import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.preprocessing import StandardScaler

from tensorflow.keras.models import Model # type: ignore
from tensorflow.keras.layers import Input, Dense # type: ignore
from tensorflow.keras.callbacks import EarlyStopping # type: ignore

import joblib


# ============================================
# 1. Paths
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"


# ============================================
# 2. Load V2 data
# ============================================

X_train = pd.read_csv(
    DATASET_DIR / "X_train_v2.csv"
)

y_train = pd.read_csv(
    DATASET_DIR / "y_train_v2.csv"
)


print("X_train shape:", X_train.shape)


# ============================================
# 3. Train only on NORMAL traffic
# ============================================

normal_mask = (
    y_train["type"] == "normal"
)

X_normal = X_train[
    normal_mask
].copy()


print("Normal training samples:", len(X_normal))


# ============================================
# 4. Scale features
# ============================================

scaler = StandardScaler()

X_normal_scaled = scaler.fit_transform(
    X_normal
)


# Save scaler
joblib.dump(
    scaler,
    DATASET_DIR / "scaler_v2.pkl"
)


# ============================================
# 5. Autoencoder architecture
# ============================================

input_dim = X_normal_scaled.shape[1]


input_layer = Input(
    shape=(input_dim,)
)


# Encoder
encoded = Dense(
    24,
    activation="relu"
)(input_layer)

encoded = Dense(
    12,
    activation="relu"
)(encoded)

encoded = Dense(
    6,
    activation="relu"
)(encoded)


# Decoder
decoded = Dense(
    12,
    activation="relu"
)(encoded)

decoded = Dense(
    24,
    activation="relu"
)(decoded)

decoded = Dense(
    input_dim,
    activation="linear"
)(decoded)


autoencoder = Model(
    input_layer,
    decoded
)


# ============================================
# 6. Compile
# ============================================

autoencoder.compile(
    optimizer="adam",
    loss="mse"
)


autoencoder.summary()


# ============================================
# 7. Early stopping
# ============================================

early_stopping = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)


# ============================================
# 8. Train
# ============================================

history = autoencoder.fit(
    X_normal_scaled,
    X_normal_scaled,

    epochs=50,

    batch_size=32,

    validation_split=0.2,

    callbacks=[
        early_stopping
    ],

    verbose=1
)


# ============================================
# 9. Save model
# ============================================

autoencoder.save(
    BASE_DIR / "api_sentinel_autoencoder_v2.keras"
)


print("\n========================================")
print("V2 MODEL TRAINING COMPLETED")
print("========================================")

print(
    "Model saved as:"
)

print(
    "api_sentinel_autoencoder_v2.keras"
)

print(
    "Scaler saved as:"
)

print(
    "scaler_v2.pkl"
)