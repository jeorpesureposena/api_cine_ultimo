from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from ..db.base import Base
import enum

class ReservationStatus(str, enum.Enum):
    # Definimos un Enum para restringir los estados posibles de la reserva a nivel de código
    ACTIVE = "active"
    CANCELED = "canceled"

class Reservation(Base):
    """Modelo que representa una reserva (compra de boletos) realizada por un usuario."""
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    
    # Llaves foráneas a otras tablas. ondelete='CASCADE' significa que si el usuario/función se borran, la reserva también.
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    showtime_id = Column(Integer, ForeignKey('showtimes.id', ondelete='CASCADE'))
    
    # Guarda la fecha automáticamente desde el motor de DB (Postgres now())
    created_at = Column(DateTime, server_default='now()')
    total_price = Column(Float, nullable=False) # Precio total de la compra
    status = Column(Enum(ReservationStatus), default=ReservationStatus.ACTIVE) # Estado por defecto es ACTIVE
    
    # Relaciones ORM para acceder fácilmente a los objetos asociados en Python (res.user.email)
    user = relationship('User', back_populates='reservations')
    showtime = relationship('Showtime', back_populates='reservations')
    
    # Relación uno-a-muchos con los asientos exactos de esta reserva
    seats = relationship('ReservationSeat', back_populates='reservation', cascade='all, delete')
    
    # uselist=False indica que es una relación Uno-a-Uno (Una reserva -> Una Factura)
    invoice = relationship('Invoice', uselist=False, back_populates='reservation')
