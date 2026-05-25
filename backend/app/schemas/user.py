# Importamos las herramientas de validación de Pydantic:
# - BaseModel: La clase base de la cual heredan todos nuestros esquemas de datos.
# - EmailStr: Validador especializado que asegura que el valor ingresado sea un correo electrónico válido (ej. usuario@dominio.com).
# - Field: Permite añadir reglas extra de validación y metadatos a los campos (ej. longitud mínima, valores por defecto).
from pydantic import BaseModel, EmailStr, Field
# Usamos Optional de typing para indicar que ciertos campos son opcionales y pueden ser None.
from typing import Optional

# --- ESQUEMA BASE DEL USUARIO ---
# Este esquema define los atributos básicos comunes que comparte un usuario en cualquier operación (crear, leer, actualizar).
class UserBase(BaseModel):
    # Validado automáticamente para asegurar que sea un formato de correo real.
    email: EmailStr
    
    # Campo opcional para el nombre completo. Si no se provee, su valor por defecto será None.
    full_name: Optional[str] = None
    
    # Campo opcional para el número de teléfono. Si no se provee, su valor por defecto será None.
    phone: Optional[str] = None

# --- ESQUEMA PARA CREAR USUARIO (Registro / POST) ---
# Hereda todos los campos de UserBase (email, full_name, phone) y le añade la contraseña.
# ¡Es sumamente importante separar la creación de la lectura! Nunca debemos mostrar la contraseña en las respuestas.
class UserCreate(UserBase):
    # La contraseña es opcional en la creación general (los clientes no requieren contraseña).
    password: Optional[str] = Field(None, min_length=6)

# --- ESQUEMA PARA LEER USUARIO (Respuesta / GET) ---
# Hereda todos los campos de UserBase (email, full_name, phone) y añade los campos generados por el servidor o base de datos.
# ¡Nota que no incluimos la contraseña aquí por razones obvias de seguridad!
class UserRead(UserBase):
    # ID único generado automáticamente por la base de datos (clave primaria).
    id: int
    
    # Indica si el usuario está activo en el sistema.
    is_active: bool
    
    # Rol del usuario (ej: 'admin' para administradores, 'client' para clientes regulares).
    role: str

    # Configuración especial para Pydantic.
    class Config:
        # En Pydantic v1, 'orm_mode = True' le permite a Pydantic leer datos directamente
        # desde un objeto de la base de datos (objeto ORM de SQLAlchemy, ej. user.email en vez de user["email"]).
        # Esto nos ahorra tener que convertir manualmente el objeto de la BD a un diccionario antes de responder.
        orm_mode = True

