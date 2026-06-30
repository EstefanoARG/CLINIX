from pathlib import Path
import json
import re

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import (
    CIE10Diagnostico,
    Clinica,
    Especialidad,
    LandingComparisonRow,
    LandingFAQ,
    LandingMetric,
    LandingPlan,
    LandingPlanFeature,
    LandingTestimonial,
    PacienteAuth,
    Role,
    Usuario,
)


INSERT_PATTERN = re.compile(r"INSERT\s+INTO\s+.+?;", re.IGNORECASE | re.DOTALL)


def _is_bootstrap_only(db: Session) -> bool:
    return (
        db.query(Especialidad).count() == 0
        and db.query(Clinica).count() <= 1
        and db.query(Role).count() <= 4
        and db.query(Usuario).count() <= 1
    )


def should_rebuild_sqlite_demo(db: Session) -> bool:
    if not _is_bootstrap_only(db):
        return False
    columns = db.execute(text("PRAGMA table_info('CLINICA')")).mappings().all()
    active_column = next((column for column in columns if column["name"] == "Activo"), None)
    return active_column is not None and active_column["dflt_value"] is None


def _reset_bootstrap_data(db: Session) -> None:
    db.query(Usuario).delete()
    db.query(Role).delete()
    db.query(Clinica).delete()
    db.commit()


def _load_sqlite_demo_data(db: Session) -> None:
    sql_path = Path(__file__).resolve().parents[2] / "database" / "seed_data.sql"
    source = sql_path.read_text(encoding="utf-8")
    statements = INSERT_PATTERN.findall(source)
    for statement in statements:
        db.execute(text(statement))
    db.commit()


def _make_demo_passwords_functional(db: Session) -> None:
    admin_hash = hash_password("admin123")
    staff_hash = hash_password("clinix123")
    patient_hash = hash_password("paciente123")

    users = db.query(Usuario).filter(Usuario.PasswordHash.like("hash_pass_%")).all()
    for user in users:
        user.PasswordHash = (
            admin_hash
            if user.role and user.role.NombreRole == "Administrador"
            else staff_hash
        )

    patient_accounts = db.query(PacienteAuth).filter(
        PacienteAuth.PasswordHash.like("hash_paciente_%")
    ).all()
    for account in patient_accounts:
        account.PasswordHash = patient_hash

    db.commit()


def _ensure_minimum_data(db: Session) -> None:
    if db.query(Role).count() == 0:
        for name in ["Administrador", "Médico", "Enfermero", "Recepcionista"]:
            db.add(Role(NombreRole=name))
        db.flush()

    if db.query(Clinica).count() == 0:
        db.add(Clinica(
            Nombre="CLINIX Central",
            RUC="20123456789",
            Direccion="Av. Principal 123",
            Telefono="+51 1 234 5678",
            Email="contacto@clinix.com",
            PlanSuscripcion="Premium",
        ))
        db.flush()

    admin = db.query(Usuario).filter(Usuario.Email == "admin@clinix.com").first()
    if not admin:
        clinic = db.query(Clinica).order_by(Clinica.ClinicalID).first()
        role = db.query(Role).filter(Role.NombreRole == "Administrador").first()
        db.add(Usuario(
            ClinicalID=clinic.ClinicalID,
            RoleID=role.RoleID,
            Nombre="Admin",
            Apellido="Sistema",
            DNI="00000001",
            Email="admin@clinix.com",
            Telefono="+51 999 999 999",
            PasswordHash=hash_password("admin123"),
        ))

    db.commit()


