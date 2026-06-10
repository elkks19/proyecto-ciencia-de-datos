# Streaming Analytics API

Servicio Python para analizar catálogos de streaming y enriquecerlos con Rotten Tomatoes.

## Datasets

El servicio busca CSVs en estas carpetas:

- `data/`
- `datasets/`
- `content/datasets/`
- `cuadernos/content/datasets/`

Para detectar plataformas, los nombres de archivo deben contener:

- `netflix`
- `hulu`
- `disney`
- `prime` o `amazon`

Los CSV de Rotten Tomatoes ya se leen desde:

- `cuadernos/content/datasets/rotten_tomatoes_movies.csv`
- `cuadernos/content/datasets/rotten_tomatoes_critic_reviews.csv`

## Ejecutar

```bash
cuadernos/venv/bin/python services/streaming_api/app.py
```

URL base:

```text
http://127.0.0.1:8000/api
```

## Endpoints

- `GET /api/movies`
- `GET /api/movies?search=arrival`
- `GET /api/movies?platform=Netflix`
- `GET /api/movies/:id`
- `GET /api/stats/overview`
- `GET /api/reviews/overview`

## Modelo

Si encuentra datasets de plataformas y `sklearn` está disponible, entrena un `RandomForestClassifier` para estimar compatibilidad con:

- Netflix
- Prime Video
- Hulu
- Disney+

Si todavía no están los datasets de plataformas, responde usando Rotten Tomatoes y una heurística de compatibilidad basada en género, clasificación, año y duración.
