from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from ..db.base import Base
import enum

class ReservationStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    showtime_id = Column(Integer, ForeignKey('showtimes.id', ondelete='CASCADE'))
    created_at = Column(DateTime, server_default='now()')
    total_price = Column(Float, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.ACTIVE)
    user = relationship('User', back_populates='reservations')
    showtime = relationship('Showtime', back_populates='reservations')
    seats = relationship('ReservationSeat', back_populates='reservation', cascade='all, delete')
    invoice = relationship('Invoice', uselist=False, back_populates='reservation')
