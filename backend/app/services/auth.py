from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User
from ..schemas.user import UserCreate
from ..core.security import hash_password, verify_password, create_access_token
from ..db.session import get_db

async def register_user(payload: UserCreate, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail='Email already registered')
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role="admin"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def login(email: str, password: str, db: AsyncSession) -> str:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    # Create JWT with subject claim (user email) and return the token string
    return create_access_token({"sub": user.email})