def _seed_landing_data(db: Session) -> None:
    if db.query(LandingPlan).count() == 0:
        plans = [
            {
                "Slug": "starter",
                "Nombre": "Starter",
                "Descripcion": "Digitalizate y gana visibilidad con reservas en linea y recordatorios de visitas.",
                "Precio": 199.17,
                "PrecioConWeb": 254.17,
                "Periodo": "Al mes, con cargo anual",
                "ColorAcento": "#D85F99",
                "Icono": "star",
                "IntroBeneficios": "Beneficios incluidos:",
                "Orden": 1,
                "features": [
                    ("Calendario para consulta en linea", "Permite que tus pacientes reserven consultas en linea."),
                    ("Recordatorios por correo", "Reduce ausencias con recordatorios automaticos."),
                    ("Portal de pacientes", "Tus pacientes se registran, ven sus citas y reservan online."),
                    ("Notificaciones por correo", "Confirmaciones y recordatorios via email."),
                ],
            },
            {
                "Slug": "plus",
                "Nombre": "Plus",
                "Descripcion": "Ofrece una excelente experiencia a tus pacientes y haz mas eficiente tu practica.",
                "Precio": 249.17,
                "PrecioConWeb": 304.17,
                "Periodo": "Al mes, con cargo anual",
                "ColorAcento": "#1662C6",
                "Icono": "zap",
                "IntroBeneficios": "Todos los beneficios del plan Starter y:",
                "Popular": True,
                "EtiquetaPopular": "Mas Popular",
                "Orden": 2,
                "features": [
                    ("Episodios clinicos", "Recopila toda la informacion clinica de tus pacientes."),
                    ("Adjuntos a historias clinicas", "Sube PDF, imagenes y documentos DICOM."),
                    ("Dashboard de metricas", "Visualiza indicadores clave de tu consulta."),
                    ("Perfil publico de medico", "Los pacientes te encuentran y reservan online."),
                ],
            },
            {
                "Slug": "vip",
                "Nombre": "VIP",
                "Descripcion": "Impulsa tu exito con las mejores herramientas para ti y tus pacientes.",
                "Precio": 299.17,
                "PrecioConWeb": 354.17,
                "Periodo": "Al mes, con cargo anual",
                "ColorAcento": "#F9A83E",
                "Icono": "crown",
                "IntroBeneficios": "Todos los beneficios del plan Plus y:",
                "Orden": 3,
                "features": [
                    ("Gestion de admisiones", "Administra ingresos, habitaciones y altas hospitalarias."),
                    ("Auditoria y trazabilidad", "Registro detallado de todas las acciones del sistema."),
                    ("Multiples roles y sedes", "Medicos, enfermeras, recepcionistas con acceso granular."),
                    ("Reportes avanzados", "Informes personalizados de tu operacion clinica."),
                ],
            },
        ]
        for plan_data in plans:
            features = plan_data.pop("features")
            plan = LandingPlan(**plan_data)
            db.add(plan)
            db.flush()
            for index, (text_value, tooltip) in enumerate(features, start=1):
                db.add(LandingPlanFeature(
                    PlanID=plan.PlanID,
                    Texto=text_value,
                    Tooltip=tooltip,
                    Orden=index,
                ))

    if db.query(LandingMetric).count() == 0:
        db.add_all([
            LandingMetric(Slug="clinicas", Icono="building", Etiqueta="Clinicas", Valor=0, Sufijo="+", Fuente="clinicas_count", Orden=1),
            LandingMetric(Slug="pacientes", Icono="users", Etiqueta="Pacientes", Valor=0, Sufijo="+", Fuente="pacientes_count", Orden=2),
            LandingMetric(Slug="disponibilidad", Icono="shield", Etiqueta="Disponibilidad", Valor=99.9, Sufijo="%", Fuente="manual", Orden=3),
            LandingMetric(Slug="soporte", Icono="headphones", Etiqueta="", Valor=24, Sufijo="/7 Soporte", Fuente="manual", Orden=4),
        ])

    if db.query(LandingTestimonial).count() == 0:
        db.add_all([
            LandingTestimonial(
                Nombre="Dr. Ricardo Munoz Leon",
                Especialidad="Pediatra",
                Ubicacion="Lima",
                AvatarURL="https://pro.clinix.pe/hubfs/2021%20DOC%20FAC%20merge%20project/Peru/Customers/Headshots/pe-headshot-ricardo-munoz-leon.png",
                Texto="Luego de utilizar CLINIX he visto un gran crecimiento en mi lista de pacientes y una mejor comunicacion con ellos.",
                Orden=1,
            ),
            LandingTestimonial(
                Nombre="Dr. Ruslan Golovliov",
                Especialidad="Gastroenterologo",
                Ubicacion="Lima",
                AvatarURL="https://pro.clinix.pe/hubfs/2021%20DOC%20FAC%20merge%20project/Peru/Customers/Headshots/pe-headshot-ruslan-golovliov.png",
                Texto="CLINIX me ha ayudado a retener mis pacientes. Ellos recurren a mi cada vez mas para agendar una consulta en linea.",
                Orden=2,
            ),
            LandingTestimonial(
                Nombre="Dr. Juan Manuel Menendez",
                Especialidad="Cardiologo",
                Ubicacion="Lima",
                AvatarURL="https://pro.clinix.pe/hubfs/2021%20DOC%20FAC%20merge%20project/Peru/Customers/Headshots/pe-headshot-juan-manuel-menendez.png",
                Texto="Las opiniones me han servido para mejorar mi presencia en Internet y recibir mejores recomendaciones.",
                Orden=3,
            ),
        ])

    if db.query(LandingFAQ).count() == 0:
        faqs = [
            ("Los planes tienen compromiso de permanencia?", "La suscripcion a un plan tiene un periodo de permanencia para asegurar implementacion y acompanamiento."),
            ("Cuales son las modalidades de pago disponibles?", "El pago de la suscripcion es anual. Tambien puedes contratar una pagina web profesional junto con tu plan."),
            ("Necesito conocimientos de computo?", "No. La agenda y las herramientas estan pensadas para operar sin instalacion ni soporte tecnico permanente."),
            ("Pueden los pacientes reservar citas online?", "Si. A traves del portal de pacientes, pueden ver disponibilidad y reservar citas sin necesidad de llamar."),
            ("Que posicion ocupare en los listados?", "Los planes pagos permiten mejorar la visibilidad frente a perfiles gratuitos."),
            ("Que documentos se pueden adjuntar a la historia clinica?", "Puedes adjuntar PDF, imagenes y documentos DICOM directamente a la historia clinica del paciente."),
        ]
        for index, (question, answer) in enumerate(faqs, start=1):
            db.add(LandingFAQ(Pregunta=question, Respuesta=answer, Orden=index))

    if db.query(LandingComparisonRow).count() == 0:
        rows = [
            ("Gestion de pacientes", "", "", ["", "", ""]),
            ("", "Reserva online de cita", "Permite que los pacientes programen su cita.", ["check", "check", "check"]),
            ("", "Portal de pacientes", "Portal web para que los pacientes gestionen sus citas.", ["check", "check", "check"]),
            ("", "Recordatorios de visitas", "Reduce las ausencias con recordatorios automaticos.", ["Via e-mail", "Via e-mail", "Via e-mail y dashboard"]),
            ("", "Episodios clinicos", "Recopila informacion clinica del paciente.", ["-", "check", "check"]),
            ("", "Adjuntos a historia clinica", "Sube PDF, imagenes y DICOM.", ["-", "check", "check"]),
            ("", "CIE-10 diagnosticos", "Catalogo completo de diagnosticos medicos.", ["check", "check", "check"]),
            ("Gestion del consultorio", "", "", ["", "", ""]),
            ("", "Calendario de consulta", "Gestiona tu agenda y disponibilidad.", ["check", "check", "check"]),
            ("", "Dashboard de metricas", "Visualiza indicadores clave de tu consulta.", ["check", "check", "check"]),
            ("", "Perfil publico de medico", "Los pacientes te encuentran en los listados.", ["Basico", "Mejorado", "Destacado"]),
            ("", "Notificaciones por correo", "Confirmaciones y recordatorios automaticos.", ["check", "check", "check"]),
            ("Hospitalización y roles", "", "", ["", "", ""]),
            ("", "Gestion de admisiones", "Administra ingresos, habitaciones y altas.", ["-", "-", "check"]),
            ("", "Auditoria y trazabilidad", "Registro detallado de acciones del sistema.", ["-", "-", "check"]),
            ("", "Multiples roles", "Medicos, enfermeras, recepcionistas.", ["-", "-", "check"]),
            ("", "Reportes avanzados", "Informes personalizados de operacion.", ["-", "-", "check"]),
        ]
        for index, (category, feature, tooltip, values) in enumerate(rows, start=1):
            db.add(LandingComparisonRow(
                Categoria=category or None,
                Caracteristica=feature or None,
                Tooltip=tooltip or None,
                ValoresJSON=json.dumps(values),
                Orden=index,
            ))

    db.commit()


