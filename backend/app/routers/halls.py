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
    db_hall = HallModel(**hall.dict())
    db.add(db_hall)
    await db.flush()  # To get db_hall.id
    
    # Generate seats mathematically
    capacity = db_hall.capacity
    seats_per_row = 10
    rows_count = (capacity + seats_per_row - 1) // seats_per_row
    row_labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    
    seat_counter = 0
    for r in range(rows_count):
        row_label = row_labels[r] if r < len(row_labels) else f"R{r}"
        for c in range(1, seats_per_row + 1):
            seat_counter += 1
            if seat_counter > capacity:
                break
            
            db_seat = SeatModel(
                hall_id=db_hall.id,
                row=row_label,
                number=c,
                is_active=True
            )
            db.add(db_seat)
            
    await db.commit()
    await db.refresh(db_hall)
    return db_hall
