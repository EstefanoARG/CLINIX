from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable

from app.core.email_sender import (
    send_reserva_received,
    send_appointment_confirmation,
    send_reserva_rejected,
)

logger = logging.getLogger(__name__)


@dataclass
class DomainEvent:
    event_id: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    aggregate_id: int | None = None
    event_type: str = ""
    data: dict[str, Any] = field(default_factory=dict)


# --- Eventos del dominio ---

@dataclass
class ReservaCreada(DomainEvent):
    def __init__(self, reserva_id: int, datos: dict):
        super().__init__(
            event_type="reserva.creada",
            aggregate_id=reserva_id,
            data=datos,
        )


@dataclass
class CitaConfirmada(DomainEvent):
    def __init__(self, cita_id: int, datos: dict):
        super().__init__(
            event_type="cita.confirmada",
            aggregate_id=cita_id,
            data=datos,
        )


@dataclass
class ReservaRechazada(DomainEvent):
    def __init__(self, reserva_id: int, datos: dict):
        super().__init__(
            event_type="reserva.rechazada",
            aggregate_id=reserva_id,
            data=datos,
        )


@dataclass
class PacienteAdmitido(DomainEvent):
    def __init__(self, admision_id: int, datos: dict):
        super().__init__(
            event_type="admision.creada",
            aggregate_id=admision_id,
            data=datos,
        )


@dataclass
class AltaMedica(DomainEvent):
    def __init__(self, admision_id: int, datos: dict):
        super().__init__(
            event_type="admision.alta",
            aggregate_id=admision_id,
            data=datos,
        )


# --- Bus de eventos ---

_subscribers: dict[str, list[Callable]] = {}
_queue: list[DomainEvent] = []
_queue_lock = threading.Lock()


def subscribe(event_type: str, handler: Callable):
    if event_type not in _subscribers:
        _subscribers[event_type] = []
    _subscribers[event_type].append(handler)


def publish(event: DomainEvent):
    with _queue_lock:
        _queue.append(event)
    _process_queue()


def _process_queue():
    def worker():
        while True:
            with _queue_lock:
                if not _queue:
                    break
                event = _queue.pop(0)
            for handler in _subscribers.get(event.event_type, []):
                _run_with_retry(handler, event)
            time.sleep(0)

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()


def _run_with_retry(handler: Callable, event: DomainEvent, max_retries: int = 3, delay: float = 1.0):
    for attempt in range(max_retries):
        try:
            handler(event)
            return
        except Exception as e:
            logger.warning(
                f"Handler {handler.__name__} failed for {event.event_type} "
                f"(attempt {attempt + 1}/{max_retries}): {e}"
            )
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))
    logger.error(
        f"Handler {handler.__name__} failed permanently for {event.event_type} "
        f"after {max_retries} attempts"
    )


def subscribe_all():
    subscribe("reserva.creada", _on_reserva_creada)
    subscribe("cita.confirmada", _on_cita_confirmada)
    subscribe("reserva.rechazada", _on_reserva_rechazada)
    subscribe("admision.creada", _on_admision_creada)
    subscribe("admision.alta", _on_alta_medica)


def _on_reserva_creada(event: DomainEvent):
    logger.info(f"[EventBus] Enviando confirmación de recepción para reserva {event.aggregate_id}")
    data = event.data
    email = data.get("email")
    nombre = data.get("nombre", "Paciente")
    especialidad = data.get("especialidad_nombre", "")
    fecha = data.get("fecha", "")
    if email:
        try:
            send_reserva_received(email, nombre, especialidad, fecha)
        except Exception as e:
            logger.error(f"Error sending reservation received email: {e}")


def _on_cita_confirmada(event: DomainEvent):
    logger.info(f"[EventBus] Enviando confirmación de cita {event.aggregate_id}")
    data = event.data
    email = data.get("email")
    paciente_nombre = data.get("paciente_nombre", "Paciente")
    medico_nombre = data.get("medico_nombre", "Asignado")
    especialidad = data.get("especialidad_nombre", "")
    fecha = data.get("fecha", "")
    if email:
        try:
            send_appointment_confirmation(email, paciente_nombre, medico_nombre, fecha, especialidad)
        except Exception as e:
            logger.error(f"Error sending appointment confirmation email: {e}")


def _on_reserva_rechazada(event: DomainEvent):
    logger.info(f"[EventBus] Enviando notificación de rechazo para reserva {event.aggregate_id}")
    data = event.data
    email = data.get("email")
    nombre = data.get("nombre", "Paciente")
    motivo = data.get("motivo", "No se especificó un motivo")
    especialidad = data.get("especialidad_nombre", "")
    if email:
        try:
            send_reserva_rejected(email, nombre, motivo, especialidad)
        except Exception as e:
            logger.error(f"Error sending rejection email: {e}")


def _on_admision_creada(event: DomainEvent):
    logger.info(f"[EventBus] Admisión creada: {event.aggregate_id}")


def _on_alta_medica(event: DomainEvent):
    logger.info(f"[EventBus] Alta médica: {event.aggregate_id}")


def clear_subscribers():
    _subscribers.clear()
    with _queue_lock:
        _queue.clear()
