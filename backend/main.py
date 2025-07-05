from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Serveer alle statische bestanden (JS, CSS, afbeeldingen etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Homepage of fallback route
@app.get("/")
def read_index():
    return FileResponse("index.html")

# Eventueel fallback voor andere frontend routes (SPA-style)
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    if os.path.exists(full_path):
        return FileResponse(full_path)
    return FileResponse("index.html")
