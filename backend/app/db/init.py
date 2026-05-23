from .session import engine
from ..models import (
    user,
    movie,
    hall,
    seat,
    showtime,
    reservation,
    reservation_seat,
    invoice,
    genre,
)
from ..db.base import Base

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
