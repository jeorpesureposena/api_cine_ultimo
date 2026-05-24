"""
Enrutador de Películas. Proporciona endpoints CRUD para crear, leer, actualizar
y eliminar películas de la cartelera, incluyendo la subida de imágenes/posters.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from ..db.session import get_db
from ..models.movie import Movie as MovieModel
from ..models.showtime import Showtime as ShowtimeModel
from ..models.genre import Genre as GenreModel
from ..schemas.cinema import Movie, MovieCreate, MovieUpdate
from datetime import datetime

router = APIRouter(prefix='/movies', tags=['movies'])

@router.get('/', response_model=List[Movie])
async def read_movies(db: AsyncSession = Depends(get_db)):
    """
    Devuelve una lista de todas las películas registradas en la base de datos,
    cargando junto a ellas sus géneros correspondientes.
    """
    result = await db.execute(select(MovieModel).options(selectinload(MovieModel.genres)))
    return result.scalars().all()

@router.get('/active', response_model=List[Movie])
async def read_active_movies(db: AsyncSession = Depends(get_db)):
    """
    Devuelve únicamente las películas que están actualmente en cartelera 
    (tienen funciones activas y no han terminado).
    """
    result = await db.execute(
        select(MovieModel)
        .options(selectinload(MovieModel.genres))
        .join(ShowtimeModel)
        .where(
            ShowtimeModel.is_active == True,
            ShowtimeModel.end_time > datetime.utcnow()
        )
        .distinct()
    )
    return result.scalars().all()

@router.post('/', response_model=Movie)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_db)):
    movie_data = movie.dict(exclude={"genre_ids"})
    db_movie = MovieModel(**movie_data)
    
    if movie.genre_ids:
        genres_result = await db.execute(select(GenreModel).where(GenreModel.id.in_(movie.genre_ids)))
        db_movie.genres = list(genres_result.scalars().all())
        
    db.add(db_movie)
    await db.commit()
    await db.refresh(db_movie)
    return db_movie

@router.put('/{movie_id}', response_model=Movie)
async def update_movie(movie_id: int, movie: MovieUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MovieModel).options(selectinload(MovieModel.genres)).where(MovieModel.id == movie_id))
    db_movie = result.scalar_one_or_none()
    if not db_movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
    
    update_data = movie.dict(exclude_unset=True, exclude={"genre_ids"})
    for key, value in update_data.items():
        setattr(db_movie, key, value)
        
    if movie.genre_ids is not None:
        genres_result = await db.execute(select(GenreModel).where(GenreModel.id.in_(movie.genre_ids)))
        db_movie.genres = list(genres_result.scalars().all())
        
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
