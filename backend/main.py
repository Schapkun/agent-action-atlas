from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import openai
import os

app = FastAPI()

# CORS configuratie zodat je frontend requests mag doen naar je backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Of specifieker: ["https://jouwfrontend.render.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Zet je OpenAI sleutel via omgeving
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.post("/prompt")
async def handle_prompt(request: dict):
    prompt = request.get("prompt")
    if not prompt:
        return {"error": "No prompt provided"}

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
    )

    return {"response": response.choices[0].message["content"]}
