from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.hall import Hall as HallModel
from ..models.seat import Seat as SeatModel
from ..schemas.cinema import Hall, HallCreate, Seat

router = APIRouter(prefix='/halls', tags=['halls'])

@router.get('/', response_model=List[Hall])
async def read_halls(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HallModel).where(HallModel.is_active == True))
    return result.scalars().all()

@router.get('/{hall_id}/seats', response_model=List[Seat])
async def read_hall_seats(hall_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SeatModel).where(SeatModel.hall_id == hall_id, SeatModel.is_active == True))
    return result.scalars().all()

@router.post('/', response_model=Hall)
async def create_hall(hall: HallCreate, db: AsyncSession = Depends(get_db)):
    # 1. Guardamos la información base de la sala
    db_hall = HallModel(**hall.dict())
    db.add(db_hall)
    # Usamos flush() para obtener el ID generado para la sala (db_hall.id) sin hacer commit aún
    await db.flush()  
    
    # 2. Generamos matemáticamente los asientos en la base de datos según la capacidad dada
    capacity = db_hall.capacity
    seats_per_row = 10 # Se asume un estándar de 10 asientos por fila
    
    # Calculamos el número total de filas necesarias (división entera con redondeo hacia arriba)
    rows_count = (capacity + seats_per_row - 1) // seats_per_row
    row_labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    
    seat_counter = 0
    # 3. Bucle para iterar a través de cada fila calculada
    for r in range(rows_count):
        # Asignamos la letra de la fila (A, B, C...) o R + número si supera la Z
        row_label = row_labels[r] if r < len(row_labels) else f"R{r}"
        
        # 4. Bucle para crear cada asiento individual de esa fila (del 1 al 10)
        for c in range(1, seats_per_row + 1):
            seat_counter += 1
            # Si ya alcanzamos la capacidad exacta solicitada, dejamos de crear asientos
            if seat_counter > capacity:
                break
            
            # Instanciamos el objeto asiento con la letra de fila y número de columna
            db_seat = SeatModel(
                hall_id=db_hall.id,
                row=row_label,
                number=c,
                is_active=True
            )
            db.add(db_seat)
            
    # 5. Confirmamos todo en una sola transacción: La sala y sus decenas de asientos
    await db.commit()
    await db.refresh(db_hall)
    return db_hall
