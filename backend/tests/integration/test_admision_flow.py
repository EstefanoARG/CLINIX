"""Integration tests: admisión y alta"""
from fastapi.testclient import TestClient


class TestAdmisionFlow:
    def test_list_habitaciones(self, client: TestClient):
        response = client.get("/api/v1/habitaciones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_admitir_y_dar_alta(self, client: TestClient):
        created = client.post("/api/v1/admisiones", json={
            "paciente_id": 2,
            "medico_id": 1,
            "enfermero_id": 1,
            "habitacion_id": 1,
            "motivo_ingreso": "Observación clínica",
            "diagnostico_ingreso": "Evaluación",
        })
        assert created.status_code == 201
        admision_id = created.json()["admision_id"]
        assert created.json()["estado"] == "Activa"

        discharged = client.post(f"/api/v1/admisiones/{admision_id}/alta", json={
            "tipo_alta": "Médica",
            "diagnostico_alta": "Paciente estable",
        })
        assert discharged.status_code == 200
        assert discharged.json()["estado"] == "Alta"

    def test_auditoria(self, client: TestClient):
        response = client.get("/api/v1/auditoria")
        assert response.status_code == 200
        assert "items" in response.json()
