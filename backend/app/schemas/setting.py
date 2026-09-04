from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict


class SettingItem(BaseModel):
    key: str
    value: str
    category: str = "GENERAL"
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SettingsPayload(BaseModel):
    settings: Dict[str, str]
