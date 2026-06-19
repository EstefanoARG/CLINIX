from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional

from domain.value_objects.dni import DNI


@dataclass
class Paciente:
    paciente_id: Optional[int]
    clinical_id: int
    dni: DNI
    nombre: str
    apellido: str
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    grupo_sanguineo: Optional[str] = None
    alergias: Optional[str] = None
    activo: bool = True
    fecha_registro: Optional[datetime] = None

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombre} {self.apellido}"

    def desactivar(self) -> None:
        self.activo = False

    def actualizar_datos(
        self,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        direccion: Optional[str] = None,
        telefono: Optional[str] = None,
        email: Optional[str] = None,
        genero: Optional[str] = None,
        fecha_nacimiento: Optional[date] = None,
        grupo_sanguineo: Optional[str] = None,
        alergias: Optional[str] = None,
        activo: Optional[bool] = None,
    ) -> None:
        if nombre is not None:
            self.nombre = nombre
        if apellido is not None:
            self.apellido = apellido
        if direccion is not None:
            self.direccion = direccion
        if telefono is not None:
            self.telefono = telefono
        if email is not None:
            self.email = email
        if genero is not None:
            self.genero = genero
        if fecha_nacimiento is not None:
            self.fecha_nacimiento = fecha_nacimiento
        if grupo_sanguineo is not None:
            self.grupo_sanguineo = grupo_sanguineo
        if alergias is not None:
            self.alergias = alergias
        if activo is not None:
            self.activo = activo
