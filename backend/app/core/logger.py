# Importamos el módulo 'logging' estándar de Python para registrar eventos del sistema.
# Usar loggers es mucho más profesional y eficiente que usar simples 'print()', ya que:
# - Permite clasificar mensajes por gravedad (INFO, WARNING, ERROR).
# - Permite formatear la salida de forma uniforme (con fechas, horas, etc.).
# - Permite redirigir los registros tanto a la consola como a archivos de texto.
import logging, sys

# Función para configurar y obtener una instancia de registro (logger).
def get_logger(name: str = "cinema"):
    # Obtenemos o creamos el registrador con el nombre provisto (por defecto "cinema").
    logger = logging.getLogger(name)
    
    # Esta comprobación es muy importante: si el registrador ya tiene manejadores (handlers) configurados,
    # no añadimos más. De lo contrario, se duplicarían las líneas impresas en la consola cada vez que llamamos a get_logger.
    if not logger.handlers:
        # Configuramos el nivel mínimo de los mensajes a mostrar. 
        # INFO mostrará información general, advertencias y errores, ignorando los logs muy detallados de DEBUG.
        logger.setLevel(logging.INFO)
        
        # StreamHandler le indica al logger que mande la salida a la consola de comandos estándar (stdout).
        handler = logging.StreamHandler(sys.stdout)
        
        # Definimos la plantilla visual de cada línea de log:
        # %(asctime)s: Fecha y hora exacta del evento
        # %(levelname)s: Gravedad del mensaje (INFO, ERROR, etc.)
        # %(name)s: Nombre del módulo que disparó el log
        # %(message)s: El texto descriptivo real
        formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(name)s | %(message)s')
        
        # Asignamos el formato al manejador y finalmente registramos el manejador en nuestro logger
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

