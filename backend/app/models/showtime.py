from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class Showtime(Base):
    __tablename__ = "showtimes"
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey('movies.id', ondelete='CASCADE'))
    hall_id = Column(Integer, ForeignKey('halls.id', ondelete='CASCADE'))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    movie = relationship('Movie', back_populates='showtimes')
    hall = relationship('Hall', back_populates='showtimes')
    reservations = relationship('Reservation', back_populates='showtime')
