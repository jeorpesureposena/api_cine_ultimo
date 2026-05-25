from fastapi import APIRouter

router = APIRouter()

# Ruta especial para monitoreo de salud del servidor (Health Check)
# Herramientas como Docker, Kubernetes o balanceadores de carga usan esto para saber si la API sigue viva.
@router.get('/health')
async def health_check():
    return {"status": "ok"}
