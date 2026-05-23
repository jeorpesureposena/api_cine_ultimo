from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..db.session import get_db
from ..models.reservation import Reservation as ReservationModel
from ..models.reservation_seat import ReservationSeat as ReservationSeatModel
from ..models.seat import Seat as SeatModel
from ..schemas.cinema import Reservation, ReservationCreate

router = APIRouter(prefix='/reservations', tags=['reservations'])

@router.get('/', response_model=List[Reservation])
async def read_reservations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReservationModel))
    return result.scalars().all()

@router.post('/', response_model=Reservation)
async def create_reservation(reservation: ReservationCreate, db: AsyncSession = Depends(get_db)):
    # Check if seats are already taken
    if reservation.seat_ids:
        occupied_seats_query = await db.execute(
            select(ReservationSeatModel.seat_id)
            .join(ReservationModel)
            .where(
                ReservationModel.showtime_id == reservation.showtime_id,
                ReservationSeatModel.seat_id.in_(reservation.seat_ids),
                ReservationModel.status != "canceled"
            )
        )
        occupied_seats = occupied_seats_query.scalars().all()
        if occupied_seats:
            raise HTTPException(status_code=400, detail="Algunos asientos ya están ocupados")

    db_reservation = ReservationModel(
        user_id=reservation.user_id,
        showtime_id=reservation.showtime_id,
        total_price=reservation.total_price,
        status=reservation.status
    )
    db.add(db_reservation)
    await db.flush()  # To get the ID
    
    if reservation.seat_ids:
        for seat_id in reservation.seat_ids:
            db_res_seat = ReservationSeatModel(
                reservation_id=db_reservation.id,
                seat_id=seat_id,
                showtime_id=reservation.showtime_id
            )
            db.add(db_res_seat)
            
    await db.commit()
    await db.refresh(db_reservation)
    return db_reservation

@router.get('/showtime/{showtime_id}/seats', response_model=List[int])
async def get_occupied_seats(showtime_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ReservationSeatModel.seat_id)
        .join(ReservationModel)
        .where(
            ReservationModel.showtime_id == showtime_id,
            ReservationModel.status != "canceled"
        )
    )
    return result.scalars().all()

from sqlalchemy.orm import selectinload

@router.get('/showtime/{showtime_id}/full')
async def get_full_reservations(showtime_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ReservationModel)
        .options(
            selectinload(ReservationModel.user),
            selectinload(ReservationModel.seats).selectinload(ReservationSeatModel.seat)
        )
        .where(
            ReservationModel.showtime_id == showtime_id,
            ReservationModel.status != "canceled"
        )
    )
    reservations = result.scalars().all()
    
    response = []
    for res in reservations:
        seat_names = [f"{rs.seat.row}{rs.seat.number}" for rs in res.seats]
        for rs in res.seats:
            response.append({
                "seat_id": rs.seat_id,
                "user_name": res.user.full_name,
                "all_seats": ", ".join(seat_names)
            })
    return response
