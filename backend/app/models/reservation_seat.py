from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..db.base import Base

class ReservationSeat(Base):
    """Modelo que conecta una Reserva específica con un Asiento específico para una Función."""
    __tablename__ = "reservation_seats"
    
    # Restricción única: Garantiza que un mismo asiento en una misma función no pueda ser reservado más de una vez
    __table_args__ = (UniqueConstraint('showtime_id', 'seat_id', name='uq_reservation_seat'),)
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Claves foráneas: Si se borra la reserva, el asiento o la función, este registro intermedio se elimina automáticamente
    reservation_id = Column(Integer, ForeignKey('reservations.id', ondelete='CASCADE'))
    seat_id = Column(Integer, ForeignKey('seats.id', ondelete='CASCADE'))
    showtime_id = Column(Integer, ForeignKey('showtimes.id', ondelete='CASCADE'))
    
    # Relaciones para poder acceder desde código: Ej. `reservation_seat.reservation`
    reservation = relationship('Reservation', back_populates='seats')
    seat = relationship('Seat', back_populates='reservations')
