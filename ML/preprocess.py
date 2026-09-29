import pandas as pd
import numpy as np


# =========================
# 1. Load datasets
# =========================

train_path = "dataset/train.csv"
test_path = "dataset/test.csv"

train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)

# Remove malformed rows with invalid labels
train_df = train_df[
    train_df["type"].isin(["normal", "anomaly"])
].copy()

test_df = test_df[
    test_df["type"].isin(["normal", "anomaly"])
].copy()

print("Train shape:", train_df.shape)
print("Test shape:", test_df.shape)


# =========================
# 2. Basic cleaning
# =========================

# Remove completely empty columns
train_df = train_df.dropna(axis=1, how="all")
test_df = test_df.dropna(axis=1, how="all")

# Replace missing values in object columns
for df in [train_df, test_df]:
    object_columns = df.select_dtypes(include=["object"]).columns
    df[object_columns] = df[object_columns].fillna("")

# Replace missing numerical values
for df in [train_df, test_df]:
    numerical_columns = df.select_dtypes(include=[np.number]).columns
    df[numerical_columns] = df[numerical_columns].fillna(0)


# =========================
# 3. Feature engineering
# =========================

def create_features(df):

    # Make a copy so original dataframe is not modified
    df = df.copy()

    # -------------------------
    # HTTP method
    # -------------------------
    df["method"] = df["method"].str.upper()

    for method in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
        df[f"method_{method}"] = (df["method"] == method).astype(int)

    # -------------------------
    # HTTP status
    # -------------------------
    df["status"]=pd.to_numeric(df["status"],errors="coerce").fillna(0)
    df["status_2xx"] = df["status"].between(200, 299).astype(int)
    df["status_4xx"] = df["status"].between(400, 499).astype(int)
    df["status_5xx"] = df["status"].between(500, 599).astype(int)

    # -------------------------
    # Request body
    # -------------------------
    df["request_body_length"] = df["request_body"].astype(str).str.len()

    # -------------------------
    # Response body
    # -------------------------
    df["response_body_length"] = df["response_body"].astype(str).str.len()

    # -------------------------
    # URL features
    # -------------------------
    df["url_length"] = df["request_url"].astype(str).str.len()

    df["url_depth"] = (
        df["request_url"]
        .astype(str)
        .str.strip("/")
        .str.count("/")
    )

    # Query parameters
    df["has_query_parameters"] = (
        df["request_url"].astype(str).str.contains(r"\?", regex=True)
    ).astype(int)

    # -------------------------
    # Headers
    # -------------------------
    df["request_headers_length"] = (
        df["request_headers"].astype(str).str.len()
    )

    df["response_headers_length"] = (
        df["response_headers"].astype(str).str.len()
    )

    # -------------------------
    # Network features
    # -------------------------
    df["source_port"] = pd.to_numeric(
        df["source_port"], errors="coerce"
    ).fillna(0)

    df["target_port"] = pd.to_numeric(
        df["target_port"], errors="coerce"
    ).fillna(0)

    # -------------------------
    # Response time
    # -------------------------
    df["response_time"] = pd.to_numeric(
        df["response_time"], errors="coerce"
    ).fillna(0)

    # -------------------------
    # Response size
    # -------------------------
    df["response_size"] = pd.to_numeric(
        df["response_size"], errors="coerce"
    ).fillna(0)

    return df


train_df = create_features(train_df)
test_df = create_features(test_df)


# =========================
# 4. Separate target
# =========================

y_train = train_df["type"]
y_test = test_df["type"]

X_train = train_df.drop(columns=["type"])
X_test = test_df.drop(columns=["type"])


# =========================
# 5. Remove raw columns
# =========================

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


# =========================
# 6. Make sure train/test
#    have identical columns
# =========================

X_test = X_test.reindex(
    columns=X_train.columns,
    fill_value=0
)


# =========================
# 7. Convert everything
#    to numeric
# =========================

X_train = X_train.apply(
    pd.to_numeric,
    errors="coerce"
).fillna(0)

X_test = X_test.apply(
    pd.to_numeric,
    errors="coerce"
).fillna(0)


# =========================
# 8. Save processed data
# =========================

X_train.to_csv("dataset/X_train.csv", index=False)
X_test.to_csv("dataset/X_test.csv", index=False)

y_train.to_csv("dataset/y_train.csv", index=False)
y_test.to_csv("dataset/y_test.csv", index=False)


# =========================
# 9. Final information
# =========================

print("\nPreprocessing completed!")

print("X_train:", X_train.shape)
print("X_test :", X_test.shape)

print("\nFeatures:")
print(X_train.columns.tolist())

print("\nTraining labels:")
print(y_train.value_counts())

print("\nRows with unexpected labels:")
print(train_df[~train_df["type"].isin(["normal", "anomaly"])][
    ["timestamp", "method", "request_url", "status", "type"]
])