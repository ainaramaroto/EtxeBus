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


def create_route(client, origin_id: int, destination_id: int, duration: float = 10.0) -> dict:
    response = client.post(
        "/trayectos/",
        json={
            "idOrigen": origin_id,
            "idDestino": destination_id,
            "duracionEstm": duration,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "microservicioTransporte",
    }


def test_root_endpoint(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "service": "microservicioTransporte",
        "status": "ok",
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


def test_lineas_update_y_delete(client):
    creada = create_line(client, 11)

    update_response = client.put(
        f"/lineas/{creada['idLinea']}",
        json={
            "nomLinea": "Linea 11 actualizada",
            "subtitle": "Servicio actualizado",
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["nomLinea"] == "Linea 11 actualizada"

    empty_update = client.put(f"/lineas/{creada['idLinea']}", json={})
    assert empty_update.status_code == 200
    assert empty_update.json()["idLinea"] == creada["idLinea"]

    delete_response = client.delete(f"/lineas/{creada['idLinea']}")
    assert delete_response.status_code == 204

    detail_after_delete = client.get(f"/lineas/{creada['idLinea']}")
    assert detail_after_delete.status_code == 404


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


def test_paradas_listado_filtrado_update_y_delete(client):
    line_a = create_line(client, 21)
    line_b = create_line(client, 22)
    stop_a1 = create_stop(client, line_a["idLinea"], 1)
    stop_a2 = create_stop(client, line_a["idLinea"], 2)
    stop_b1 = create_stop(client, line_b["idLinea"], 1)

    list_all = client.get("/paradas/")
    assert list_all.status_code == 200
    assert len(list_all.json()) == 3

    list_filtered = client.get(f"/paradas/?line_id={line_a['idLinea']}")
    assert list_filtered.status_code == 200
    assert len(list_filtered.json()) == 2

    detail = client.get(f"/paradas/{stop_a1['idParada']}")
    assert detail.status_code == 200
    assert detail.json()["idLinea"] == line_a["idLinea"]

    update_response = client.put(
        f"/paradas/{stop_a2['idParada']}",
        json={
            "nombre": "Parada A2 actualizada",
            "idLinea": line_b["idLinea"],
            "orden": 5,
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["nombre"] == "Parada A2 actualizada"
    assert update_response.json()["idLinea"] == line_b["idLinea"]

    empty_update = client.put(f"/paradas/{stop_b1['idParada']}", json={})
    assert empty_update.status_code == 200
    assert empty_update.json()["idParada"] == stop_b1["idParada"]

    delete_response = client.delete(f"/paradas/{stop_b1['idParada']}")
    assert delete_response.status_code == 204

    detail_after_delete = client.get(f"/paradas/{stop_b1['idParada']}")
    assert detail_after_delete.status_code == 404


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


def test_trayectos_listado_update_y_delete(client):
    linea = create_line(client, 31)
    stop_1 = create_stop(client, linea["idLinea"], 1)
    stop_2 = create_stop(client, linea["idLinea"], 2)
    stop_3 = create_stop(client, linea["idLinea"], 3)
    route = create_route(client, stop_1["idParada"], stop_2["idParada"], 12.0)

    list_response = client.get("/trayectos/")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    update_response = client.put(
        f"/trayectos/{route['idTrayecto']}",
        json={
            "idDestino": stop_3["idParada"],
            "duracionEstm": 14.5,
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["idDestino"] == stop_3["idParada"]
    assert update_response.json()["duracionEstm"] == 14.5

    empty_update = client.put(f"/trayectos/{route['idTrayecto']}", json={})
    assert empty_update.status_code == 200
    assert empty_update.json()["idTrayecto"] == route["idTrayecto"]

    delete_response = client.delete(f"/trayectos/{route['idTrayecto']}")
    assert delete_response.status_code == 204

    detail_after_delete = client.get(f"/trayectos/{route['idTrayecto']}")
    assert detail_after_delete.status_code == 404


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


def test_trayectos_paradas_crud_y_filtros(client):
    linea = create_line(client, 41)
    stop_1 = create_stop(client, linea["idLinea"], 1)
    stop_2 = create_stop(client, linea["idLinea"], 2)
    stop_3 = create_stop(client, linea["idLinea"], 3)
    route_1 = create_route(client, stop_1["idParada"], stop_2["idParada"], 8.0)
    route_2 = create_route(client, stop_2["idParada"], stop_3["idParada"], 9.0)

    create_response = client.post(
        "/trayectos-paradas/",
        json={
            "idTrayecto": route_1["idTrayecto"],
            "idParada": stop_1["idParada"],
            "orden": 1,
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["idTrayecto"] == route_1["idTrayecto"]

    list_all = client.get("/trayectos-paradas/")
    assert list_all.status_code == 200
    assert len(list_all.json()) == 1

    list_by_route = client.get(f"/trayectos-paradas/?route_id={route_1['idTrayecto']}")
    assert list_by_route.status_code == 200
    assert len(list_by_route.json()) == 1

    list_by_stop = client.get(f"/trayectos-paradas/?stop_id={stop_1['idParada']}")
    assert list_by_stop.status_code == 200
    assert len(list_by_stop.json()) == 1

    detail = client.get(f"/trayectos-paradas/{route_1['idTrayecto']}/{stop_1['idParada']}")
    assert detail.status_code == 200
    assert detail.json()["orden"] == 1

    update_same_keys = client.put(
        f"/trayectos-paradas/{route_1['idTrayecto']}/{stop_1['idParada']}",
        json={"orden": 2},
    )
    assert update_same_keys.status_code == 200
    assert update_same_keys.json()["orden"] == 2

    update_change_stop = client.put(
        f"/trayectos-paradas/{route_1['idTrayecto']}/{stop_1['idParada']}",
        json={"idParada": stop_2["idParada"]},
    )
    assert update_change_stop.status_code == 200
    assert update_change_stop.json()["idParada"] == stop_2["idParada"]

    update_change_route = client.put(
        f"/trayectos-paradas/{route_1['idTrayecto']}/{stop_2['idParada']}",
        json={"idTrayecto": route_2["idTrayecto"]},
    )
    assert update_change_route.status_code == 200
    assert update_change_route.json()["idTrayecto"] == route_2["idTrayecto"]

    delete_response = client.delete(f"/trayectos-paradas/{route_2['idTrayecto']}/{stop_2['idParada']}")
    assert delete_response.status_code == 204

    detail_after_delete = client.get(f"/trayectos-paradas/{route_2['idTrayecto']}/{stop_2['idParada']}")
    assert detail_after_delete.status_code == 404


def test_trayectos_paradas_errores_400_y_404(client):
    linea = create_line(client, 42)
    stop_1 = create_stop(client, linea["idLinea"], 1)

    create_with_invalid_route = client.post(
        "/trayectos-paradas/",
        json={
            "idTrayecto": 999,
            "idParada": stop_1["idParada"],
            "orden": 1,
        },
    )
    assert create_with_invalid_route.status_code == 400
    assert create_with_invalid_route.json()["detail"] == "El trayecto indicado no existe"

    detail_missing = client.get("/trayectos-paradas/999/999")
    assert detail_missing.status_code == 404
    assert detail_missing.json()["detail"] == "Relacion no encontrada"


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


def test_favoritos_duplicado_reutiliza_registro_existente(client):
    payload = {
        "usuario": "ainara",
        "contrasenia": "secret123",
        "origin_slug": "metro",
        "destination_slug": "boquete",
        "origin_label": "Metro",
        "destination_label": "Boquete",
    }
    first = client.post("/favoritos/", json=payload)
    second = client.post("/favoritos/", json=payload)

    assert first.status_code == 201
    assert second.status_code == 201
    assert second.json()["idFavorito"] == first.json()["idFavorito"]


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
