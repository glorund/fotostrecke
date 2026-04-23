
from fastapi import FastAPI, APIRouter, Depends, Body,  HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from fastapi.staticfiles import StaticFiles
from datetime import datetime


#local imports
from .database import SessionLocal, engine, Base
from .schemas import EmailEntryPayload
from . import models, crud

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.put("/api/entry/{email}")
def put_entry(
    email: str, 
    payload: EmailEntryPayload = Body(...),
    db: Session = Depends(get_db)
    ):
    return crud.update_entry(db, email, payload.timestamp)

@app.get("/api/entry/{email}")
def read_entry(email: str, db: Session = Depends(get_db)):
    entry = crud.get_entry(db, email)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


# need to be registered after the routes
#@app.get("/{full_path:path}")
#async def serve_spa(full_path: str):
#    if full_path.endswith((".js", ".css", ".ico", ".png", ".jpg", ".svg", ".webp", ".json", ".jsp", ".php")):
#        raise HTTPException(status_code=404)
#    return FileResponse("dist/fotostrecke/index.html")

# Serve Angular static files
app.mount("/", StaticFiles(directory="dist/fotostrecke", html=True), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404)
    return FileResponse("dist/fotostrecke/index.html")


