from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class Hall(Base):
    """Modelo que representa una sala física en el cine."""
    __tablename__ = "halls"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True) # El nombre de la sala (ej. Sala 1, VIP)
    capacity = Column(Integer, nullable=False) # Capacidad máxima de personas/asientos
    is_active = Column(Boolean, default=True) # Sirve para "apagar" una sala si está en mantenimiento
    
    # Relación uno-a-muchos: Una sala contiene múltiples asientos.
    # cascade="all, delete" asegura que si eliminas la Sala 1, la BD borre todos sus asientos para no dejar basura.
    seats = relationship("Seat", back_populates="hall", cascade="all, delete")
    # Relación uno-a-muchos: Una sala puede estar asignada a múltiples funciones (Showtimes) en diferentes horarios
    showtimes = relationship("Showtime", back_populates="hall")
