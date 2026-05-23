import os

BASE_DIR = r"c:\Users\Jesus Orlando\Desktop\api cine 2.0 recitificada\backend\app"

schemas_cinema = """from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Movies ---
class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int
    language: str
    is_active: bool = True

class MovieCreate(MovieBase):
    pass

class Movie(MovieBase):
    id: int
    class Config:
        from_attributes = True

# --- Halls ---
class HallBase(BaseModel):
    name: str
    capacity: int
    is_active: bool = True

class HallCreate(HallBase):
    pass

class Hall(HallBase):
    id: int
    class Config:
        from_attributes = True

# --- Showtimes ---
class ShowtimeBase(BaseModel):
    movie_id: int
    hall_id: int
    start_time: datetime
    end_time: datetime
    price: float
    is_active: bool = True

class ShowtimeCreate(ShowtimeBase):
    pass

class Showtime(ShowtimeBase):
    id: int
    class Config:
        from_attributes = True

# --- Seats ---
class SeatBase(BaseModel):
    hall_id: int
    row_label: str
    seat_number: int
    is_active: bool = True

class SeatCreate(SeatBase):
    pass

class Seat(SeatBase):
    id: int
    class Config:
        from_attributes = True

# --- Reservations ---
class ReservationBase(BaseModel):
    showtime_id: int
    total_price: float
    status: str = "pending"

class ReservationCreate(ReservationBase):
    seat_ids: List[int]

class Reservation(ReservationBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True
"""

routers_movies = """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.movie import Movie as MovieModel
from ..schemas.cinema import Movie, MovieCreate

router = APIRouter(prefix='/movies', tags=['movies'])

@router.get('/', response_model=List[Movie])
async def read_movies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MovieModel).where(MovieModel.is_active == True))
    return result.scalars().all()

@router.post('/', response_model=Movie)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_db)):
    db_movie = MovieModel(**movie.dict())
    db.add(db_movie)
    await db.commit()
    await db.refresh(db_movie)
    return db_movie
"""

routers_halls = """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.hall import Hall as HallModel
from ..schemas.cinema import Hall, HallCreate

router = APIRouter(prefix='/halls', tags=['halls'])

@router.get('/', response_model=List[Hall])
async def read_halls(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HallModel).where(HallModel.is_active == True))
    return result.scalars().all()

@router.post('/', response_model=Hall)
async def create_hall(hall: HallCreate, db: AsyncSession = Depends(get_db)):
    db_hall = HallModel(**hall.dict())
    db.add(db_hall)
    await db.commit()
    await db.refresh(db_hall)
    return db_hall
"""

routers_showtimes = """from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.showtime import Showtime as ShowtimeModel
from ..schemas.cinema import Showtime, ShowtimeCreate

router = APIRouter(prefix='/showtimes', tags=['showtimes'])

@router.get('/', response_model=List[Showtime])
async def read_showtimes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShowtimeModel).where(ShowtimeModel.is_active == True))
    return result.scalars().all()

@router.post('/', response_model=Showtime)
async def create_showtime(showtime: ShowtimeCreate, db: AsyncSession = Depends(get_db)):
    db_showtime = ShowtimeModel(**showtime.dict())
    db.add(db_showtime)
    await db.commit()
    await db.refresh(db_showtime)
    return db_showtime
"""

files_to_write = {
    os.path.join(BASE_DIR, "schemas", "cinema.py"): schemas_cinema,
    os.path.join(BASE_DIR, "routers", "movies.py"): routers_movies,
    os.path.join(BASE_DIR, "routers", "halls.py"): routers_halls,
    os.path.join(BASE_DIR, "routers", "showtimes.py"): routers_showtimes,
}

for path, content in files_to_write.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("CRUD files generated successfully.")
