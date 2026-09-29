import argparse
import concurrent.futures
import random
import time

import pandas as pd
import requests


TARGET_URL = "http://localhost:5000/api/analyze"
TRAIN_DATASET = "dataset/train.csv"


# =========================================================
# LOAD REAL NORMAL TRAFFIC
# =========================================================

def load_normal_dataset():
    """
    Load real normal API requests from the FUR-API training dataset.

    This is intentionally used instead of inventing arbitrary
    'normal' values. The autoencoder was trained on this dataset,
    so replaying its normal traffic gives us a fairer ML test.
    """

    df = pd.read_csv(TRAIN_DATASET)

    if "type" not in df.columns:
        raise ValueError(
            f"'type' column not found in {TRAIN_DATASET}"
        )

    normal_df = df[
        df["type"].astype(str).str.lower() == "normal"
    ].copy()

    if normal_df.empty:
        raise ValueError(
            "No normal records were found in the training dataset."
        )

    return normal_df.reset_index(drop=True)


NORMAL_DF = load_normal_dataset()


# =========================================================
# HELPERS
# =========================================================

def clean_value(value, default=""):
    """Convert pandas values safely into JSON-friendly values."""

    if pd.isna(value):
        return default

    if hasattr(value, "item"):
        value = value.item()

    return value


# =========================================================
# NORMAL TRAFFIC
# =========================================================

def make_normal_request(i):
    """
    Replay a real NORMAL request from the FUR-API dataset.

    We preserve the raw request/response characteristics so that
    the 33 engineered features remain close to the distribution
    seen during model training.
    """

    row = NORMAL_DF.iloc[i % len(NORMAL_DF)]

    payload = {
        "method": clean_value(row.get("method"), "GET"),
        "request_url": clean_value(row.get("request_url"), "/"),
        "request_body": clean_value(row.get("request_body"), ""),
        "request_headers": clean_value(row.get("request_headers"), ""),
        "response_body": clean_value(row.get("response_body"), ""),
        "response_headers": clean_value(row.get("response_headers"), ""),
        "response_size": clean_value(row.get("response_size"), 0),
        "source_ip": clean_value(row.get("source_ip"), "192.168.1.10"),
        "source_port": clean_value(row.get("source_port"), 50000),
        "status": clean_value(row.get("status"), 200),
        "target_ip": clean_value(row.get("target_ip"), "10.0.0.10"),
        "target_port": clean_value(row.get("target_port"), 80),
        "response_time": clean_value(row.get("response_time"), 200),
        "user_identity": clean_value(row.get("user_identity"), "normal_user")
    }

    return payload


# =========================================================
# SUSPICIOUS TRAFFIC
# =========================================================

def suspicious_request(i):

    suspicious_urls = [
        "/api/users/../../etc/passwd",
        "/api/admin?cmd=../../etc/passwd",
        "/api/search?q=%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "/api/users?id=999999999999999999999",
        "/api/%2e%2e/%2e%2e/etc/passwd"
    ]

    huge_body = (
        '{"payload":"'
        + "A" * random.randint(3000, 8000)
        + '","cmd":"../../etc/passwd"}'
    )

    return {
        "method": random.choice(
            ["POST", "PUT", "PATCH", "DELETE"]
        ),

        "request_url": random.choice(
            suspicious_urls
        ),

        "request_body": huge_body,

        "request_headers": (
            '{"content-type":"application/json",'
            '"x-forwarded-for":"10.0.0.1",'
            '"x-custom-header":"'
            + "X" * 1000
            + '"}'
        ),

        "response_body": (
            "A" * random.randint(3000, 8000)
        ),

        "response_headers":
            '{"content-type":"text/html"}',

        "response_size":
            random.randint(5000, 20000),

        "source_ip":
            f"10.0.0.{random.randint(1, 254)}",

        "source_port":
            random.randint(1, 65535),

        "status":
            random.choice(
                [400, 401, 403, 404, 500]
            ),

        "target_ip":
            "10.0.0.10",

        "target_port":
            8000,

        "response_time":
            random.randint(500, 3000),

        "user_identity":
            "suspicious_client"
    }


# =========================================================
# SEND REQUEST
# =========================================================

def send_request(i, mode, timeout):

    if mode == "normal":
        payload = make_normal_request(i)
    else:
        payload = suspicious_request(i)

    start = time.perf_counter()

    try:

        response = requests.post(
            TARGET_URL,
            json=payload,
            timeout=timeout
        )

        latency = (
            time.perf_counter() - start
        ) * 1000

        # -------------------------------------------------
        # TRY TO PARSE JSON RESPONSE
        # -------------------------------------------------

        try:
            data = response.json()
        except Exception:
            data = {}

        prediction = None

        if isinstance(data, dict):

            result = data.get(
                "result",
                {}
            )

            if isinstance(result, dict):

                prediction = result.get(
                    "prediction"
                )

        # -------------------------------------------------
        # SUCCESSFUL REQUEST
        # -------------------------------------------------

        if response.status_code == 200:

            return {
                "success": True,

                "status":
                    response.status_code,

                "latency":
                    latency,

                "prediction":
                    str(prediction).lower()
                    if prediction is not None
                    else "unknown"
            }

        # -------------------------------------------------
        # FAILED HTTP REQUEST
        #
        # IMPORTANT:
        # Keep the response body so we can see exactly
        # why FastAPI returned 422.
        # -------------------------------------------------

        return {
            "success": False,

            "status":
                response.status_code,

            "latency":
                latency,

            "prediction":
                "unknown",

            "error":
                response.text,

            "payload":
                payload
        }

    except Exception as error:

        return {
            "success": False,

            "status":
                "ERROR",

            "latency":
                None,

            "prediction":
                "error",

            "error":
                str(error)
        }


