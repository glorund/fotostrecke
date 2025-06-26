from sqlalchemy.orm import Session
from . import models
from datetime import datetime

def create_entry(db: Session, email: str):
    entry = models.EmailEntry(email=email, timestamp=datetime.now())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_entry(db: Session, email: str):
    return db.query(models.EmailEntry).filter(models.EmailEntry.email == email).first()


# TODO ID based update
def update_entry(db: Session, email: str, timestamp: datetime):
    entry = db.query(models.EmailEntry).filter(models.EmailEntry.email == email).first()
    if not entry:
        entry = models.EmailEntry(email=email, timestamp=timestamp)
        db.add(entry)
    else:    
        if timestamp:
            entry.timestamp = timestamp

    db.commit()
    db.refresh(entry)
    return entry