# Importamos BaseModel desde Pydantic, que nos sirve para definir esquemas y validar datos.
from pydantic import BaseModel
# Importamos herramientas de tipado de Python:
# - List: Para indicar colecciones de elementos (listas/arreglos).
# - Optional: Para indicar que un campo puede recibir un valor de cierto tipo o ser omitido (None).
from typing import List, Optional
# Importamos datetime para el manejo de fechas y horas. Pydantic validará y convertirá
# automáticamente cadenas con formato de fecha ISO 8601 a objetos datetime de Python.
from datetime import datetime

# =====================================================================
# --- PELÍCULAS (Movies) ---
# =====================================================================

# 1. Esquema Base: Contiene los campos comunes que comparten tanto la creación como la visualización.
class MovieBase(BaseModel):
    title: str  # Título de la película (Obligatorio)
    description: Optional[str] = None  # Sinopsis de la película (Opcional, por defecto None)
    duration_minutes: int  # Duración de la película en minutos (Obligatorio, entero)
    rating: str  # Clasificación de edad (ej. "PG-13", "R", "G")
    poster_url: Optional[str] = None  # Enlace URL a la imagen de portada de la película (Opcional)

# 2. Esquema para Crear Película: Se usa en peticiones POST.
# Hereda todos los campos de MovieBase.
class MovieCreate(MovieBase):
    # Permite al frontend enviar un arreglo de IDs numéricos de los géneros asociados a esta película.
    # Así, al registrar la película, podemos vincularla directamente con sus géneros correspondientes.
    genre_ids: Optional[List[int]] = []

# 3. Esquema para Actualizar Película: Se usa en peticiones PUT/PATCH.
# Todos los campos son opcionales porque el usuario podría querer actualizar sólo un campo (ej. sólo cambiar la portada).
class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    rating: Optional[str] = None
    poster_url: Optional[str] = None
    genre_ids: Optional[List[int]] = None

# 4. Esquema de Respuesta / Lectura: Estructura del JSON que el backend envía al frontend en peticiones GET.
# Hereda todos los campos de MovieBase e incluye información adicional de la base de datos.
class Movie(MovieBase):
    id: int  # ID único de la película en la base de datos
    
    # Incluye la lista detallada de los géneros asociados, serializados según el esquema 'Genre'.
    # Usamos comillas "Genre" porque la clase Genre se define más abajo en el archivo (referencia diferida).
    genres: List["Genre"] = [] 

    class Config:
        # En Pydantic v2, 'from_attributes = True' (que reemplaza al antiguo 'orm_mode = True')
        # le dice a Pydantic que intente leer los campos directamente como atributos del objeto
        # de base de datos (por ejemplo, acceder a `movie.title` en lugar de `movie["title"]`).
        # Esto permite mapear objetos SQLAlchemy de manera directa y transparente.
        from_attributes = True


# =====================================================================
# --- SALAS DE CINE (Halls) ---
# =====================================================================

# 1. Esquema Base con atributos comunes de una sala de cine.
class HallBase(BaseModel):
    name: str  # Nombre o número identificador de la sala (ej. "Sala 1 3D", "Sala VIP")
    capacity: int  # Capacidad máxima de asientos de la sala
    is_active: bool = True  # Estado de la sala, por defecto activa

# 2. Esquema para Crear Sala: Simplemente hereda de HallBase sin campos adicionales.
class HallCreate(HallBase):
    pass

# 3. Esquema de Respuesta para Sala: Incluye el ID asignado por la base de datos.
class Hall(HallBase):
    id: int

    class Config:
        # Habilita la conversión automática desde modelos de SQLAlchemy a JSON.
        from_attributes = True


# =====================================================================
# --- HORARIOS / FUNCIONES (Showtimes) ---
# =====================================================================

# 1. Esquema Base con los datos de una función programada.
class ShowtimeBase(BaseModel):
    movie_id: int  # ID de la película que se va a proyectar (Clave foránea)
    hall_id: int  # ID de la sala donde se proyectará la película (Clave foránea)
    start_time: datetime  # Fecha y hora exacta de inicio de la función
    end_time: datetime  # Fecha y hora exacta de finalización de la función
    price: float  # Precio base de la entrada para esta función
    is_active: bool = True  # Estado de la función (activa o suspendida)

# 2. Esquema para Crear una Función.
class ShowtimeCreate(ShowtimeBase):
    pass

# 3. Esquema para Actualizar una Función.
# Todos los campos son opcionales para permitir actualizaciones parciales (ej. cambiar sólo el precio).
class ShowtimeUpdate(BaseModel):
    movie_id: Optional[int] = None
    hall_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

# 4. Esquema de Respuesta para una Función: Incluye el ID autogenerado.
class Showtime(ShowtimeBase):
    id: int

    class Config:
        # Habilita la conversión automática desde modelos de SQLAlchemy.
        from_attributes = True


# =====================================================================
# --- ASIENTOS (Seats) ---
# =====================================================================

# 1. Esquema Base para asientos individuales de una sala.
class SeatBase(BaseModel):
    hall_id: int  # Sala a la que pertenece el asiento (Clave foránea)
    row: str  # Letra de la fila (ej. "A", "B", "C")
    number: int  # Número de asiento dentro de la fila (ej. 1, 2, 3)
    is_active: bool = True  # Indica si el asiento está disponible físicamente (o si está roto/inactivo)

# 2. Esquema para Crear un Asiento.
class SeatCreate(SeatBase):
    pass

# 3. Esquema de Respuesta para un Asiento: Incluye el ID único del asiento.
class Seat(SeatBase):
    id: int

    class Config:
        # Habilita la conversión automática desde modelos de SQLAlchemy.
        from_attributes = True


# =====================================================================
# --- RESERVAS (Reservations) ---
# =====================================================================

# 1. Esquema Base de la reserva: Contiene los datos comunes y de estado de una compra de entradas.
class ReservationBase(BaseModel):
    showtime_id: int  # Función a la que corresponde la reserva (Clave foránea)
    total_price: float  # Monto total cobrado por esta reserva
    status: str = "active"  # Estado de la reserva: "active" (activa), "cancelled" (cancelada), etc.

# 2. Esquema para Crear una Reserva desde el Frontend (Petición POST).
# Este esquema recibe información clave para procesar la transacción:
class ReservationCreate(ReservationBase):
    user_id: int  # ID del usuario que está comprando la entrada
    seat_ids: List[int]  # Lista de IDs de los asientos que el cliente ha seleccionado en el mapa de la sala

# 3. Esquema de Respuesta para una Reserva (Petición GET).
# Envía los detalles de la reserva incluyendo cuándo fue creada.
class Reservation(ReservationBase):
    id: int  # ID de la reserva generado por el servidor
    user_id: int  # ID del usuario dueño de la reserva
    created_at: datetime  # Fecha y hora exacta de creación del registro en la base de datos

    class Config:
        # Habilita el mapeo transparente desde objetos de SQLAlchemy.
        from_attributes = True


# =====================================================================
# --- GÉNEROS DE PELÍCULAS (Genres) ---
# =====================================================================

# 1. Esquema Base de los géneros cinematográficos (ej. Acción, Comedia, Terror).
class GenreBase(BaseModel):
    name: str  # Nombre único del género
    description: Optional[str] = None  # Explicación de qué trata el género (Opcional)

# 2. Esquema para Crear Géneros.
class GenreCreate(GenreBase):
    pass

# 3. Esquema de Respuesta para Géneros: Incluye el ID autoincremental de la BD.
class Genre(GenreBase):
    id: int

    class Config:
        # Habilita la conversión automática desde modelos de SQLAlchemy.
        from_attributes = True

