"""
Punto de entrada principal de la aplicación FastAPI.
Configura los enrutadores, CORS, archivos estáticos y la inicialización de la base de datos.
"""
import uvicorn
from fastapi import FastAPI
from .core import config
from .routers import auth, health, movies, halls, showtimes, reservations, genres, users
from .middleware.cors import add_cors
from .db import init

app = FastAPI(
    title=config.settings.PROJECT_NAME,
    description='API completa de gestión de cine con JWT, PostgreSQL y FastAPI',
    version='1.0.0',
    openapi_tags=[
        {'name': 'auth', 'description': 'Autenticación y registro'},
        {'name': 'movies', 'description': 'Gestión de películas'},
        {'name': 'halls', 'description': 'Gestión de salas'},
        {'name': 'showtimes', 'description': 'Gestión de funciones'},
        {'name': 'reservations', 'description': 'Gestión de reservas'},
    ],
)
from fastapi.staticfiles import StaticFiles

add_cors(app)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(auth.router, prefix=config.settings.API_V1_STR)
app.include_router(movies.router, prefix=config.settings.API_V1_STR)
app.include_router(halls.router, prefix=config.settings.API_V1_STR)
app.include_router(showtimes.router, prefix=config.settings.API_V1_STR)
app.include_router(reservations.router, prefix=config.settings.API_V1_STR)
app.include_router(genres.router, prefix=config.settings.API_V1_STR)
app.include_router(users.router, prefix=config.settings.API_V1_STR)
app.include_router(health.router)

@app.on_event('startup')
async def startup():
    await init.init_models()

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
