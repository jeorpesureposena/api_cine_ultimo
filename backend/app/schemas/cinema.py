from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Movies ---
class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int
    rating: str
    poster_url: Optional[str] = None

class MovieCreate(MovieBase):
    genre_ids: Optional[List[int]] = []

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    rating: Optional[str] = None
    poster_url: Optional[str] = None
    genre_ids: Optional[List[int]] = None

class Movie(MovieBase):
    id: int
    genres: List["Genre"] = []
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

class ShowtimeUpdate(BaseModel):
    movie_id: Optional[int] = None
    hall_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class Showtime(ShowtimeBase):
    id: int
    class Config:
        from_attributes = True

# --- Seats ---
class SeatBase(BaseModel):
    hall_id: int
    row: str
    number: int
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
    status: str = "active"

class ReservationCreate(ReservationBase):
    user_id: int
    seat_ids: List[int]

class Reservation(ReservationBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Genres ---
class GenreBase(BaseModel):
    name: str
    description: Optional[str] = None

class GenreCreate(GenreBase):
    pass

class Genre(GenreBase):
    id: int
    class Config:
        from_attributes = True