def _seed_cie10_codes(db: Session) -> None:
    if db.query(CIE10Diagnostico).count() > 0:
        return

    codes_by_esp: dict[str, list[tuple[str, str, str]]] = {
        "Medicina General": [
            ("A09", "Diarrea y gastroenteritis de presunto origen infeccioso", "Enfermedades infecciosas intestinales"),
            ("B34", "Infección viral de sitio no especificado", "Enfermedades virales"),
            ("E78", "Hiperlipidemia no especificada", "Trastornos del metabolismo lipídico"),
            ("J00", "Resfriado común", "Infecciones agudas de las vías respiratorias superiores"),
            ("J06.9", "Infección aguda de las vías respiratorias superiores, no especificada", "Infecciones agudas de las vías respiratorias superiores"),
            ("J15", "Neumonía bacteriana no clasificada en otra parte", "Neumonía"),
            ("N39", "Trastorno del sistema urinario no especificado", "Enfermedades del sistema urinario"),
            ("R05", "Tos", "Síntomas generales"),
            ("R10", "Dolor abdominal y pélvico", "Síntomas generales"),
            ("R50", "Fiebre de origen desconocido", "Síntomas generales"),
            ("R51", "Cefalea", "Síntomas generales"),
            ("R53", "Malestar y fatiga", "Síntomas generales"),
            ("Z00", "Examen general y reconocimiento de personas sin quejas", "Exámenes de salud de rutina"),
            ("Z23", "Necesidad de vacunación contra enfermedad bacteriana única", "Vacunación"),
            ("Z30", "Atención para anticoncepción", "Anticoncepción"),
        ],
        "Cardiología": [
            ("E78", "Hiperlipidemia no especificada", "Trastornos del metabolismo lipídico"),
            ("I10", "Hipertensión esencial (primaria)", "Enfermedades hipertensivas"),
            ("I11", "Cardiopatía hipertensiva", "Enfermedades hipertensivas"),
            ("I20", "Angina de pecho", "Cardiopatía isquémica"),
            ("I21", "Infarto agudo de miocardio", "Cardiopatía isquémica"),
            ("I25", "Cardiopatía isquémica crónica", "Cardiopatía isquémica"),
            ("I42", "Miocardiopatía", "Miocardiopatías"),
            ("I47", "Taquicardia paroxística", "Trastornos del ritmo cardíaco"),
            ("I48", "Fibrilación y aleteo auricular", "Trastornos del ritmo cardíaco"),
            ("I49", "Otras arritmias cardíacas", "Trastornos del ritmo cardíaco"),
            ("I50", "Insuficiencia cardíaca", "Insuficiencia cardíaca"),
            ("I51", "Complicaciones de cardiopatía y descripción inadecuada", "Enfermedades cardiovasculares"),
            ("I63", "Infarto cerebral", "Enfermedades cerebrovasculares"),
            ("I64", "Accidente vascular encefálico agudo no especificado", "Enfermedades cerebrovasculares"),
            ("I70", "Aterosclerosis", "Enfermedades arteriales"),
            ("R00", "Palpitaciones", "Síntomas cardiovasculares"),
        ],
        "Neurología": [
            ("F03", "Demencia no especificada", "Demencia"),
            ("F07", "Trastorno orgánico de la personalidad", "Trastornos de la personalidad orgánicos"),
            ("G20", "Enfermedad de Parkinson", "Enfermedades extrapiramidales"),
            ("G30", "Enfermedad de Alzheimer", "Enfermedades degenerativas del sistema nervioso"),
            ("G40", "Epilepsia", "Epilepsia"),
            ("G43", "Migraña", "Cefaleas"),
            ("G44", "Otras cefaleas", "Cefaleas"),
            ("G45", "Ataques de isquemia cerebral transitoria", "Enfermedades cerebrovasculares"),
            ("G50", "Trastornos del nervio trigémino", "Trastornos de nervios craneales"),
            ("G54", "Trastornos de raíces y plexos nerviosos", "Trastornos de raíces y plexos"),
            ("G56", "Síndrome del túnel carpiano", "Mononeuropatías"),
            ("G62", "Polineuropatía no especificada", "Polineuropatías"),
            ("G90", "Trastornos del sistema nervioso autónomo", "Trastornos del SNA"),
            ("I63", "Infarto cerebral", "Enfermedades cerebrovasculares"),
            ("I67", "Enfermedad cerebrovascular aterosclerótica", "Enfermedades cerebrovasculares"),
            ("R51", "Cefalea", "Síntomas generales"),
        ],
        "Pediatría General": [
            ("A09", "Diarrea y gastroenteritis de presunto origen infeccioso", "Enfermedades infecciosas intestinales"),
            ("B05", "Sarampión", "Enfermedades virales exantemáticas"),
            ("B06", "Rubeola", "Enfermedades virales exantemáticas"),
            ("B15", "Hepatitis aguda tipo A", "Hepatitis viral"),
            ("E10", "Diabetes mellitus tipo 1", "Diabetes mellitus"),
            ("H10", "Conjuntivitis", "Conjuntivitis"),
            ("H66", "Otitis media supurativa", "Otitis media"),
            ("J00", "Resfriado común", "Infecciones agudas de las vías respiratorias superiores"),
            ("J02", "Faringitis aguda", "Infecciones agudas de las vías respiratorias superiores"),
            ("J03", "Amigdalitis aguda", "Infecciones agudas de las vías respiratorias superiores"),
            ("J06.9", "Infección aguda de las vías respiratorias superiores, no especificada", "Infecciones agudas de las vías respiratorias superiores"),
            ("J15", "Neumonía bacteriana no clasificada en otra parte", "Neumonía"),
            ("J45", "Asma", "Asma"),
            ("K29", "Gastritis no especificada", "Enfermedades del esófago, estómago y duodeno"),
            ("N39", "Trastorno del sistema urinario no especificado", "Enfermedades del sistema urinario"),
            ("R05", "Tos", "Síntomas generales"),
            ("R10", "Dolor abdominal y pélvico", "Síntomas generales"),
            ("R50", "Fiebre de origen desconocido", "Síntomas generales"),
            ("Z23", "Necesidad de vacunación contra enfermedad bacteriana única", "Vacunación"),
            ("Z27", "Necesidad de vacunación contra combinaciones de enfermedades", "Vacunación"),
        ],
        "Traumatología": [
            ("M13", "Artritis no especificada", "Artritis"),
            ("M16", "Coxartrosis (artrosis de cadera)", "Artrosis"),
            ("M17", "Gonartrosis (artrosis de rodilla)", "Artrosis"),
            ("M19", "Artrosis no especificada", "Artrosis"),
            ("M23", "Trastorno interno de rodilla", "Trastornos articulares"),
            ("M25", "Otros trastornos articulares no clasificados", "Trastornos articulares"),
            ("M40", "Cifosis y lordosis", "Deformidades de la columna"),
            ("M41", "Escoliosis", "Deformidades de la columna"),
            ("M43", "Otras deformidades de la columna", "Deformidades de la columna"),
            ("M48", "Estenosis del conducto raquídeo", "Espondilopatías"),
            ("M51", "Trastorno de disco lumbar", "Trastornos de disco intervertebral"),
            ("M54", "Lumbago (dolor en la espalda baja)", "Dorsopatías"),
            ("M75", "Hombro doloroso", "Lesiones del hombro"),
            ("M79", "Otros trastornos de los tejidos blandos", "Trastornos de tejidos blandos"),
            ("S06", "Traumatismo intracraneal", "Traumatismos de la cabeza"),
            ("S22", "Fractura de costilla", "Fracturas del tórax"),
            ("S42", "Fractura de húmero", "Fracturas del miembro superior"),
            ("S52", "Fractura de antebrazo", "Fracturas del miembro superior"),
            ("S62", "Fractura de mano", "Fracturas del miembro superior"),
            ("S72", "Fractura de fémur", "Fracturas del miembro inferior"),
            ("S82", "Fractura de pierna", "Fracturas del miembro inferior"),
            ("S83", "Luxación de rodilla", "Luxaciones"),
            ("S93", "Luxación de tobillo", "Luxaciones"),
            ("T14", "Traumatismo de región no especificada del cuerpo", "Traumatismos"),
        ],
        "Ginecología": [
            ("C53", "Neoplasia maligna del cuello uterino", "Neoplasias malignas"),
            ("D05", "Carcinoma in situ de mama", "Neoplasias in situ"),
            ("D25", "Leiomioma del útero", "Neoplasias benignas"),
            ("D26", "Otros neoplasmas benignos del útero", "Neoplasias benignas"),
            ("E28", "Disfunción ovárica", "Trastornos ováricos"),
            ("N20", "Cálculo del riñón y uréter", "Litiasis urinaria"),
            ("N23", "Cólico renal no especificado", "Litiasis urinaria"),
            ("N30", "Cistitis", "Cistitis"),
            ("N39", "Trastorno del sistema urinario no especificado", "Enfermedades del sistema urinario"),
            ("N61", "Trastornos inflamatorios de la mama", "Trastornos de la mama"),
            ("N63", "Nódulo mamario no especificado", "Trastornos de la mama"),
            ("N64", "Otros trastornos de la mama", "Trastornos de la mama"),
            ("N70", "Salpingitis y ooforitis", "Enfermedades inflamatorias pélvicas"),
            ("N72", "Enfermedad inflamatoria del cuello uterino", "Enfermedades inflamatorias pélvicas"),
            ("N76", "Inflamación de la vagina y vulva", "Enfermedades inflamatorias pélvicas"),
            ("N80", "Endometriosis", "Endometriosis"),
            ("N81", "Prolapso genital femenino", "Prolapso genital"),
            ("N85", "Otros trastornos no inflamatorios del útero", "Trastornos uterinos"),
            ("N91", "Ausencia de menstruación", "Trastornos menstruales"),
            ("N92", "Menstruación excesiva o irregular", "Trastornos menstruales"),
            ("N93", "Sangrado uterino anormal", "Trastornos menstruales"),
            ("N95", "Trastornos menopáusicos y perimenopáusicos", "Trastornos menopáusicos"),
            ("Z01", "Examen ginecológico", "Exámenes de salud de rutina"),
            ("Z12", "Examen de detección de neoplasias malignas", "Exámenes de salud de rutina"),
            ("Z30", "Atención para anticoncepción", "Anticoncepción"),
            ("Z32", "Examen de embarazo", "Atención materna"),
        ],
        "Oncología": [
            ("C00", "Neoplasia maligna del labio", "Neoplasias malignas"),
            ("C16", "Neoplasia maligna del estómago", "Neoplasias malignas del tracto digestivo"),
            ("C18", "Neoplasia maligna del colon", "Neoplasias malignas del tracto digestivo"),
            ("C22", "Neoplasia maligna del hígado", "Neoplasias malignas del tracto digestivo"),
            ("C25", "Neoplasia maligna del páncreas", "Neoplasias malignas del tracto digestivo"),
            ("C34", "Neoplasia maligna de bronquio y pulmón", "Neoplasias malignas respiratorias"),
            ("C50", "Neoplasia maligna de la mama", "Neoplasias malignas de mama"),
            ("C53", "Neoplasia maligna del cuello uterino", "Neoplasias malignas ginecológicas"),
            ("C56", "Neoplasia maligna del ovario", "Neoplasias malignas ginecológicas"),
            ("C61", "Neoplasia maligna de la próstata", "Neoplasias malignas urológicas"),
            ("C64", "Neoplasia maligna del riñón", "Neoplasias malignas urológicas"),
            ("C67", "Neoplasia maligna de la vejiga", "Neoplasias malignas urológicas"),
            ("C71", "Neoplasia maligna del encéfalo", "Neoplasias malignas del SNC"),
            ("C73", "Neoplasia maligna de la glándula tiroides", "Neoplasias malignas endócrinas"),
            ("C81", "Enfermedad de Hodgkin", "Neoplasias malignas linfáticas"),
            ("C82", "Linfoma no Hodgkin", "Neoplasias malignas linfáticas"),
            ("C91", "Leucemia linfoide", "Leucemias"),
            ("C92", "Leucemia mieloide", "Leucemias"),
            ("D05", "Carcinoma in situ de mama", "Neoplasias in situ"),
            ("D09", "Carcinoma in situ de otros sitios", "Neoplasias in situ"),
        ],
        "Dermatología": [
            ("A63", "Otras enfermedades de transmisión principalmente sexual", "ETS"),
            ("B00", "Infecciones por virus del herpes", "Enfermedades virales"),
            ("B02", "Herpes zóster", "Enfermedades virales"),
            ("B07", "Verrugas virales", "Enfermedades virales"),
            ("B35", "Dermatofitosis (tiña)", "Micosis superficiales"),
            ("B36", "Otras micosis superficiales", "Micosis superficiales"),
            ("B86", "Escabiosis (sarna)", "Infestaciones"),
            ("L00", "Síndrome de piel escaldada estafilocócica", "Infecciones de la piel"),
            ("L01", "Impétigo", "Infecciones de la piel"),
            ("L02", "Absceso cutáneo, forúnculo y ántrax", "Infecciones de la piel"),
            ("L03", "Celulitis", "Infecciones de la piel"),
            ("L20", "Dermatitis atópica (eczema)", "Dermatitis"),
            ("L21", "Dermatitis seborreica", "Dermatitis"),
            ("L23", "Dermatitis alérgica de contacto", "Dermatitis"),
            ("L25", "Dermatitis de contacto no especificada", "Dermatitis"),
            ("L30", "Otra dermatitis no especificada", "Dermatitis"),
            ("L40", "Psoriasis", "Psoriasis"),
            ("L50", "Urticaria", "Urticaria"),
            ("L60", "Trastornos de las uñas", "Trastornos ungueales"),
            ("L70", "Acné", "Acné"),
            ("L81", "Trastornos de la pigmentación", "Trastornos pigmentarios"),
            ("L89", "Úlcera de decúbito", "Úlceras"),
            ("L90", "Trastornos atróficos de la piel", "Trastornos cutáneos"),
            ("L91", "Trastornos hipertróficos de la piel", "Trastornos cutáneos"),
            ("L92", "Trastornos granulomatosos de la piel", "Trastornos cutáneos"),
            ("R21", "Salpullido y erupción cutánea", "Síntomas cutáneos"),
        ],
        "Oftalmología": [
            ("H00", "Orzuelo y calacio", "Trastornos del párpado"),
            ("H01", "Blefaritis", "Trastornos del párpado"),
            ("H02", "Otros trastornos del párpado", "Trastornos del párpado"),
            ("H04", "Trastornos del aparato lagrimal", "Trastornos lagrimales"),
            ("H10", "Conjuntivitis", "Conjuntivitis"),
            ("H11", "Otros trastornos de la conjuntiva", "Conjuntivitis"),
            ("H15", "Trastornos de la esclerótica", "Trastornos esclerales"),
            ("H16", "Queratitis", "Queratitis"),
            ("H18", "Otros trastornos de la córnea", "Trastornos corneales"),
            ("H20", "Iridociclitis (uveítis anterior)", "Trastornos del iris"),
            ("H25", "Catarata senil", "Cataratas"),
            ("H26", "Otras cataratas", "Cataratas"),
            ("H27", "Otros trastornos del cristalino", "Cataratas"),
            ("H33", "Desprendimiento de retina", "Trastornos retinianos"),
            ("H35", "Otros trastornos de la retina", "Trastornos retinianos"),
            ("H40", "Glaucoma", "Glaucoma"),
            ("H43", "Trastornos del vítreo", "Trastornos vítreos"),
            ("H46", "Neuritis óptica", "Trastornos del nervio óptico"),
            ("H52", "Trastornos de la refracción y acomodación", "Trastornos refractivos"),
            ("H53", "Alteraciones visuales", "Alteraciones visuales"),
            ("H54", "Ceguera", "Alteraciones visuales"),
            ("H57", "Otros trastornos del ojo", "Trastornos oculares"),
            ("Z01", "Examen oftalmológico", "Exámenes de salud de rutina"),
        ],
        "Psicología": [
            ("F10", "Trastornos mentales y del comportamiento por consumo de alcohol", "Trastornos por consumo de sustancias"),
            ("F11", "Trastornos mentales por consumo de opiáceos", "Trastornos por consumo de sustancias"),
            ("F12", "Trastornos mentales por consumo de cannabis", "Trastornos por consumo de sustancias"),
            ("F17", "Trastornos mentales por consumo de tabaco", "Trastornos por consumo de sustancias"),
            ("F20", "Esquizofrenia", "Esquizofrenia"),
            ("F25", "Trastorno esquizoafectivo", "Trastornos esquizoafectivos"),
            ("F29", "Psicosis no orgánica no especificada", "Psicosis"),
            ("F31", "Trastorno bipolar", "Trastornos del estado de ánimo"),
            ("F32", "Episodio depresivo", "Trastornos del estado de ánimo"),
            ("F33", "Trastorno depresivo recurrente", "Trastornos del estado de ánimo"),
            ("F34", "Trastornos del estado de ánimo persistentes", "Trastornos del estado de ánimo"),
            ("F40", "Trastorno fóbico", "Trastornos de ansiedad"),
            ("F41", "Trastorno de ansiedad generalizada", "Trastornos de ansiedad"),
            ("F42", "Trastorno obsesivo-compulsivo", "Trastornos de ansiedad"),
            ("F43", "Reacción al estrés grave y trastornos de adaptación", "Trastornos de ansiedad"),
            ("F44", "Trastorno disociativo", "Trastornos disociativos"),
            ("F45", "Trastorno somatomorfo", "Trastornos somatomorfos"),
            ("F50", "Trastorno de la conducta alimentaria", "Trastornos alimentarios"),
            ("F51", "Trastorno del sueño no orgánico", "Trastornos del sueño"),
            ("F60", "Trastorno específico de la personalidad", "Trastornos de la personalidad"),
            ("F70", "Discapacidad intelectual leve", "Discapacidad intelectual"),
            ("F80", "Trastorno del desarrollo del habla", "Trastornos del desarrollo"),
            ("F84", "Autismo infantil", "Trastornos del desarrollo"),
            ("F90", "Trastorno hipercinético (TDAH)", "Trastornos del comportamiento"),
            ("F91", "Trastorno de la conducta", "Trastornos del comportamiento"),
            ("F93", "Trastorno emocional de inicio en la infancia", "Trastornos emocionales infantiles"),
            ("F98", "Otros trastornos emocionales y del comportamiento infantiles", "Trastornos emocionales infantiles"),
            ("R45", "Inquietud y agitación", "Síntomas emocionales"),
        ],
    }

    esp_map = {
        e.NombreEspecialidad: e.EspecialidadID
        for e in db.query(Especialidad).all()
    }

    count = 0
    for esp_name, items in codes_by_esp.items():
        esp_id = esp_map.get(esp_name)
        if esp_id is None:
            continue
        for codigo, descripcion, categoria in items:
            db.add(CIE10Diagnostico(
                Codigo=codigo,
                Descripcion=descripcion,
                Categoria=categoria,
                EspecialidadID=esp_id,
            ))
            count += 1

    db.commit()


def initialize_seed_data(db: Session, dialect_name: str, demo_seed: bool = True) -> None:
    if dialect_name == "sqlite" and demo_seed and _is_bootstrap_only(db):
        if should_rebuild_sqlite_demo(db):
            _reset_bootstrap_data(db)
        _load_sqlite_demo_data(db)

    _make_demo_passwords_functional(db)
    _ensure_minimum_data(db)
    _seed_cie10_codes(db)
    _seed_landing_data(db)
