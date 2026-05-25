# Importamos BaseModel desde Pydantic. Pydantic es una librería que valida tipos de datos en Python.
# Si un dato no coincide con el tipo especificado, FastAPI automáticamente lanzará un error 422 de validación.
from pydantic import BaseModel

# Este modelo define la estructura exacta del JSON que el backend devolverá al frontend
# cuando un usuario inicie sesión exitosamente (endpoint de login).
class Token(BaseModel):
    """Modelo de respuesta para el endpoint de login.

    - ``access_token``: el JWT generado.
    - ``token_type``: tipo de token, por defecto ``bearer``.
    """
    # El token JWT generado (es una cadena larga de texto con tres partes: Header, Payload y Firma).
    # Este token será el que el frontend guardará (ej. en localStorage) para enviarlo en las siguientes
    # peticiones en la cabecera "Authorization: Bearer <token>".
    access_token: str
    
    # El tipo de token. Por convención y estándar OAuth2, usamos "bearer" (portador).
    # Al ponerle = "bearer", le asignamos un valor por defecto, por lo que es opcional al construir el objeto.
    token_type: str = "bearer"

