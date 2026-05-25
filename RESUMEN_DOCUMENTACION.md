# Documentación del Código (Comentarios Inline) - Fases Completadas

He realizado una pasada masiva sobre el código de tu proyecto para agregar comentarios línea por línea explicando el "qué" y el "por qué" de las lógicas más importantes. Esto te servirá como una excelente guía de estudio.

## Resumen de Comentarios Añadidos

### Backend Completado (Modelos, Schemas y Rutas)
* **Modelos**: Se comentó `models/movie.py` y `models/reservation.py` explicando la declaración de relaciones entre tablas (uno-a-muchos, muchos-a-muchos con tablas asociativas `movie_genres`) y los parámetros clave como `ondelete='CASCADE'`.
* **Schemas**: Se añadieron explicaciones en `schemas/cinema.py` para distinguir la diferencia entre esquemas de Creación (POST) y esquemas de Respuesta (GET), así como la configuración `from_attributes = True` para leer desde SQLAlchemy.
* **Rutas Complejas**:
  - `auth.py`: Paso a paso del login y registro (Hasheo de contraseñas, validación y JWT).
  - `movies.py`: Explicación de la solución al problema *N+1 queries* cargando los géneros por adelantado.
  - `reservations.py`: Flujo de validación para evitar doble reserva de asientos usando `flush()` para atomicidad.
  - `halls.py`: **Se explicó línea por línea el algoritmo de generación automática de asientos** mediante matemática (dividiendo capacidad entre asientos por fila) y asignación alfabética.
  - `showtimes.py`: Explicación sobre la remoción estricta de la "zona horaria" (tzinfo) de los objetos de tiempo para asegurar compatibilidad con la base de datos PostgreSQL.

### Frontend Completado (Flujos Principales en React)
Se explicaron las secciones más críticas y propensas a preguntas de los profesores dentro de `App.jsx`:
- **`SeatSelector`**: La lógica de selección interactiva de cuadrículas, el uso del estado (`selectedSeats`), y cómo se arman los JSON (payload) para el servidor.
- **`LoginForm`**: Gestión del token, y manejo de peticiones asíncronas HTTP con promesas.
- **`MovieGrid` y `MyReservations`**: Uso del ciclo de vida de React (`useEffect`) para disparar peticiones GET apenas carga la pantalla.

> [!TIP]
> Debido al inmenso tamaño del archivo `App.jsx` (más de 3000 líneas), enfaticé los comentarios en la lógica interactiva. Las funciones del lado del administrador (ej. crear películas o agregar salas) replican los conceptos de `fetch` vistos en el Login. Si el profesor te pregunta sobre un formulario de administración, utiliza los conceptos documentados en el `LoginForm`.
