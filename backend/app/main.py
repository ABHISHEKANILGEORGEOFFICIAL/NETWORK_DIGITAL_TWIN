import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging_config import setup_logging, logger
from app.database.session import engine, Base, SessionLocal
from app.database.seed_data import seed_database
from app.simulator.network_simulator import simulator
from app.websocket.connection_manager import connection_manager

# API Routers
from app.api.auth import router as auth_router
from app.api.devices import router as devices_router
from app.api.interfaces import router as interfaces_router
from app.api.topology import router as topology_router
from app.api.telemetry import router as telemetry_router
from app.api.health import router as health_router
from app.api.alerts import router as alerts_router
from app.api.incidents import router as incidents_router
from app.api.simulation import router as simulation_router
from app.api.what_if import router as what_if_router
from app.api.path_analysis import router as path_analysis_router
from app.api.config_mgmt import router as config_router
from app.api.inventory import router as inventory_router
from app.api.snapshots import router as snapshots_router
from app.api.reports import router as reports_router
from app.api.notifications import router as notifications_router

# Setup Logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Database Initialization
    logger.info("Initializing NetTwin database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # 2. Start Autonomous Simulator
    logger.info("Starting NetTwin digital twin simulation engine...")
    await simulator.start()
    
    yield
    
    # 3. Shutdown
    logger.info("Stopping NetTwin simulator...")
    simulator.stop()

app = FastAPI(
    title="NetTwin Platform API",
    description="Interactive Network Digital Twin for Real-Time Monitoring, Simulation, Telemetry, and Management",
    version=settings.PROJECT_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(devices_router, prefix=settings.API_V1_STR)
app.include_router(interfaces_router, prefix=settings.API_V1_STR)
app.include_router(topology_router, prefix=settings.API_V1_STR)
app.include_router(telemetry_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(what_if_router, prefix=settings.API_V1_STR)
app.include_router(path_analysis_router, prefix=settings.API_V1_STR)
app.include_router(config_router, prefix=settings.API_V1_STR)
app.include_router(inventory_router, prefix=settings.API_V1_STR)
app.include_router(snapshots_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)

# WebSockets Endpoints
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket, channel="telemetry")
    try:
        while True:
            # Keep socket open and receive client heartbeats/pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, channel="telemetry")
    except Exception as e:
        logger.warning(f"Telemetry WebSocket closed: {e}")
        connection_manager.disconnect(websocket, channel="telemetry")

@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket, channel="alerts")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, channel="alerts")
    except Exception as e:
        logger.warning(f"Alerts WebSocket closed: {e}")
        connection_manager.disconnect(websocket, channel="alerts")

@app.websocket("/ws/topology")
async def websocket_topology_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket, channel="topology")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, channel="topology")
    except Exception as e:
        logger.warning(f"Topology WebSocket closed: {e}")
        connection_manager.disconnect(websocket, channel="topology")

@app.get("/")
def root_redirect():
    return {
        "platform": "NetTwin — Interactive Network Digital Twin",
        "status": "online",
        "api_docs": "/api/docs",
        "health_check": "/api/health"
    }
