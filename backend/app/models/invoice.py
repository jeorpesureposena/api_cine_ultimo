from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..db.base import Base

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey('reservations.id', ondelete='CASCADE'))
    pdf_path = Column(String, nullable=False)
    created_at = Column(DateTime, server_default='now()')
    total = Column(Float, nullable=False)
    reservation = relationship('Reservation', back_populates='invoice')
