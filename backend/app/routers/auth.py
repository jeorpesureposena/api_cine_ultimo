from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.user import UserCreate, UserRead
from ..schemas.token import Token
from ..services import auth as auth_service
from ..db.session import get_db

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/register', response_model=UserRead)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register_user(payload, db)
    return user

@router.post('/login', response_model=Token)
async def login(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    token = await auth_service.login(payload.email, payload.password, db)
    return Token(access_token=token)
