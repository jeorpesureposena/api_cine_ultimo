from sqlalchemy import Column, Integer, String
from ..db.base import Base

class Genre(Base):
    """Modelo que representa un género de película (Acción, Terror, etc.)."""
    __tablename__ = "genres" # Nombre real de la tabla en la base de datos
    
    id = Column(Integer, primary_key=True, index=True)
    # unique=True garantiza que no existan dos géneros con el mismo nombre exacto
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
