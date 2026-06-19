"""Integration tests for authentication flows"""
import pytest
from fastapi.testclient import TestClient


class TestAuthFlows:
    def test_register_paciente(self, client: TestClient):
        response = client.post("/api/v1/auth/register", json={
            "dni": "12345678",
            "nombre": "Test",
            "apellido": "Paciente",
            "email": "test@example.com",
            "password": "password123",
            "acepta_terminos": True,
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "Paciente"

    def test_register_rejects_without_terms(self, client: TestClient):
        response = client.post("/api/v1/auth/register", json={
            "dni": "87654321",
            "nombre": "Test",
            "apellido": "Paciente",
            "email": "test2@example.com",
            "password": "password123",
            "acepta_terminos": False,
        })
        assert response.status_code == 409

    def test_login_paciente(self, client: TestClient):
        client.post("/api/v1/auth/register", json={
            "dni": "11111111", "nombre": "Login", "apellido": "Test",
            "email": "login@example.com", "password": "pass123",
            "acepta_terminos": True,
        })
        response = client.post("/api/v1/auth/login/paciente", json={
            "email": "login@example.com",
            "password": "pass123",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_admin_invalid(self, client: TestClient):
        response = client.post("/api/v1/auth/login", json={
            "email": "noexiste@test.com",
            "password": "wrong",
        })
        assert response.status_code == 401

    def test_forgot_password(self, client: TestClient):
        response = client.post("/api/v1/auth/forgot-password", json={
            "email": "noexiste@test.com",
        })
        assert response.status_code == 200
