from pydantic import BaseModel

class Token(BaseModel):
    """Modelo de respuesta para el endpoint de login.

    - ``access_token``: el JWT generado.
    - ``token_type``: tipo de token, por defecto ``bearer``.
    """
    access_token: str
    token_type: str = "bearer"
