import numpy as np
import pandas as pd
import xgboost as xgb

from ai.models.config import MODEL_FILE, FEATURE_COLUMNS


model = xgb.Booster()
model.load_model(MODEL_FILE)


def predict_sales(features: pd.DataFrame):
    if features.empty:
        return []

    # Features used by XGBoost
    # Absent one-hot categories represent zero observations in this upload.
    X = features.reindex(columns=FEATURE_COLUMNS, fill_value=0)

    # Generate predictions
    predictions = model.predict(xgb.DMatrix(X))

    predictions = np.clip(
        predictions,
        0,
        None
    )

    # --------------------------------------------------
    # BUILD STRUCTURED PREDICTIONS
    # --------------------------------------------------

    results = features[
        [
            "month",
            "prediction_category",
            "prediction_region",
            "total_sales"
        ]
    ].copy()

    results["xgb_prediction"] = predictions

    results["xgb_error"] = (
        results["xgb_prediction"]
        - results["total_sales"]
    )

    # Rename identifiers
    results = results.rename(
        columns={
            "prediction_category":
                "Product_Category",

            "prediction_region":
                "Region",

            "total_sales":
                "actual_sales"
        }
    )

    return results.to_dict(
        orient="records"
    )