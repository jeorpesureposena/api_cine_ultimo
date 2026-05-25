from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from ..db.session import get_db
from ..models.user import User as UserModel
from ..schemas.user import UserRead, UserCreate
from ..core.security import hash_password

router = APIRouter(prefix='/users', tags=['users'])

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

@router.get('/', response_model=List[UserRead])
async def read_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel))
    return result.scalars().all()

@router.get('/clients', response_model=List[UserRead])
async def read_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.role == "cliente"))
    return result.scalars().all()

@router.post('/', response_model=UserRead)
async def create_client(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail='Email ya registrado')
    user = UserModel(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        hashed_password=hash_password(payload.password) if payload.password else "",
        role="cliente"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.put('/{user_id}', response_model=UserRead)
async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    # 1. Buscamos al usuario por su ID
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    
    # 2. Validamos que el usuario exista
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
        
    # 3. Actualización Parcial: Solo actualizamos los campos que el frontend haya enviado (no nulos)
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.email is not None:
        user.email = payload.email
        
    # Si enviaron contraseña nueva, hay que volverla a hashear (encriptar) antes de guardarla
    if payload.password:
        user.hashed_password = hash_password(payload.password)
        
    if payload.is_active is not None:
        user.is_active = payload.is_active
        
    # 4. Confirmar los cambios
    await db.commit()
    await db.refresh(user)
    return user

@router.delete('/{user_id}')
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    await db.delete(user)
    await db.commit()
    return {'detail': 'Usuario eliminado'}

