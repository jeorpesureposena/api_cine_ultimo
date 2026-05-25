from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class Seat(Base):
    """Modelo que representa un asiento individual dentro de una sala."""
    __tablename__ = "seats"
    
    # Restricción única compuesta: Evita que existan dos asientos con la misma "fila" y "número" en la misma "sala"
    __table_args__ = (UniqueConstraint('hall_id', 'row', 'number', name='uq_seat_position'),)
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Llave foránea hacia la sala a la que pertenece el asiento
    hall_id = Column(Integer, ForeignKey('halls.id', ondelete='CASCADE'))
    
    row = Column(String, nullable=False) # Fila (ej. "A", "B", "C")
    number = Column(Integer, nullable=False) # Número de asiento en esa fila (ej. 1, 2, 3)
    is_active = Column(Boolean, default=True) # Para inhabilitar asientos dañados
    
    # Relaciones hacia la Sala padre y hacia las reservas que haya tenido este asiento
    hall = relationship('Hall', back_populates='seats')
    reservations = relationship('ReservationSeat', back_populates='seat')
