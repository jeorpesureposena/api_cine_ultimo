from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.movie import Movie as MovieModel
from ..schemas.cinema import Movie, MovieCreate, MovieUpdate

router = APIRouter(prefix='/movies', tags=['movies'])

@router.get('/', response_model=List[Movie])
async def read_movies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MovieModel))
    return result.scalars().all()

@router.post('/', response_model=Movie)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_db)):
    db_movie = MovieModel(**movie.dict())
    db.add(db_movie)
    await db.commit()
    await db.refresh(db_movie)
    return db_movie

@router.put('/{movie_id}', response_model=Movie)
async def update_movie(movie_id: int, movie: MovieUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MovieModel).where(MovieModel.id == movie_id))
    db_movie = result.scalar_one_or_none()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
    
    update_data = movie.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_movie, key, value)
        
    await db.commit()
    await db.refresh(db_movie)
    return db_movie

@router.delete('/{movie_id}')
async def delete_movie(movie_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MovieModel).where(MovieModel.id == movie_id))
    db_movie = result.scalar_one_or_none()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
        
    await db.delete(db_movie)
    await db.commit()
    return {"message": "Película eliminada exitosamente"}

from fastapi import UploadFile, File
import shutil
import os
import uuid

@router.post('/{movie_id}/image', response_model=Movie)
async def upload_movie_image(movie_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MovieModel).where(MovieModel.id == movie_id))
    db_movie = result.scalar_one_or_none()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
    
    file_ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    os.makedirs("static/images", exist_ok=True)
    file_path = f"static/images/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_movie.poster_url = f"/static/images/{filename}"
    await db.commit()
    await db.refresh(db_movie)
    return db_movie
