import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None


def ask_groq(prompt: str):
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY is not configured. Add it to backend/.env before requesting AI analysis."
        )

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert business intelligence "
                    "analyst. Analyze business sales data and "
                    "provide clear, practical insights."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content