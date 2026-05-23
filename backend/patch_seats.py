import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import engine, AsyncSessionLocal
from app.models.hall import Hall
from app.models.seat import Seat
from app.models.showtime import Showtime
from app.models.reservation_seat import ReservationSeat
from app.models.reservation import Reservation
from app.models.movie import Movie
from app.models.user import User
from app.models.invoice import Invoice

async def run_patch():
    async with AsyncSessionLocal() as db:
        halls = await db.execute(select(Hall))
        for hall in halls.scalars().all():
            seats_exist = await db.execute(select(Seat).where(Seat.hall_id == hall.id))
            if not seats_exist.scalars().first():
                print(f"Generating seats for Hall ID {hall.id} with capacity {hall.capacity}")
                capacity = hall.capacity
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
                        db_seat = Seat(
                            hall_id=hall.id,
                            row=row_label,
                            number=c,
                            is_active=True
                        )
                        db.add(db_seat)
        await db.commit()
        print("Done patching seats.")

if __name__ == "__main__":
    asyncio.run(run_patch())
