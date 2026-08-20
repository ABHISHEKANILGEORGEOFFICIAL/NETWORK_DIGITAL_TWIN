import json
import asyncio
from typing import List, Dict, Set
from fastapi import WebSocket
from app.core.logging_config import logger

class ConnectionManager:
    """
    Real-Time WebSocket Connection Hub:
    - Maintains active client WebSocket connections across channels
    - Broadcasts high-frequency telemetry, live alerts, and topology status updates
    - Automatically prunes disconnected sockets
    """
    def __init__(self):
        self.telemetry_connections: Set[WebSocket] = set()
        self.alert_connections: Set[WebSocket] = set()
        self.topology_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, channel: str = "telemetry"):
        await websocket.accept()
        if channel == "telemetry":
            self.telemetry_connections.add(websocket)
        elif channel == "alerts":
            self.alert_connections.add(websocket)
        elif channel == "topology":
            self.topology_connections.add(websocket)
        logger.info(f"WebSocket client connected to channel '{channel}'. Total {channel} clients: {len(self._get_channel(channel))}")

    def disconnect(self, websocket: WebSocket, channel: str = "telemetry"):
        target_set = self._get_channel(channel)
        if websocket in target_set:
            target_set.remove(websocket)
        logger.info(f"WebSocket client disconnected from channel '{channel}'. Remaining {channel} clients: {len(target_set)}")

    def _get_channel(self, channel: str) -> Set[WebSocket]:
        if channel == "telemetry":
            return self.telemetry_connections
        elif channel == "alerts":
            return self.alert_connections
        elif channel == "topology":
            return self.topology_connections
        return set()

    async def broadcast_telemetry(self, message: Dict):
        await self._broadcast_to_set(self.telemetry_connections, message)

    async def broadcast_alert(self, message: Dict):
        await self._broadcast_to_set(self.alert_connections, message)

    async def broadcast_topology(self, message: Dict):
        await self._broadcast_to_set(self.topology_connections, message)

    async def _broadcast_to_set(self, sockets: Set[WebSocket], message: Dict):
        if not sockets:
            return
        
        payload_str = json.dumps(message, default=str)
        dead_sockets = []
        
        for ws in list(sockets):
            try:
                await ws.send_text(payload_str)
            except Exception:
                dead_sockets.append(ws)

        for ws in dead_sockets:
            if ws in sockets:
                sockets.remove(ws)

connection_manager = ConnectionManager()
