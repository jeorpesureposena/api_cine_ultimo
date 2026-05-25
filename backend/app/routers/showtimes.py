from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime
from ..db.session import get_db
from ..models.showtime import Showtime as ShowtimeModel
from ..schemas.cinema import Showtime, ShowtimeCreate, ShowtimeUpdate

router = APIRouter(prefix='/showtimes', tags=['showtimes'])

@router.get('/', response_model=List[Showtime])
async def read_showtimes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShowtimeModel).where(
        ShowtimeModel.is_active == True,
        ShowtimeModel.end_time > datetime.utcnow()
    ))
    return result.scalars().all()

@router.post('/', response_model=Showtime)
async def create_showtime(showtime: ShowtimeCreate, db: AsyncSession = Depends(get_db)):
    data = showtime.dict()
    
    # IMPORTANTE: PostgreSQL y SQLAlchemy pueden tener problemas si se mezclan objetos
    # datetime "naive" (sin zona horaria) con "aware" (con zona horaria).
    # Aquí removemos la zona horaria explícitamente para estandarizar (asumiendo UTC).
    if data.get('start_time') and data['start_time'].tzinfo:
        data['start_time'] = data['start_time'].replace(tzinfo=None)
    if data.get('end_time') and data['end_time'].tzinfo:
        data['end_time'] = data['end_time'].replace(tzinfo=None)
        
    db_showtime = ShowtimeModel(**data)
    db.add(db_showtime)
    await db.commit()
    await db.refresh(db_showtime)
    return db_showtime

@router.put('/{showtime_id}', response_model=Showtime)
async def update_showtime(showtime_id: int, showtime: ShowtimeUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShowtimeModel).where(ShowtimeModel.id == showtime_id))
    db_showtime = result.scalar_one_or_none()
    if not db_showtime:
        raise HTTPException(status_code=404, detail="Función no encontrada")
    
    update_data = showtime.dict(exclude_unset=True)
    if update_data.get('start_time') and update_data['start_time'].tzinfo:
        update_data['start_time'] = update_data['start_time'].replace(tzinfo=None)
    if update_data.get('end_time') and update_data['end_time'].tzinfo:
        update_data['end_time'] = update_data['end_time'].replace(tzinfo=None)
        
    for key, value in update_data.items():
        setattr(db_showtime, key, value)
        
    await db.commit()
    await db.refresh(db_showtime)
    return db_showtime

@router.delete('/{showtime_id}')
async def delete_showtime(showtime_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShowtimeModel).where(ShowtimeModel.id == showtime_id))
    db_showtime = result.scalar_one_or_none()
    if not db_showtime:
        raise HTTPException(status_code=404, detail="Función no encontrada")
        
    await db.delete(db_showtime)
    await db.commit()
    return {"message": "Función eliminada exitosamente"}
