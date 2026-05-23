# Sistema de gestión de cine (Full‑Stack)

Este repositorio contiene un **backend** con **FastAPI**, **PostgreSQL** y **SQLAlchemy**, y un **frontend** con **React**, **Vite** y **Tailwind CSS**.

## Ejecutar la aplicación

1. **Crear la estructura** ejecutando el script que acabas de generar:
   ```bash
   python setup_cinema_project.py
   ```
   (el script ya está en la raíz y crea todos los archivos necesarios).

2. **Instalar dependencias del backend**:
   ```bash
   cd backend
   poetry install   # o pip install -r requirements.txt
   ```

3. **Levantar Docker** (base de datos y API):
   ```bash
   docker compose up -d --build
   ```
   La API queda en `http://localhost:8000` y la documentación Swagger en `/docs`.

4. **Generar migraciones** (solo la primera vez):
   ```bash
   alembic revision --autogenerate -m "esquema inicial"
   alembic upgrade head
   ```

5. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Accede a `http://localhost:5173`.

## Funcionalidades principales
- Registro y login con JWT (roles *admin* y *cliente*).
- CRUD de películas, salas, funciones.
- Generación automática de asientos por sala.
- Reserva de asientos con control de colisión (evita doble reserva).
- Facturación automática en PDF (ReportLab) y endpoint para descargarlo.
- UI moderna con Tailwind, cuadrícula de asientos (verde = libre, rojo = ocupado).

¡Listo! Ahora puedes comenzar a personalizar la lógica de negocio o añadir más características.
