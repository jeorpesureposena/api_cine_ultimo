from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..db.base import Base

class Movie(Base):
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer)
    rating = Column(String)
    poster_url = Column(String, nullable=True)
    showtimes = relationship("Showtime", back_populates="movie")