# =========================================================
# MAIN
# =========================================================

def main():

    parser = argparse.ArgumentParser(
        description=
        "API Sentinel controlled ML traffic test"
    )

    parser.add_argument(
        "--requests",
        type=int,
        default=100
    )

    parser.add_argument(
        "--workers",
        type=int,
        default=10
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=30
    )

    parser.add_argument(
        "--mode",
        choices=[
            "normal",
            "suspicious"
        ],
        required=True,
        help="Traffic profile to test"
    )

    args = parser.parse_args()


    # -----------------------------------------------------
    # INFORMATION
    # -----------------------------------------------------

    print("=" * 64)
    print("API SENTINEL CONTROLLED ML TEST")
    print("=" * 64)

    print(
        f"Target      : {TARGET_URL}"
    )

    print(
        f"Mode        : {args.mode.upper()}"
    )

    print(
        f"Requests    : {args.requests}"
    )

    print(
        f"Workers     : {args.workers}"
    )

    print(
        f"Timeout     : {args.timeout}s"
    )

    if args.mode == "normal":

        print(
            f"Normal source: {TRAIN_DATASET}"
        )

        print(
            f"Normal rows : {len(NORMAL_DF)}"
        )

        print(
            "Normal traffic: REAL FUR-API training records"
        )

    else:

        print(
            "Suspicious traffic: synthetic attack patterns"
        )

    print("=" * 64)


    # -----------------------------------------------------
    # RUN
    # -----------------------------------------------------

    start = time.perf_counter()

    results = []

    with concurrent.futures.ThreadPoolExecutor(
        max_workers=args.workers
    ) as executor:

        futures = [

            executor.submit(
                send_request,
                i,
                args.mode,
                args.timeout
            )

            for i in range(args.requests)
        ]


        for completed, future in enumerate(
            concurrent.futures.as_completed(
                futures
            ),
            start=1
        ):

            results.append(
                future.result()
            )

            progress_step = max(
                1,
                args.requests // 10
            )

            if (
                completed % progress_step == 0
                or completed == args.requests
            ):

                print(
                    f"Progress: "
                    f"{completed}/{args.requests}"
                )


    total_time = (
        time.perf_counter() - start
    )


    # -----------------------------------------------------
    # RESULTS
    # -----------------------------------------------------

    successful = [
        r for r in results
        if r["success"]
    ]

    failed = [
        r for r in results
        if not r["success"]
    ]


    normal = sum(
        1
        for r in results
        if r["prediction"] == "normal"
    )


    anomaly = sum(
        1
        for r in results
        if r["prediction"] == "anomaly"
    )


    unknown = sum(
        1
        for r in results
        if r["prediction"]
        not in ["normal", "anomaly"]
    )


    latencies = [
        r["latency"]
        for r in results
        if r["latency"] is not None
    ]


    print(
        "\n" + "=" * 64
    )

    print("RESULTS")

    print(
        "=" * 64
    )


    print(
        f"Traffic mode       : {args.mode}"
    )

    print(
        f"Total requests     : {args.requests}"
    )

    print(
        f"Successful         : {len(successful)}"
    )

    print(
        f"Failed             : {len(failed)}"
    )

    print(
        f"Total test time    : {total_time:.2f}s"
    )


    if total_time > 0:

        print(
            f"Throughput         : "
            f"{args.requests / total_time:.2f} "
            f"requests/sec"
        )


    if latencies:

        print(
            f"Average latency    : "
            f"{sum(latencies) / len(latencies):.2f} ms"
        )

        print(
            f"Minimum latency    : "
            f"{min(latencies):.2f} ms"
        )

        print(
            f"Maximum latency    : "
            f"{max(latencies):.2f} ms"
        )


    # -----------------------------------------------------
    # HTTP STATUS
    # -----------------------------------------------------

    print(
        "\nHTTP STATUS CODES"
    )


    status_counts = {}


    for result in results:

        status = str(
            result["status"]
        )

        status_counts[status] = (
            status_counts.get(status, 0) + 1
        )


    for status, count in sorted(
        status_counts.items()
    ):

        print(
            f"  {status}: {count}"
        )


    # -----------------------------------------------------
    # ML RESULTS
    # -----------------------------------------------------

    print(
        "\nML PREDICTIONS"
    )

    print(
        f"  anomaly: {anomaly}"
    )

    print(
        f"  normal:  {normal}"
    )


    if unknown:

        print(
            f"  unknown/error: {unknown}"
        )


    print(
        "=" * 64
    )


    # -----------------------------------------------------
    # FAILURE DIAGNOSTICS
    # -----------------------------------------------------

    if failed:

        print(
            "\nFIRST FEW ERRORS:"
        )

        print(
            "=" * 64
        )

        for index, result in enumerate(
            failed[:5],
            start=1
        ):

            print(
                f"\nERROR #{index}"
            )

            print(
                f"Status      : {result.get('status')}"
            )

            print(
                f"Latency     : {result.get('latency')}"
            )

            print(
                "Server response:"
            )

            print(
                result.get(
                    "error",
                    "No error response received."
                )
            )

            # -------------------------------------------------
            # PRINT PAYLOAD FOR 422 DIAGNOSTICS
            # -------------------------------------------------

            if result.get("status") == 422:

                print(
                    "\nPayload sent to backend:"
                )

                print(
                    result.get(
                        "payload",
                        "Payload unavailable."
                    )
                )

        print(
            "\n" + "=" * 64
        )


    print()


if __name__ == "__main__":
    main()