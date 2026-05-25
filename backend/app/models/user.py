from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from ..db.base import Base

class User(Base):
    """
    Modelo SQLAlchemy que representa a un usuario en el sistema.
    Almacena datos personales, credenciales y su rol (admin o cliente).
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    
    full_name = Column(String, nullable=True) # Nombre completo del cliente (opcional al registrarse)
    phone = Column(String, nullable=True) # Teléfono (opcional)
    
    # Correo del usuario. unique=True asegura que no existan cuentas duplicadas. index=True acelera la búsqueda en el Login.
    email = Column(String, unique=True, index=True, nullable=False)
    
    # MUY IMPORTANTE: Se guarda en formato String pero NUNCA en texto plano, siempre debe contener un hash bcrypt (ej. $2b$12$...)
    hashed_password = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True) # Sirve para suspender/banear usuarios
    role = Column(String, default="cliente") # Control de permisos: "cliente" o "admin"
    
    # Relación uno-a-muchos: Un usuario puede tener múltiples reservas a su nombre
    reservations = relationship("Reservation", back_populates="user")
