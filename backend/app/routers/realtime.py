from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.realtime.hub import hub

router = APIRouter()


@router.websocket("/ws/events")
async def events_socket(websocket: WebSocket) -> None:
    await hub.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        hub.disconnect(websocket)
