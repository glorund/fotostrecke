from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class EmailEntry(Base):
    __tablename__ = "email_entries"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    timestamp = Column(DateTime)
