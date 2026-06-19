"""Integration tests: admisión y alta"""
from fastapi.testclient import TestClient


class TestAdmisionFlow:
    def test_list_habitaciones(self, client: TestClient):
        response = client.get("/api/v1/habitaciones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
