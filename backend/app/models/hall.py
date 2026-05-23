from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class Hall(Base):
    __tablename__ = "halls"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    seats = relationship("Seat", back_populates="hall", cascade="all, delete")
    showtimes = relationship("Showtime", back_populates="hall")
