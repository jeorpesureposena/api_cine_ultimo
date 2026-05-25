from datetime import datetime, timedelta
from typing import Optional

# Importamos bcrypt para el hasheo seguro de contraseñas.
# Importamos python-jose para la creación, firma y decodificación de tokens JWT (JSON Web Tokens).
import bcrypt
from jose import JWTError, jwt

from .config import settings

# --- HASHEO DE CONTRASEÑAS (Cifrado Irreversible) ---
# Esta función convierte una contraseña legible (texto plano) en una cadena indescifrable.
def hash_password(password: str) -> str:
    # 1. Generamos un "salt" (sal) aleatorio usando Bcrypt. 
    # El salt es una cadena aleatoria única que se mezcla con la contraseña antes de encriptarla.
    # Esto evita ataques de diccionario y "tablas arcoíris" (listas de contraseñas pre-hasheadas).
    salt = bcrypt.gensalt()
    
    # 2. Bcrypt trabaja con bytes, por lo que convertimos la cadena de texto (str) a bytes usando UTF-8.
    pwd_bytes = password.encode('utf-8')
    
    # 3. Mezclamos y hasheamos los bytes con la sal. 
    # Luego decodificamos el resultado a un texto regular (str) para poder guardarlo fácilmente en la base de datos.
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

# --- VERIFICACIÓN DE CONTRASEÑA ---
# Compara una contraseña introducida por el usuario contra el hash seguro almacenado en la BD.
def verify_password(plain: str, hashed: str) -> bool:
    # Como el hasheo es irreversible, no podemos "desencriptar" el hash de la BD para ver la contraseña real.
    # En su lugar, Bcrypt toma la contraseña en texto plano, busca la sal incrustada en el hash original,
    # hashea la contraseña provista con esa misma sal, y verifica si los resultados finales coinciden.
    pwd_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

# --- GENERAR TOKEN JWT (JSON Web Token) ---
# Crea una firma criptográfica que empaqueta datos del usuario y le da validez temporal.
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    # 1. Copiamos el diccionario de datos original para no mutar el parámetro de entrada
    to_encode = data.copy()
    
    # 2. Calculamos la fecha y hora de expiración en UTC.
    # Si no se define una duración específica, por defecto dura los minutos configurados (60 minutos).
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    
    # 3. Registramos la fecha de expiración bajo el estándar del claim "exp" de los JWT.
    to_encode.update({"exp": expire})
    
    # 4. Firmamos digitalmente el token.
    # Se utiliza el contenido, la clave súper secreta del backend (JWT_SECRET_KEY) y el algoritmo simétrico HS256.
    # Esto garantiza que el cliente pueda ver el contenido, pero si intenta modificarlo (ej. alterando el correo o el rol),
    # la firma digital quedará invalidada y el backend rechazará el token de inmediato.
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

# --- DECODIFICAR Y VERIFICAR TOKEN JWT ---
# Lee el token enviado por el cliente, verifica que la firma sea válida y que no haya expirado.
def decode_access_token(token: str):
    try:
        # Decodificamos el token usando la misma clave secreta con la que fue firmado en el servidor.
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        # Si la firma es correcta y el token no ha expirado, devolvemos los datos del payload (ej: {"sub": "correo@ejemplo.com"})
        return payload
    except JWTError:
        # Si el token expiró, la firma no coincide o es inválido, capturamos el error y retornamos None.
        return None

