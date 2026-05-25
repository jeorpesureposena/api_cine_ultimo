import os
from pydantic import Field
# BaseSettings y SettingsConfigDict de pydantic-settings permiten manejar la configuración
# de la aplicación mediante variables de entorno de una forma elegante, robusta y segura.
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

# --- CONFIGURACIÓN GLOBAL DE LA APLICACIÓN ---
# Heredar de BaseSettings le da la capacidad a esta clase de leer automáticamente
# variables definidas en un archivo `.env` o en el sistema operativo.
class Settings(BaseSettings):
    # Nombre del proyecto (se mostrará en la documentación automática de FastAPI en /docs)
    PROJECT_NAME: str = "Cinema Management API"
    
    # Prefijo global para todos los endpoints de la API (versión 1)
    API_V1_STR: str = "/api/v1"
    
    # Define si la aplicación se ejecuta en modo depuración (desarrollo)
    DEBUG: bool = False

    # Parámetros de conexión para PostgreSQL (usados opcionalmente en producción o Docker)
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "cinema"
    
    # URL de conexión principal a la Base de Datos. Pydantic exige que este campo esté definido,
    # ya sea en el archivo .env (ej: sqlite+aiosqlite:///./cinema.db o postgresql+asyncpg://...)
    DATABASE_URL: str

    # Clave secreta súper importante para firmar y verificar tokens JWT (Json Web Token).
    # ¡En producción, esto NUNCA debe estar en el código fuente, sino proveerse como variable de entorno oculta!
    JWT_SECRET_KEY: str = "super-secret-jwt-key"
    
    # Algoritmo de encriptación simétrica utilizado para firmar el token JWT. HS256 es el estándar común.
    JWT_ALGORITHM: str = "HS256"
    
    # Tiempo de vida de un token de acceso antes de que expire y obligue al usuario a loguearse de nuevo (1 hora)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS (Cross-Origin Resource Sharing):
    # Especifica qué dominios tienen permiso para hacer peticiones a esta API.
    # Poner ["*"] permite que cualquier dominio (incluyendo localhost de React) acceda.
    # En producción, se limitaría específicamente al dominio real del Frontend por seguridad.
    CORS_ORIGINS: List[str] = ["*"]

    # Configuración de comportamiento del cargador de Pydantic
    model_config = SettingsConfigDict(
        env_file=".env",          # Indica que intente buscar un archivo llamado ".env" en la raíz del backend
        case_sensitive=True       # Las variables de entorno coinciden distinguiendo mayúsculas y minúsculas
    )

# Instanciamos la clase Settings una sola vez para que toda la aplicación
# comparta el mismo objeto de configuración (patrón Singleton).
settings = Settings()

