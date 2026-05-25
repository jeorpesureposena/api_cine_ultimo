from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..db.base import Base

class Invoice(Base):
    """Modelo que representa una factura o comprobante de pago de una reserva."""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Llave foránea hacia la reserva. Si se cancela o borra la reserva, su factura se elimina también.
    reservation_id = Column(Integer, ForeignKey('reservations.id', ondelete='CASCADE'))
    
    # Ruta estática donde se almacena el PDF autogenerado de la factura
    pdf_path = Column(String, nullable=False)
    
    # Fecha exacta en la que se generó la factura (gestionada por la base de datos automáticamente)
    created_at = Column(DateTime, server_default='now()')
    total = Column(Float, nullable=False) # Dinero total cobrado
    
    # Relación de vuelta hacia el objeto Reservation (para poder consultar res.invoice o inv.reservation en código Python)
    reservation = relationship('Reservation', back_populates='invoice')
