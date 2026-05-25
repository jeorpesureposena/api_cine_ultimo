# IMPORTANTE - CAPA DE SERVICIOS (Service Layer):
# Esta capa contiene la lógica de negocio pura del proyecto. 
# Separa la lógica de base de datos y procesamiento de los controladores (routers),
# logrando que el código sea modular, reutilizable y fácil de mantener.

from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User
from ..schemas.user import UserCreate
# Importamos funciones de seguridad del núcleo (core):
# - hash_password: Para convertir contraseñas en texto plano a un hash seguro e irreversible.
# - verify_password: Para comparar una contraseña en texto plano con el hash guardado.
# - create_access_token: Para firmar y generar el token JWT de sesión.
from ..core.security import hash_password, verify_password, create_access_token
from ..db.session import get_db

# --- REGISTRO DE USUARIOS ---
# Servicio asíncrono para dar de alta un usuario nuevo en el sistema.
async def register_user(payload: UserCreate, db: AsyncSession) -> User:
    # 1. Buscamos en la base de datos si ya existe un usuario registrado con este mismo correo electrónico.
    # select(User).where(User.email == payload.email) genera la consulta SELECT correspondiente.
    result = await db.execute(select(User).where(User.email == payload.email))
    
    # 2. Si scalar_one_or_none() devuelve un usuario, significa que el correo ya está registrado.
    if result.scalar_one_or_none():
        # Lanzamos un error HTTP 400 (Bad Request) indicando que el correo ya está en uso.
        raise HTTPException(status_code=400, detail='Email already registered')
        
    # 3. Creamos una instancia del modelo SQLAlchemy 'User' con los datos validados del payload.
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        # ¡MEDIDA DE SEGURIDAD CRÍTICA!: Jamás guardamos contraseñas en texto plano en la base de datos.
        # Si la base de datos se viera comprometida, los hackers tendrían acceso directo.
        # Al usar hash_password() (Bcrypt), convertimos la contraseña en un texto cifrado irreversible.
        hashed_password=hash_password(payload.password) if payload.password else "",
        role="admin" # Nota de defensa: Por practicidad del proyecto escolar, se le asigna "admin" por defecto.
    )
    
    # 4. Añadimos el nuevo objeto de usuario a la sesión actual de la base de datos (se marca para inserción).
    db.add(user)
    # 5. Confirmamos (commit) la transacción. Esto ejecuta la consulta SQL 'INSERT INTO...' en SQLite.
    await db.commit()
    # 6. Refrescamos el objeto desde la BD para cargar los atributos autogenerados (como el ID numérico).
    await db.refresh(user)
    
    # Retornamos el objeto de usuario ya registrado y persistido.
    return user

# --- INICIO DE SESIÓN (Login) ---
# Servicio para verificar credenciales y otorgar un token JWT de acceso.
async def login(email: str, password: str, db: AsyncSession) -> str:
    # 1. Buscamos al usuario por su correo electrónico único.
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    # 2. Verificamos dos condiciones críticas de seguridad:
    # - Que el usuario realmente exista en la base de datos.
    # - Que la contraseña proporcionada coincida al ser procesada contra el hash seguro en la base de datos (verify_password).
    if not user or not verify_password(password, user.hashed_password):
        # Si falla cualquiera de las dos, lanzamos HTTP 401 (No autorizado).
        # Mensaje genérico 'Invalid credentials' para evitar dar pistas a atacantes (ej. no decir "la contraseña está mal" o "el usuario no existe").
        raise HTTPException(status_code=401, detail='Invalid credentials')
        
    if not user.is_active:
        # Si el usuario está inactivo, lanzamos un error 403.
        raise HTTPException(status_code=403, detail='Usuario bloqueado o suspendido. Por favor contacte al administrador.')
        
    # 3. Si todo es correcto, generamos un token JWT (JSON Web Token).
    # Guardamos en el "subject claim" ("sub") el email del usuario para identificar de quién es el token.
    # Este token JWT firmado digitalmente es devuelto al frontend para que lo use en cada petición posterior.
    return create_access_token({"sub": user.email})

