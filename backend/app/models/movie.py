from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from ..db.base import Base

# Tabla de asociación para la relación muchos-a-muchos entre Películas y Géneros
movie_genres = Table(
    "movie_genres",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True), # Si se borra la película, se borra esta asociación
    Column("genre_id", Integer, ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True)  # Si se borra el género, se borra esta asociación
)

class Movie(Base):
    """Modelo principal para las películas de la cartelera."""
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True) # Clave primaria y un índice para búsquedas rápidas
    title = Column(String, nullable=False) # Título de la película, es obligatorio
    description = Column(Text) # Sinopsis en texto largo
    duration_minutes = Column(Integer) # Duración en formato numérico
    rating = Column(String) # Clasificación (ej. PG-13, Todo Público)
    poster_url = Column(String, nullable=True) # Ruta estática al poster de la película
    
    # Relación uno-a-muchos: Una película puede tener múltiples funciones asignadas
    showtimes = relationship("Showtime", back_populates="movie")
    
    # Relación muchos-a-muchos usando la tabla asociativa `movie_genres` definida arriba.
    # lazy="selectin" ayuda a evitar el problema N+1 cargando todos los géneros con un `IN` de SQL.
    genres = relationship("Genre", secondary=movie_genres, lazy="selectin")
