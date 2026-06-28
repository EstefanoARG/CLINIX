from __future__ import annotations

import logging
from datetime import datetime, date, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import joinedload

from app.core.database import SessionLocal
from app.core.email_sender import send_cita_reminder
from app.models import Cita, Medico, Paciente

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def enviar_recordatorios():
    logger.info("[Scheduler] Ejecutando tarea de recordatorios de citas...")
    db = SessionLocal()
    try:
        manana = date.today() + timedelta(days=1)
        citas = db.query(Cita).options(
            joinedload(Cita.paciente),
            joinedload(Cita.medico).joinedload(Medico.usuario),
            joinedload(Cita.especialidad),
            joinedload(Cita.ubicacion),
        ).filter(
            Cita.FechaHora >= datetime.combine(manana, datetime.min.time()),
            Cita.FechaHora <= datetime.combine(manana, datetime.max.time()),
            Cita.EstadoCita.in_(["Programada", "Confirmada"]),
        ).all()

        enviadas = 0
        for cita in citas:
            email = cita.paciente.Email if cita.paciente else None
            if not email:
                continue

            paciente_nombre = f"{cita.paciente.Nombre} {cita.paciente.Apellido}" if cita.paciente else "Paciente"
            medico_nombre = f"{cita.medico.usuario.Nombre} {cita.medico.usuario.Apellido}" if cita.medico and cita.medico.usuario else "Asignado"
            especialidad = cita.especialidad.NombreEspecialidad if cita.especialidad else ""
            ubicacion = cita.ubicacion.Nombre if cita.ubicacion else ""
            fecha = cita.FechaHora.strftime("%d/%m/%Y %H:%M")

            try:
                send_cita_reminder(email, paciente_nombre, medico_nombre, fecha, especialidad, ubicacion)
                enviadas += 1
            except Exception as e:
                logger.error(f"[Scheduler] Error enviando recordatorio a {email}: {e}")

        logger.info(f"[Scheduler] Recordatorios enviados: {enviadas}/{len(citas)}")
    except Exception as e:
        logger.error(f"[Scheduler] Error en tarea de recordatorios: {e}")
    finally:
        db.close()


def iniciar_scheduler():
    if scheduler.running:
        return
    scheduler.add_job(
        enviar_recordatorios,
        trigger="cron",
        hour=8,
        minute=0,
        id="recordatorio_citas",
        name="Enviar recordatorios de citas del día siguiente",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("[Scheduler] Iniciado - Recordatorios programados para las 8:00 AM")


def detener_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[Scheduler] Detenido")
