from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class Showtime(Base):
    """Modelo que representa una 'Función' de cine (una película reproduciéndose en una sala a una hora específica)."""
    __tablename__ = "showtimes"
    id = Column(Integer, primary_key=True, index=True)
    
    # Llaves foráneas: Conecta qué película se transmite en qué sala
    movie_id = Column(Integer, ForeignKey('movies.id', ondelete='CASCADE'))
    hall_id = Column(Integer, ForeignKey('halls.id', ondelete='CASCADE'))
    
    start_time = Column(DateTime, nullable=False) # Hora exacta de inicio
    end_time = Column(DateTime, nullable=False) # Hora exacta de fin (usada para saber si la película sigue en cartelera)
    price = Column(Float, nullable=False) # Precio de la entrada para esta función particular
    is_active = Column(Boolean, default=True) # Permite ocultar funciones canceladas
    
    # Relaciones para acceder rápidamente a los detalles de la Película y la Sala desde una Función
    movie = relationship('Movie', back_populates='showtimes')
    hall = relationship('Hall', back_populates='showtimes')
    reservations = relationship('Reservation', back_populates='showtime')
