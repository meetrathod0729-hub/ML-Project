from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from pydantic import BaseModel
from typing import Optional, Any

from predict import predict_api


app = FastAPI(
    title="API Sentinel ML Service",
    description="ML-based API anomaly detection service",
    version="1.0.0"
)


# =========================================================
# API REQUEST MODEL
# =========================================================

class APIRequest(BaseModel):

    method: str = "GET"

    request_url: str = ""

    request_body: Optional[Any] = ""

    request_headers: Optional[Any] = ""

    response_body: Optional[Any] = ""

    response_headers: Optional[Any] = ""

    response_size: Optional[Any] = 0

    source_port: Optional[Any] = 0

    status: Optional[Any] = 200

    target_port: Optional[Any] = 8000

    response_time: Optional[Any] = 0


# =========================================================
# SAFE NUMERIC CONVERSION
# =========================================================

def safe_float(value, default=0):

    try:

        if value is None:
            return default

        return float(value)

    except (ValueError, TypeError):

        return default


def safe_int(value, default=200):

    try:

        if value is None:
            return default

        return int(float(value))

    except (ValueError, TypeError):

        return default


# =========================================================
# VALIDATION ERROR HANDLER
# =========================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):

    print("\n" + "=" * 70)
    print("ML REQUEST VALIDATION ERROR")
    print("=" * 70)

    print("PATH:", request.url.path)

    print("ERRORS:")
    print(exc.errors())

    try:

        body = await request.json()

        print("\nREQUEST BODY:")
        print(body)

    except Exception as error:

        print(
            "Could not read request body:",
            error
        )

    print("=" * 70 + "\n")

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Invalid ML request",
            "errors": exc.errors()
        }
    )


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def health_check():

    return {
        "service": "API Sentinel ML Service",
        "status": "running"
    }


# =========================================================
# PREDICTION
# =========================================================

@app.post("/predict")
def predict(request: APIRequest):

    data = request.model_dump()


    # -----------------------------------------------------
    # NORMALIZE TEXT FIELDS
    # -----------------------------------------------------

    data["method"] = str(
        data.get("method") or "GET"
    ).upper()

    data["request_url"] = str(
        data.get("request_url") or ""
    )

    data["request_body"] = str(
        data.get("request_body") or ""
    )

    data["request_headers"] = str(
        data.get("request_headers") or ""
    )

    data["response_body"] = str(
        data.get("response_body") or ""
    )

    data["response_headers"] = str(
        data.get("response_headers") or ""
    )


    # -----------------------------------------------------
    # NORMALIZE NUMERIC FIELDS
    # -----------------------------------------------------

    data["response_size"] = safe_float(
        data.get("response_size"),
        0
    )

    data["source_port"] = safe_float(
        data.get("source_port"),
        0
    )

    data["status"] = safe_int(
        data.get("status"),
        200
    )

    data["target_port"] = safe_float(
        data.get("target_port"),
        8000
    )

    data["response_time"] = safe_float(
        data.get("response_time"),
        0
    )


    # -----------------------------------------------------
    # ML PREDICTION
    # -----------------------------------------------------

    result = predict_api(data)

    return result