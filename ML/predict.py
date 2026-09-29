import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from tensorflow.keras.models import load_model  # type: ignore


# ============================================
# PATHS
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

MODEL_PATH = BASE_DIR / "api_sentinel_autoencoder_v2.keras"
SCALER_PATH = BASE_DIR / "scaler_v2.pkl"
THRESHOLD_PATH = BASE_DIR / "threshold.pkl"


# ============================================
# LOAD ML ARTIFACTS
# ============================================

model = load_model(MODEL_PATH)

scaler = joblib.load(SCALER_PATH)

threshold = joblib.load(THRESHOLD_PATH)

print("Model loaded successfully!")
print("Scaler loaded successfully!")
print("Threshold:", threshold)

print("Model input shape:", model.input_shape)

if hasattr(scaler, "feature_names_in_"):
    print(
        "Scaler feature count:",
        len(scaler.feature_names_in_)
    )


# ============================================
# FEATURE ENGINEERING
# ============================================

def extract_features(data):

    # ----------------------------------------
    # Convert input dictionary to DataFrame
    # ----------------------------------------

    df = pd.DataFrame([data])

    df = df.fillna("")


    # ----------------------------------------
    # Required raw columns
    # ----------------------------------------

    required_columns = [
        "response_size",
        "source_port",
        "status",
        "target_port",
        "response_time",
        "method",
        "request_body",
        "response_body",
        "request_url",
        "request_headers",
        "response_headers"
    ]

    for col in required_columns:

        if col not in df.columns:
            df[col] = ""


    # ========================================
    # NUMERIC FEATURES
    # ========================================

    df["response_size"] = pd.to_numeric(
        df["response_size"],
        errors="coerce"
    ).fillna(0)

    df["source_port"] = pd.to_numeric(
        df["source_port"],
        errors="coerce"
    ).fillna(0)

    df["status"] = pd.to_numeric(
        df["status"],
        errors="coerce"
    ).fillna(0)

    df["target_port"] = pd.to_numeric(
        df["target_port"],
        errors="coerce"
    ).fillna(0)

    df["response_time"] = pd.to_numeric(
        df["response_time"],
        errors="coerce"
    ).fillna(0)


    # ========================================
    # HTTP METHOD FEATURES
    # ========================================

    method = (
        df["method"]
        .astype(str)
        .str.upper()
    )

    df["method_GET"] = (
        method == "GET"
    ).astype(int)

    df["method_POST"] = (
        method == "POST"
    ).astype(int)

    df["method_PUT"] = (
        method == "PUT"
    ).astype(int)

    df["method_DELETE"] = (
        method == "DELETE"
    ).astype(int)

    df["method_PATCH"] = (
        method == "PATCH"
    ).astype(int)


    # ========================================
    # STATUS GROUP FEATURES
    # ========================================

    df["status_2xx"] = (
        (df["status"] >= 200) &
        (df["status"] < 300)
    ).astype(int)

    df["status_3xx"] = (
        (df["status"] >= 300) &
        (df["status"] < 400)
    ).astype(int)

    df["status_4xx"] = (
        (df["status"] >= 400) &
        (df["status"] < 500)
    ).astype(int)

    df["status_5xx"] = (
        (df["status"] >= 500) &
        (df["status"] < 600)
    ).astype(int)


    # ========================================
    # LOG FEATURES
    # ========================================

    df["log_response_size"] = np.log1p(
        df["response_size"].clip(lower=0)
    )

    df["log_response_time"] = np.log1p(
        df["response_time"].clip(lower=0)
    )


    # ========================================
    # REQUEST BODY FEATURES
    # ========================================

    request_body = (
        df["request_body"]
        .astype(str)
    )

    df["request_body_length"] = (
        request_body.str.len()
    )

    df["request_body_digits"] = (
        request_body.str.count(r"\d")
    )

    df["request_body_special_chars"] = (
        request_body.str.count(
            r"[^a-zA-Z0-9\s]"
        )
    )

    df["request_body_braces"] = (
        request_body.str.count(r"[{}]")
    )


    # ========================================
    # RESPONSE BODY FEATURES
    # ========================================

    response_body = (
        df["response_body"]
        .astype(str)
    )

    df["response_body_length"] = (
        response_body.str.len()
    )


    # ========================================
    # URL FEATURES
    # ========================================

    url = (
        df["request_url"]
        .astype(str)
    )

    df["url_length"] = (
        url.str.len()
    )

    df["url_depth"] = (
        url.str.count("/")
    )

    df["has_query_parameters"] = (
        url.str.contains(
            r"\?",
            regex=True
        )
    ).astype(int)

    df["query_parameter_count"] = (
        url.str.count("=")
    )

    df["url_digits"] = (
        url.str.count(r"\d")
    )

    df["url_special_chars"] = (
        url.str.count(
            r"[^a-zA-Z0-9\s]"
        )
    )


    # ========================================
    # SECURITY URL FEATURES
    # ========================================

    df["has_path_traversal"] = (
        url.str.contains(
            r"\.\./|\.\.\\",
            regex=True
        )
    ).astype(int)

    df["has_encoded_chars"] = (
        url.str.contains(
            r"%[0-9A-Fa-f]{2}",
            regex=True
        )
    ).astype(int)


    # ========================================
    # HEADER FEATURES
    # ========================================

    request_headers = (
        df["request_headers"]
        .astype(str)
    )

    response_headers = (
        df["response_headers"]
        .astype(str)
    )

    df["request_headers_length"] = (
        request_headers.str.len()
    )

    df["response_headers_length"] = (
        response_headers.str.len()
    )

    df["request_header_count"] = (
        request_headers.str.count("\n") + 1
    )

    df["response_header_count"] = (
        response_headers.str.count("\n") + 1
    )


    # ========================================
    # EXACT V2 TRAINING FEATURE ORDER
    # ========================================

    feature_columns = [

        "response_size",
        "source_port",
        "status",
        "target_port",
        "response_time",

        "method_GET",
        "method_POST",
        "method_PUT",
        "method_DELETE",
        "method_PATCH",

        "status_2xx",
        "status_3xx",
        "status_4xx",
        "status_5xx",

        "log_response_size",
        "log_response_time",

        "request_body_length",
        "request_body_digits",
        "request_body_special_chars",
        "request_body_braces",

        "response_body_length",

        "url_length",
        "url_depth",
        "has_query_parameters",
        "query_parameter_count",
        "url_digits",
        "url_special_chars",

        "has_path_traversal",
        "has_encoded_chars",

        "request_headers_length",
        "response_headers_length",
        "request_header_count",
        "response_header_count"
    ]


    # Select all 33 features
    features = df[feature_columns].copy()

    return features


