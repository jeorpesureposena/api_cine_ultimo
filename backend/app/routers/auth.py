"""
Enrutador de autenticación. Maneja el registro y el inicio de sesión de los usuarios,
generando los tokens JWT necesarios.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.user import UserCreate, UserRead
from ..schemas.token import Token
from ..services import auth as auth_service
from ..db.session import get_db

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/register', response_model=UserRead)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registra un nuevo usuario en la base de datos de manera segura,
    encriptando su contraseña antes de guardarla.
    """
    user = await auth_service.register_user(payload, db)
    return user

@router.post('/login', response_model=Token)
async def login(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Inicia sesión de un usuario verificando sus credenciales (email y password).
    Retorna un token de acceso JWT.
    """
    token = await auth_service.login(payload.email, payload.password, db)
    return Token(access_token=token)
