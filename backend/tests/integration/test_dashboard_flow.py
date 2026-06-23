def test_dashboard_incluye_metricas_graficos_e_indicadores(client):
    response = client.get("/api/v1/dashboard?periodo=semana")

    assert response.status_code == 200
    data = response.json()

    assert data["periodo_desde"]
    assert data["periodo_hasta"]
    assert "total_citas_periodo" in data["metricas"]
    assert "ocupacion_hospitalaria" in data["indicadores"]
    assert len(data["graficos"]["tendencia"]) == 7
    assert isinstance(data["graficos"]["estados_citas"], list)
    assert isinstance(data["graficos"]["demanda_especialidades"], list)
    assert isinstance(data["actividades"], list)
    assert "doctores_hoy" in data["tablas"]
