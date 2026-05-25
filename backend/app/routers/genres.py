from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.genre import Genre as GenreModel
from ..schemas.cinema import Genre, GenreCreate

router = APIRouter(prefix='/genres', tags=['genres'])

@router.get('/', response_model=List[Genre])
async def read_genres(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GenreModel))
    return result.scalars().all()

@router.post('/', response_model=Genre)
async def create_genre(genre: GenreCreate, db: AsyncSession = Depends(get_db)):
    # 1. Buscamos si ya existe un género con el mismo nombre exacto para evitar duplicados en la cartelera
    result = await db.execute(select(GenreModel).where(GenreModel.name == genre.name))
    
    # Si la consulta encuentra un resultado, lanzamos una excepción HTTP 400
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="El género ya existe.")
    
    # 2. Si no existe, creamos el nuevo género. **genre.dict() desempaqueta los datos del Payload
    db_genre = GenreModel(**genre.dict())
    db.add(db_genre)
    await db.commit() # Guardamos en disco
    await db.refresh(db_genre) # Refrescamos para obtener el ID asignado
    return db_genre
