from __future__ import annotations

import math
import os
import sys
from functools import lru_cache
from typing import Any, Literal

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from data_service import StreamingDataService


Platform = Literal["Netflix", "Prime Video", "Hulu", "Disney+", "All"]


def sanitize_json(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: sanitize_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [sanitize_json(item) for item in value]
    if isinstance(value, tuple):
        return [sanitize_json(item) for item in value]
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value


@lru_cache(maxsize=1)
def get_service() -> StreamingDataService:
    return StreamingDataService()


app = FastAPI(
    title="Streaming Analytics API",
    version="1.0.0",
    description="Analisis de catalogos de streaming enriquecidos con Rotten Tomatoes.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException) -> JSONResponse:
    code = "NOT_FOUND" if exc.status_code == 404 else "API_ERROR"
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": exc.detail}},
    )


@app.get("/health")
def health() -> dict[str, Any]:
    service = get_service()
    return {
        "status": "ok",
        "movies": len(service.movies),
        "model": service.model.metrics,
    }


@app.get("/api/movies")
def list_movies(
    search: str = Query(default=""),
    platform: Platform = Query(default="All"),
    limit: int = Query(default=48, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    return sanitize_json(
        get_service().list_movies(
            search=search,
            platform=platform,
            limit=limit,
            offset=offset,
        )
    )


@app.get("/api/movies/{movie_id}")
def movie_detail(movie_id: str) -> dict[str, Any]:
    movie = get_service().movie_detail(movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return sanitize_json(movie)


@app.get("/api/stats/overview")
def stats_overview() -> dict[str, Any]:
    return sanitize_json(get_service().stats_overview())


@app.get("/api/reviews/overview")
def reviews_overview() -> dict[str, Any]:
    return sanitize_json(get_service().reviews_overview())


def run() -> None:
    port = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 8000))
    uvicorn.run("app:app", host="127.0.0.1", port=port, reload=False)


if __name__ == "__main__":
    run()
