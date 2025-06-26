# schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class EmailEntryPayload(BaseModel):
    email: EmailStr | None = None
    timestamp: datetime | None = None