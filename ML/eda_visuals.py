import pandas as pd
import matplotlib.pyplot as plt

from pathlib import Path


# ============================================
# 1. Paths
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"

PLOT_DIR = BASE_DIR / "eda_plots"
PLOT_DIR.mkdir(exist_ok=True)


# ============================================
# 2. Load dataset
# ============================================

train = pd.read_csv(DATASET_DIR / "train.csv")

# Remove malformed row
train = train[
    train["type"].isin(["normal", "anomaly"])
].copy()


# Convert numeric columns
numeric_features = [
    "response_size",
    "source_port",
    "status",
    "target_port",
    "response_time"
]

for column in numeric_features:
    train[column] = pd.to_numeric(
        train[column],
        errors="coerce"
    )


# ============================================
# 3. Label distribution
# ============================================

plt.figure(figsize=(7, 5))

train["type"].value_counts().plot(
    kind="bar"
)

plt.title("Normal vs Anomaly Requests")
plt.xlabel("Request Type")
plt.ylabel("Number of Requests")
plt.xticks(rotation=0)
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "01_label_distribution.png"
)

plt.show()


# ============================================
# 4. Response time distribution
# ============================================

plt.figure(figsize=(8, 5))

for label in ["normal", "anomaly"]:

    values = train[
        train["type"] == label
    ]["response_time"].dropna()

    plt.hist(
        values,
        bins=40,
        alpha=0.6,
        label=label
    )

plt.title("Response Time Distribution")
plt.xlabel("Response Time")
plt.ylabel("Frequency")
plt.legend()
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "02_response_time.png"
)

plt.show()


# ============================================
# 5. Response size distribution
# ============================================

plt.figure(figsize=(8, 5))

for label in ["normal", "anomaly"]:

    values = train[
        train["type"] == label
    ]["response_size"].dropna()

    plt.hist(
        values,
        bins=40,
        alpha=0.6,
        label=label
    )

plt.title("Response Size Distribution")
plt.xlabel("Response Size")
plt.ylabel("Frequency")
plt.legend()
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "03_response_size.png"
)

plt.show()


# ============================================
# 6. HTTP method vs request type
# ============================================

method_counts = pd.crosstab(
    train["method"],
    train["type"]
)

plt.figure(figsize=(8, 5))

method_counts.plot(
    kind="bar",
    ax=plt.gca()
)

plt.title("HTTP Method vs Request Type")
plt.xlabel("HTTP Method")
plt.ylabel("Number of Requests")
plt.xticks(rotation=0)
plt.legend(title="Type")
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "04_method_vs_type.png"
)

plt.show()


# ============================================
# 7. Status code vs request type
# ============================================

status_counts = pd.crosstab(
    train["status"],
    train["type"]
)

# Show the most frequent status codes
status_counts = status_counts.head(15)

plt.figure(figsize=(10, 5))

status_counts.plot(
    kind="bar",
    ax=plt.gca()
)

plt.title("HTTP Status Code vs Request Type")
plt.xlabel("HTTP Status")
plt.ylabel("Number of Requests")
plt.xticks(rotation=45)
plt.legend(title="Type")
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "05_status_vs_type.png"
)

plt.show()


# ============================================
# 8. Correlation matrix
# ============================================

correlation_features = [
    "response_size",
    "source_port",
    "status",
    "target_port",
    "response_time"
]

correlation = train[
    correlation_features
].corr()

plt.figure(figsize=(8, 6))

plt.imshow(
    correlation,
    interpolation="nearest"
)

plt.colorbar()

plt.xticks(
    range(len(correlation_features)),
    correlation_features,
    rotation=45,
    ha="right"
)

plt.yticks(
    range(len(correlation_features)),
    correlation_features
)

plt.title("Feature Correlation Matrix")

plt.tight_layout()

plt.savefig(
    PLOT_DIR / "06_correlation.png"
)

plt.show()


print("\n================================")
print("EDA VISUALIZATION COMPLETED")
print("================================")

print("\nPlots saved in:")
print(PLOT_DIR)