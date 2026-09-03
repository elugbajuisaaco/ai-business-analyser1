import json

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from ai.processing.aggregator import aggregate_sales
from ai.processing.features import create_features
from ai.models.predictor import predict_sales
from ai.analysis.context import build_business_context
from ai.groq.agent import run_agent
from ai.groq.client import ask_groq
from api.models import CopilotRequest


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )

    try:

        # 1. Read uploaded CSV
        df = pd.read_csv(file.file)

        # 2. Aggregate
        monthly = aggregate_sales(df)

        # 3. Features
        features = create_features(monthly)

        # 4. XGBoost prediction
        predictions = predict_sales(features)

        # 5. Build business context
        business_context = build_business_context(
            df,
            monthly,
            features,
            predictions
        )

        # 6. Run AI business analyst
        agent_result = run_agent(
            business_context
        )

        preview_rows = json.loads(
            df.head(10).to_json(orient="records", date_format="iso")
        )
        facts = agent_result["facts"]
        business_facts = facts.get("business", {})
        summary = {
            "raw_rows": len(df),
            "monthly_rows": len(monthly),
            "feature_rows": len(features),
            "prediction_count": len(predictions),
            "totalRevenueFormatted": f"${business_facts.get('total_sales', 0):,.2f}",
            "transactionCount": business_facts.get("total_orders", len(df)),
            "topChannel": facts.get("best_category", {}).get("category", "Unavailable"),
        }

        return {
            "filename": file.filename,
            "summary": summary,
            "facts": facts,
            "ai_analysis": agent_result["analysis"],
            "headers": list(df.columns),
            "preview_rows": preview_rows,
            "chartData": [
                {"month": str(row["month"]), "MRR": row["total_sales"]}
                for row in monthly.to_dict(orient="records")
            ],
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/api/copilot")
async def copilot(request: CopilotRequest):
    prompt = (
        "Answer the user's question using only the supplied business context. "
        "Be concise and clearly state when the context does not contain enough evidence.\n\n"
        f"Business context:\n{json.dumps(request.context, default=str, indent=2)}\n\n"
        f"User question:\n{request.prompt}"
    )

    try:
        return {"response": ask_groq(prompt)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))