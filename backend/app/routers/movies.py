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
    # 1. Hacemos una consulta base sobre el modelo Movie
    result = await db.execute(
        select(MovieModel)
        # 2. Le decimos a SQLAlchemy que cargue los géneros de la película por adelantado (selectinload)
        # para evitar consultas extra (problema N+1)
        .options(selectinload(MovieModel.genres))
        # 3. Hacemos un JOIN con la tabla de Funciones (ShowtimeModel)
        .join(ShowtimeModel)
        # 4. Filtramos: La función debe estar activa y su fecha/hora de fin debe ser mayor a la actual (aún no termina)
        .where(
            ShowtimeModel.is_active == True,
            ShowtimeModel.end_time > datetime.utcnow()
        )
        # 5. DISTINCT asegura que si una película tiene 5 funciones, no nos devuelva 5 veces la misma película
        .distinct()
    )
    # 6. Devolvemos la lista de películas extraídas de los resultados escalares de la consulta
    return result.scalars().all()

@router.post('/', response_model=Movie)
async def create_movie(movie: MovieCreate, db: AsyncSession = Depends(get_db)):
    # 1. Convertimos el esquema Pydantic a diccionario, pero EXCLUIMOS la lista de IDs de géneros
    # ya que los géneros son una relación muchos-a-muchos y no una columna directa en la tabla de películas
    movie_data = movie.dict(exclude={"genre_ids"})
    
    # 2. Instanciamos el modelo SQLAlchemy con los datos base (título, descripción, etc.)
    db_movie = MovieModel(**movie_data)
    
    # 3. Si se enviaron IDs de géneros en la petición, los procesamos
    if movie.genre_ids:
        # Hacemos una consulta para traer los objetos Genre de la BD cuyos IDs coincidan con los enviados
        genres_result = await db.execute(select(GenreModel).where(GenreModel.id.in_(movie.genre_ids)))
        # Asignamos la lista de objetos Genre a la relación `genres` de nuestra nueva película
        db_movie.genres = list(genres_result.scalars().all())
        
    # 4. Guardamos en la base de datos
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
