import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(
    to: str,
    subject: str,
    body: str,
    html: bool = True,
) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_PORT:
        logger.warning("SMTP not configured, email not sent")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to
        msg["Subject"] = subject

        part = MIMEText(body, "html" if html else "plain")
        msg.attach(part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def send_appointment_confirmation(to: str, paciente_nombre: str, medico_nombre: str, fecha: str, especialidad: str) -> bool:
    subject = "CLINIX - Confirmación de Cita Médica"
    body = f"""
    <h2>CLINIX - Cita Confirmada</h2>
    <p>Hola <strong>{paciente_nombre}</strong>,</p>
    <p>Tu cita médica ha sido confirmada:</p>
    <ul>
        <li><strong>Médico:</strong> {medico_nombre}</li>
        <li><strong>Especialidad:</strong> {especialidad}</li>
        <li><strong>Fecha y hora:</strong> {fecha}</li>
    </ul>
    <p>Por favor, llega 15 minutos antes de tu cita.</p>
    <p>Saludos,<br>Equipo CLINIX</p>
    """
    return send_email(to, subject, body)


def send_admission_notification(to: str, paciente_nombre: str, medico_nombre: str, habitacion: str, fecha: str) -> bool:
    subject = "CLINIX - Notificación de Admisión Hospitalaria"
    body = f"""
    <h2>CLINIX - Admisión Registrada</h2>
    <p>Se ha registrado la admisión de <strong>{paciente_nombre}</strong>:</p>
    <ul>
        <li><strong>Médico:</strong> {medico_nombre}</li>
        <li><strong>Habitación:</strong> {habitacion}</li>
        <li><strong>Fecha de ingreso:</strong> {fecha}</li>
    </ul>
    <p>Saludos,<br>Equipo CLINIX</p>
    """
    return send_email(to, subject, body)


def send_reserva_received(to: str, paciente_nombre: str, especialidad: str, fecha: str) -> bool:
    subject = "CLINIX - Solicitud de Cita Recibida"
    body = f"""
    <h2>CLINIX - Solicitud Recibida</h2>
    <p>Hola <strong>{paciente_nombre}</strong>,</p>
    <p>Hemos recibido tu solicitud de cita médica correctamente.</p>
    <ul>
        <li><strong>Especialidad:</strong> {especialidad}</li>
        <li><strong>Fecha y hora solicitada:</strong> {fecha}</li>
    </ul>
    <p>Un administrativo revisará tu solicitud y te notificaremos cuando sea confirmada o si requiere algún ajuste.</p>
    <p>Gracias por confiar en CLINIX.</p>
    <p>Saludos,<br>Equipo CLINIX</p>
    """
    return send_email(to, subject, body)


def send_reserva_rejected(to: str, paciente_nombre: str, motivo: str, especialidad: str) -> bool:
    subject = "CLINIX - Solicitud de Cita Rechazada"
    body = f"""
    <h2>CLINIX - Solicitud Rechazada</h2>
    <p>Hola <strong>{paciente_nombre}</strong>,</p>
    <p>Lamentamos informarte que tu solicitud de cita para <strong>{especialidad}</strong> ha sido rechazada.</p>
    <p><strong>Motivo:</strong> {motivo}</p>
    <p>Puedes intentar solicitar una nueva cita con otro horario o especialidad desde nuestro portal.</p>
    <p>Saludos,<br>Equipo CLINIX</p>
    """
    return send_email(to, subject, body)


def send_cita_reminder(to: str, paciente_nombre: str, medico_nombre: str, fecha: str, especialidad: str, ubicacion: str = "") -> bool:
    subject = "CLINIX - Recordatorio de Cita Médica"
    ubicacion_html = f"<li><strong>Ubicación:</strong> {ubicacion}</li>" if ubicacion else ""
    body = f"""
    <h2>CLINIX - Recordatorio de Cita</h2>
    <p>Hola <strong>{paciente_nombre}</strong>,</p>
    <p>Te recordamos que tienes una cita médica mañana:</p>
    <ul>
        <li><strong>Médico:</strong> {medico_nombre}</li>
        <li><strong>Especialidad:</strong> {especialidad}</li>
        <li><strong>Fecha y hora:</strong> {fecha}</li>
        {ubicacion_html}
    </ul>
    <p>Por favor, llega 15 minutos antes de tu cita.</p>
    <p>Si no puedes asistir, por favor cancela con anticipación.</p>
    <p>Saludos,<br>Equipo CLINIX</p>
    """
    return send_email(to, subject, body)


def send_password_reset(to: str, token: str, paciente: bool = False) -> bool:
    prefix = "paciente" if paciente else "admin"
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}&type={prefix}"
    subject = "CLINIX - Recuperación de Contraseña"
    body = f"""
    <h2>CLINIX - Recuperación de Contraseña</h2>
    <p>Has solicitado restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
    <p>Este enlace expirará en 1 hora.</p>
    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    <p>Saludos,<br>Equipo CLINIX</p>
    """
    return send_email(to, subject, body)
