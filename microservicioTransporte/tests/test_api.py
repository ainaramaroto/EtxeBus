def build_line_payload(index: int = 1) -> dict:
    return {
        "slug": f"linea-{index}",
        "nomLinea": f"Linea {index}",
        "badge": f"L{index}",
        "subtitle": "Servicio de prueba",
        "info": "Linea para tests",
        "color": "#123456",
        "orden": index,
    }


def build_stop_payload(line_id: int, index: int) -> dict:
    return {
        "nombre": f"Parada {index}",
        "coordX": 43.25 + index,
        "coordY": -2.90 - index,
        "idLinea": line_id,
        "orden": index,
    }


def create_line(client, index: int = 1) -> dict:
    response = client.post("/lineas/", json=build_line_payload(index))
    assert response.status_code == 201
    return response.json()


def create_stop(client, line_id: int, index: int) -> dict:
    response = client.post("/paradas/", json=build_stop_payload(line_id, index))
    assert response.status_code == 201
    return response.json()


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "microservicioTransporte",
    }


def test_lineas_listado_y_detalle(client):
    creada = create_line(client, 1)

    listado = client.get("/lineas/")
    assert listado.status_code == 200
    assert len(listado.json()) == 1

    detalle = client.get(f"/lineas/{creada['idLinea']}")
    assert detalle.status_code == 200
    assert detalle.json()["slug"] == "linea-1"


def test_linea_no_encontrada_devuelve_404(client):
    response = client.get("/lineas/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Linea no encontrada"


def test_parada_devuelve_400_si_linea_no_existe(client):
    response = client.post(
        "/paradas/",
        json={
            "nombre": "Parada sin linea",
            "coordX": 43.0,
            "coordY": -2.0,
            "idLinea": 999,
            "orden": 1,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "La linea indicada no existe"


def test_trayectos_creacion_y_detalle(client):
    linea = create_line(client, 2)
    origen = create_stop(client, linea["idLinea"], 1)
    destino = create_stop(client, linea["idLinea"], 2)

    crear = client.post(
        "/trayectos/",
        json={
            "idOrigen": origen["idParada"],
            "idDestino": destino["idParada"],
            "duracionEstm": 12.5,
        },
    )

    assert crear.status_code == 201
    route_id = crear.json()["idTrayecto"]

    detalle = client.get(f"/trayectos/{route_id}")
    assert detalle.status_code == 200
    assert detalle.json()["idOrigen"] == origen["idParada"]


def test_trayecto_devuelve_400_si_paradas_no_existen(client):
    response = client.post(
        "/trayectos/",
        json={"idOrigen": 999, "idDestino": 1000, "duracionEstm": 9.0},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "La parada indicada no existe"


def test_horarios_create_normaliza_horas(client):
    response = client.post(
        "/horarios/",
        json={
            "tipoDia": "lectivo",
            "horas": ["8:5", "08:05", "09:00"],
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["tipoDia"] == "LECTIVO"
    assert payload["horas"] == ["08:05", "09:00"]


def test_horarios_devuelve_404_si_no_existe(client):
    response = client.get("/horarios/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Horario no encontrado"


def test_horarios_payload_invalido_devuelve_422(client):
    response = client.post("/horarios/", json={"tipoDia": "LECTIVO"})

    assert response.status_code == 422


def test_favoritos_crear_listar_y_borrar(client):
    crear = client.post(
        "/favoritos/",
        json={
            "usuario": "ainara",
            "contrasenia": "secret123",
            "origin_slug": "metro",
            "destination_slug": "santa-marina",
            "origin_label": "Metro",
            "destination_label": "Santa Marina",
        },
    )

    assert crear.status_code == 201
    favorito = crear.json()

    listado = client.get("/favoritos/?usuario=ainara&contrasenia=secret123")
    assert listado.status_code == 200
    assert len(listado.json()) == 1

    borrado = client.delete(
        f"/favoritos/{favorito['idFavorito']}?usuario=ainara&contrasenia=secret123"
    )
    assert borrado.status_code == 204


def test_favoritos_sin_query_devuelve_422(client):
    response = client.get("/favoritos/")

    assert response.status_code == 422


def test_favorito_no_encontrado_devuelve_404(client):
    response = client.delete("/favoritos/999?usuario=ainara&contrasenia=secret123")

    assert response.status_code == 404
    assert response.json()["detail"] == "Favorito no encontrado"


def test_error_interno_devuelve_500(client, monkeypatch):
    from app.routers import lines

    def raise_error(*_args, **_kwargs):
        raise RuntimeError("fallo en base de datos")

    monkeypatch.setattr(lines, "create", raise_error)

    response = client.post("/lineas/", json=build_line_payload(99))

    assert response.status_code == 500
    assert "Internal Server Error" in response.text
