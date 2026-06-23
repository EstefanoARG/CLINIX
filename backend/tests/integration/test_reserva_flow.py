"""Integration tests: reserva web -> conversion a cita"""
import pytest
from fastapi.testclient import TestClient


class TestReservaFlow:
    def test_create_public_reserva(self, client: TestClient):
        response = client.post("/api/v1/public/reservas", json={
            "nombre_solicitante": "Juan Perez",
            "dni_solicitante": "12345678",
            "email_solicitante": "juan@example.com",
            "especialidad_id": 1,
            "fecha_hora_deseada": "2026-07-01T10:00:00",
            "acepta_terminos": True,
        })
        assert response.status_code == 201
        data = response.json()
        assert data["estado"] == "Pendiente"
        assert data["acepta_terminos"] is True

    def test_create_reserva_rejects_without_terms(self, client: TestClient):
        response = client.post("/api/v1/public/reservas", json={
            "nombre_solicitante": "Juan Perez",
            "dni_solicitante": "12345678",
            "email_solicitante": "juan@example.com",
            "especialidad_id": 1,
            "fecha_hora_deseada": "2026-07-01T10:00:00",
            "acepta_terminos": False,
        })
        assert response.status_code == 409

    def test_disponibilidad_publica(self, client: TestClient):
        response = client.get("/api/v1/disponibilidad/1?fecha=2026-07-01")
        assert response.status_code == 200
        data = response.json()
        assert "slots" in data
        assert data["medico_id"] == 1

    def test_list_medicos_publico(self, client: TestClient):
        response = client.get("/api/v1/public/medicos")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    def test_assign_doctor_and_convert_reserva(self, client: TestClient):
        created = client.post("/api/v1/public/reservas", json={
            "nombre_solicitante": "Paciente Conversión",
            "dni_solicitante": "99887711",
            "email_solicitante": "conversion@example.com",
            "especialidad_id": 1,
            "fecha_hora_deseada": "2026-07-02T08:00:00",
            "acepta_terminos": True,
        })
        assert created.status_code == 201
        reserva_id = created.json()["reserva_id"]

        assigned = client.put(f"/api/v1/reservas/{reserva_id}", json={"medico_id": 1})
        assert assigned.status_code == 200
        assert assigned.json()["medico_id"] == 1

        converted = client.post(
            f"/api/v1/reservas/{reserva_id}/convertir",
            json={"ubicacion_id": 1, "observaciones": "Conversión de prueba"},
        )
        assert converted.status_code == 201
        assert converted.json()["reserva_id"] == reserva_id
