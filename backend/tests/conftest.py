import os
from pathlib import Path
import tempfile
import uuid

import pytest
from fastapi.testclient import TestClient


TEST_DB_PATH = Path(tempfile.gettempdir()) / f"clinix-tests-{uuid.uuid4().hex}.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH.as_posix()}"
os.environ["DEMO_SEED"] = "true"

from app.core.database import Base, engine
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def test_database():
    Base.metadata.create_all(bind=engine)
    yield
    engine.dispose()
    TEST_DB_PATH.unlink(missing_ok=True)


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        login = test_client.post("/api/v1/auth/login", json={
            "email": "admin@clinix.com",
            "password": "admin123",
        })
        assert login.status_code == 200
        test_client.headers["Authorization"] = (
            f"Bearer {login.json()['access_token']}"
        )
        yield test_client