# ============================================
# PREDICTION FUNCTION
# ============================================

def predict_api(data):

    # ----------------------------------------
    # Step 1: Feature engineering
    # ----------------------------------------

    features = extract_features(data)


    # ----------------------------------------
    # Step 2: Verify feature compatibility
    # ----------------------------------------

    if hasattr(scaler, "feature_names_in_"):

        expected_features = list(
            scaler.feature_names_in_
        )

        features = features.reindex(
            columns=expected_features,
            fill_value=0
        )

    else:

        expected_features = list(
            features.columns
        )


    # ----------------------------------------
    # Safety check
    # ----------------------------------------

    if features.shape[1] != model.input_shape[-1]:

        raise ValueError(
            f"Feature count mismatch: "
            f"generated={features.shape[1]}, "
            f"model_expected={model.input_shape[-1]}"
        )


    # ----------------------------------------
    # Step 3: Scale features
    # ----------------------------------------

    scaled_features = scaler.transform(
        features
    )


    # ----------------------------------------
    # Step 4: Autoencoder reconstruction
    # ----------------------------------------

    reconstructed = model.predict(
        scaled_features,
        verbose=0
    )


    # ----------------------------------------
    # Step 5: Reconstruction error
    # ----------------------------------------

    error = np.mean(
        np.square(
            scaled_features - reconstructed
        ),
        axis=1
    )[0]


    # ----------------------------------------
    # Step 6: Compare against threshold
    # ----------------------------------------

    if error > threshold:

        prediction = "anomaly"

    else:

        prediction = "normal"


    # ----------------------------------------
    # Result
    # ----------------------------------------

    return {

        "prediction": prediction,

        "anomaly_score": float(error),

        "threshold": float(threshold)

    }


# ============================================
# LOCAL INFERENCE TEST
# ============================================

if __name__ == "__main__":

    # ========================================
    # Load original test dataset
    # ========================================

    test_data = pd.read_csv(
        DATASET_DIR / "test.csv"
    )


    # ========================================
    # Get known normal request
    # ========================================

    normal_rows = test_data[
        test_data["type"] == "normal"
    ]

    if len(normal_rows) == 0:

        raise ValueError(
            "No normal samples found in test.csv"
        )

    normal_row = normal_rows.iloc[0]


    # ========================================
    # Get known anomaly request
    # ========================================

    anomaly_rows = test_data[
        test_data["type"] == "anomaly"
    ]

    if len(anomaly_rows) == 0:

        raise ValueError(
            "No anomaly samples found in test.csv"
        )

    anomaly_row = anomaly_rows.iloc[0]


    # ========================================
    # Convert to dictionaries
    # ========================================

    normal_request = (
        normal_row.to_dict()
    )

    anomaly_request = (
        anomaly_row.to_dict()
    )


    # ========================================
    # Predict normal request
    # ========================================

    normal_result = predict_api(
        normal_request
    )


    # ========================================
    # Predict anomalous request
    # ========================================

    anomaly_result = predict_api(
        anomaly_request
    )


    # ========================================
    # Display results
    # ========================================

    print()
    print("========================================")
    print("API SENTINEL INFERENCE TEST")
    print("========================================")


    print()
    print("KNOWN NORMAL REQUEST")
    print("----------------------------------------")

    print(
        "Actual Label:",
        "normal"
    )

    print(
        "Predicted:",
        normal_result["prediction"]
    )

    print(
        "Anomaly Score:",
        normal_result["anomaly_score"]
    )

    print(
        "Threshold:",
        normal_result["threshold"]
    )


    print()
    print("KNOWN ANOMALOUS REQUEST")
    print("----------------------------------------")

    print(
        "Actual Label:",
        "anomaly"
    )

    print(
        "Predicted:",
        anomaly_result["prediction"]
    )

    print(
        "Anomaly Score:",
        anomaly_result["anomaly_score"]
    )

    print(
        "Threshold:",
        anomaly_result["threshold"]
    )


    print()
    print("========================================")