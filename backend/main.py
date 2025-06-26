
from fastapi import FastAPI, Depends, Body,  HTTPException
from sqlalchemy.orm import Session

from fastapi.staticfiles import StaticFiles
from datetime import datetime

#local imports
from .database import SessionLocal, engine, Base
from .schemas import EmailEntryPayload
from . import models, crud


app = FastAPI()
# Fake in-memory storage
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

@app.put("/entry/{email}")
def put_entry(
    email: str, 
    payload: EmailEntryPayload = Body(...),
    db: Session = Depends(get_db)
    ):
    return crud.update_entry(db, email, payload.timestamp)

@app.get("/entry/{email}")
def read_entry(email: str, db: Session = Depends(get_db)):
    entry = crud.get_entry(db, email)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

#@app.post("/entry/")
#def post_entry(entity: models.EmailEntry):
#    return {"status": "saved"}

#@app.get("/entity/")
#def get_entry ():
#    e = models.EmailEntry(email="new@stab.de", timestamp=datetime.now())
#    return e

# need to be registered after the routes
# Serve Angular static files
app.mount("/", StaticFiles(directory="dist/fotostrecke", html=True), name="static")