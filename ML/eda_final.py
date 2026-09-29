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


# ============================================
# 3. Convert numerical columns
# ============================================

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
# 4. Anomaly rate by HTTP method
# ============================================

method_rate = (
    train.groupby("method")["type"]
    .apply(lambda x: (x == "anomaly").mean() * 100)
    .sort_values(ascending=False)
)

plt.figure(figsize=(10, 6))

method_rate.plot(
    kind="bar"
)

plt.title("Anomaly Rate by HTTP Method")
plt.xlabel("HTTP Method")
plt.ylabel("Anomaly Rate (%)")
plt.xticks(rotation=45)
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "07_anomaly_rate_method.png"
)

plt.show()


# ============================================
# 5. Anomaly rate by HTTP status
# ============================================

status_rate = (
    train.groupby("status")["type"]
    .apply(lambda x: (x == "anomaly").mean() * 100)
    .sort_values(ascending=False)
)

# Only show statuses that occur at least twice
status_counts = train["status"].value_counts()

valid_statuses = status_counts[
    status_counts >= 2
].index

status_rate = status_rate[
    status_rate.index.isin(valid_statuses)
]

# Show top 15 anomaly-rate statuses
status_rate = status_rate.head(15)


plt.figure(figsize=(10, 6))

status_rate.plot(
    kind="bar"
)

plt.title("Anomaly Rate by HTTP Status")
plt.xlabel("HTTP Status")
plt.ylabel("Anomaly Rate (%)")
plt.xticks(rotation=45)
plt.tight_layout()

plt.savefig(
    PLOT_DIR / "08_anomaly_rate_status.png"
)

plt.show()


# ============================================
# 6. Response time boxplot
# ============================================

normal_time = train[
    train["type"] == "normal"
]["response_time"].dropna()

anomaly_time = train[
    train["type"] == "anomaly"
]["response_time"].dropna()


plt.figure(figsize=(8, 6))

plt.boxplot(
    [normal_time, anomaly_time],
    labels=["Normal", "Anomaly"],
    showfliers=False
)

plt.title("Response Time: Normal vs Anomaly")
plt.xlabel("Request Type")
plt.ylabel("Response Time")

plt.tight_layout()

plt.savefig(
    PLOT_DIR / "09_response_time_boxplot.png"
)

plt.show()


# ============================================
# 7. Response size boxplot
# ============================================

normal_size = train[
    train["type"] == "normal"
]["response_size"].dropna()

anomaly_size = train[
    train["type"] == "anomaly"
]["response_size"].dropna()


plt.figure(figsize=(8, 6))

plt.boxplot(
    [normal_size, anomaly_size],
    labels=["Normal", "Anomaly"],
    showfliers=False
)

plt.title("Response Size: Normal vs Anomaly")
plt.xlabel("Request Type")
plt.ylabel("Response Size")

plt.tight_layout()

plt.savefig(
    PLOT_DIR / "10_response_size_boxplot.png"
)

plt.show()


# ============================================
# 8. Print useful values
# ============================================

print("\n========================================")
print("ANOMALY RATE BY HTTP METHOD")
print("========================================")

print(method_rate)


print("\n========================================")
print("ANOMALY RATE BY HTTP STATUS")
print("========================================")

print(status_rate)


print("\n========================================")
print("EDA FINAL COMPLETED")
print("========================================")