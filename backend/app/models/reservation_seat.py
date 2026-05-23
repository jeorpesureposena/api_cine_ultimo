from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..db.base import Base

class ReservationSeat(Base):
    __tablename__ = "reservation_seats"
    __table_args__ = (UniqueConstraint('showtime_id', 'seat_id', name='uq_reservation_seat'),)
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey('reservations.id', ondelete='CASCADE'))
    seat_id = Column(Integer, ForeignKey('seats.id', ondelete='CASCADE'))
    showtime_id = Column(Integer, ForeignKey('showtimes.id', ondelete='CASCADE'))
    reservation = relationship('Reservation', back_populates='seats')
    seat = relationship('Seat', back_populates='reservations')
