import pandas as pd
import numpy as np
from pathlib import Path


# ============================================
# 1. Paths
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"


# ============================================
# 2. Load data
# ============================================

train = pd.read_csv(DATASET_DIR / "train.csv")
test = pd.read_csv(DATASET_DIR / "test.csv")


# Remove malformed row
train = train[
    train["type"].isin(["normal", "anomaly"])
].copy()


# ============================================
# 3. Feature Engineering
# ============================================

def create_features(df):

    df = df.copy()

    # ----------------------------------------
    # Numeric columns
    # ----------------------------------------

    numeric_columns = [
        "response_size",
        "source_port",
        "status",
        "target_port",
        "response_time"
    ]

    for column in numeric_columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        ).fillna(0)


    # ----------------------------------------
    # HTTP Method
    # ----------------------------------------

    df["method"] = (
        df["method"]
        .fillna("")
        .astype(str)
        .str.upper()
    )

    methods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
    ]

    for method in methods:

        df[f"method_{method}"] = (
            df["method"] == method
        ).astype(int)


    # ----------------------------------------
    # HTTP Status Groups
    # ----------------------------------------

    df["status_2xx"] = (
        df["status"].between(200, 299)
    ).astype(int)

    df["status_3xx"] = (
        df["status"].between(300, 399)
    ).astype(int)

    df["status_4xx"] = (
        df["status"].between(400, 499)
    ).astype(int)

    df["status_5xx"] = (
        df["status"].between(500, 599)
    ).astype(int)


    # ========================================
    # RESPONSE FEATURES
    # ========================================

    df["log_response_size"] = np.log1p(
        df["response_size"].clip(lower=0)
    )

    df["log_response_time"] = np.log1p(
        df["response_time"]
    )


    # ========================================
    # REQUEST BODY FEATURES
    # ========================================

    df["request_body"] = (
        df["request_body"]
        .fillna("")
        .astype(str)
    )

    df["request_body_length"] = (
        df["request_body"].str.len()
    )

    df["request_body_digits"] = (
        df["request_body"].str.count(r"\d")
    )

    df["request_body_special_chars"] = (
        df["request_body"]
        .str.count(r"[^a-zA-Z0-9\s]")
    )

    df["request_body_braces"] = (
        df["request_body"].str.count(r"[{}]")
    )


    # ========================================
    # RESPONSE BODY FEATURES
    # ========================================

    df["response_body"] = (
        df["response_body"]
        .fillna("")
        .astype(str)
    )

    df["response_body_length"] = (
        df["response_body"].str.len()
    )


    # ========================================
    # URL FEATURES
    # ========================================

    df["request_url"] = (
        df["request_url"]
        .fillna("")
        .astype(str)
    )

    df["url_length"] = (
        df["request_url"].str.len()
    )

    df["url_depth"] = (
        df["request_url"]
        .str.strip("/")
        .str.count("/")
    )

    df["has_query_parameters"] = (
        df["request_url"]
        .str.contains(
            r"\?",
            regex=True
        )
    ).astype(int)

    df["query_parameter_count"] = (
        df["request_url"].str.count(r"\?")
    )

    df["url_digits"] = (
        df["request_url"].str.count(r"\d")
    )

    df["url_special_chars"] = (
        df["request_url"]
        .str.count(r"[^a-zA-Z0-9\s/]")
    )


    # ========================================
    # SECURITY-RELATED URL FEATURES
    # ========================================

    df["has_path_traversal"] = (
        df["request_url"]
        .str.contains(
            r"\.\./",
            regex=True
        )
    ).astype(int)

    df["has_encoded_chars"] = (
        df["request_url"]
        .str.contains(
            "%",
            regex=False
        )
    ).astype(int)


    # ========================================
    # HEADER FEATURES
    # ========================================

    df["request_headers"] = (
        df["request_headers"]
        .fillna("")
        .astype(str)
    )

    df["response_headers"] = (
        df["response_headers"]
        .fillna("")
        .astype(str)
    )

    df["request_headers_length"] = (
        df["request_headers"].str.len()
    )

    df["response_headers_length"] = (
        df["response_headers"].str.len()
    )

    df["request_header_count"] = (
        df["request_headers"].str.count(":")
    )

    df["response_header_count"] = (
        df["response_headers"].str.count(":")
    )


    return df


# ============================================
# 4. Create V2 features
# ============================================

train = create_features(train)
test = create_features(test)


# ============================================
# 5. Separate labels
# ============================================

y_train = train["type"]
y_test = test["type"]


X_train = train.drop(
    columns=["type"]
)

X_test = test.drop(
    columns=["type"]
)


# ============================================
# 6. Remove raw string columns
# ============================================

raw_columns = [
    "timestamp",
    "agent",
    "method",
    "request_body",
    "request_headers",
    "request_url",
    "response_body",
    "response_headers",
    "source_ip",
    "target_ip",
    "user_identity"
]

X_train = X_train.drop(
    columns=raw_columns,
    errors="ignore"
)

X_test = X_test.drop(
    columns=raw_columns,
    errors="ignore"
)


# ============================================
# 7. Make sure train/test columns match
# ============================================

X_test = X_test.reindex(
    columns=X_train.columns,
    fill_value=0
)


# ============================================
# 8. Convert everything to numeric
# ============================================

X_train = X_train.apply(
    pd.to_numeric,
    errors="coerce"
).fillna(0)

X_test = X_test.apply(
    pd.to_numeric,
    errors="coerce"
).fillna(0)


# ============================================
# 9. Save V2 datasets
# ============================================

X_train.to_csv(
    DATASET_DIR / "X_train_v2.csv",
    index=False
)

X_test.to_csv(
    DATASET_DIR / "X_test_v2.csv",
    index=False
)

y_train.to_csv(
    DATASET_DIR / "y_train_v2.csv",
    index=False
)

y_test.to_csv(
    DATASET_DIR / "y_test_v2.csv",
    index=False
)


# ============================================
# 10. Output
# ============================================

print("\n========================================")
print("V2 PREPROCESSING COMPLETED")
print("========================================")

print("\nX_train V2:", X_train.shape)
print("X_test V2 :", X_test.shape)

print("\nNumber of features:", X_train.shape[1])

print("\nFeatures:")
print(X_train.columns.tolist())

print("\nTraining labels:")
print(y_train.value_counts())

print("\nSaved:")
print("X_train_v2.csv")
print("X_test_v2.csv")
print("y_train_v2.csv")
print("y_test_v2.csv")

print("\n========== DATA QUALITY CHECK ==========")

print("NaN values:", X_train.isna().sum().sum())
print("Infinite values:", np.isinf(X_train).sum().sum())

print("\nMaximum feature values:")
print(X_train.max().sort_values(ascending=False).head(10))

print("\nMinimum feature values:")
print(X_train.min().sort_values().head(10))