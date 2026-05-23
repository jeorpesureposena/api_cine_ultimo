from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class Seat(Base):
    __tablename__ = "seats"
    __table_args__ = (UniqueConstraint('hall_id', 'row', 'number', name='uq_seat_position'),)
    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey('halls.id', ondelete='CASCADE'))
    row = Column(String, nullable=False)
    number = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    hall = relationship('Hall', back_populates='seats')
    reservations = relationship('ReservationSeat', back_populates='seat')
