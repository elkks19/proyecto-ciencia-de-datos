from __future__ import annotations

import math
import os
import re
import unicodedata
from collections import Counter
from dataclasses import dataclass
from html import unescape
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

import pandas as pd

try:
    from sklearn.compose import ColumnTransformer
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.impute import SimpleImputer
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OneHotEncoder

    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False


PLATFORMS = ["Netflix", "Prime Video", "Hulu", "Disney+"]
AUDIENCE_BUCKETS = ["Kids", "Teens", "Young Adults", "Adults", "Family"]
DEFAULT_MOVIE_LIMIT = int(os.environ.get("STREAMING_API_MOVIE_LIMIT", "2000"))
DEFAULT_TRAIN_LIMIT = int(os.environ.get("STREAMING_API_TRAIN_LIMIT", "5000"))
TRAIN_MODEL = os.environ.get("STREAMING_API_TRAIN_MODEL", "0") == "1"


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def normalize_text(value: Any) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def slugify(title: str, year: Any = None) -> str:
    base = normalize_text(title).replace(" ", "-")
    if year is None or pd.isna(year):
        return base or "movie"
    return f"{base}-{int(year)}"


def split_list(value: Any) -> list[str]:
    if pd.isna(value) or value == "":
        return []
    return [item.strip() for item in str(value).split(",") if item.strip()]


def safe_int(value: Any, default: int = 0) -> int:
    if value is None or pd.isna(value):
        return default
    try:
        if isinstance(value, str):
            value = re.sub(r"[^0-9.-]", "", value)
        if value == "":
            return default
        return int(float(value))
    except Exception:
        return default


def safe_float(value: Any, default: float = 0.0) -> float:
    if value is None or pd.isna(value):
        return default
    try:
        if isinstance(value, str):
            value = re.sub(r"[^0-9.-]", "", value)
        if value == "":
            return default
        return float(value)
    except Exception:
        return default


def iso_date(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None
    parsed = pd.to_datetime(value, errors="coerce")
    if pd.isna(parsed):
        return None
    return parsed.date().isoformat()


def canonical_platform(path: Path) -> str | None:
    name = normalize_text(path.stem)
    if "netflix" in name:
        return "Netflix"
    if "hulu" in name:
        return "Hulu"
    if "disney" in name:
        return "Disney+"
    if "prime" in name or "amazon" in name:
        return "Prime Video"
    return None


def candidate_data_dirs() -> list[Path]:
    root = project_root()
    return [
        root / "data",
        root / "datasets",
        root / "content" / "datasets",
        root / "cuadernos" / "content" / "datasets",
    ]


def find_csvs() -> list[Path]:
    files: list[Path] = []
    for directory in candidate_data_dirs():
        if directory.exists():
            files.extend(sorted(directory.glob("*.csv")))
    return files


def normalize_platform_columns(df: pd.DataFrame, platform: str) -> pd.DataFrame:
    renamed = {col: normalize_text(col).replace(" ", "_") for col in df.columns}
    df = df.rename(columns=renamed).copy()

    mapping = {
        "listed_in": "genres",
        "genre": "genres",
        "genres": "genres",
        "rating": "age_rating",
        "age_rating": "age_rating",
        "release_year": "release_year",
        "year": "release_year",
        "duration": "duration",
        "description": "synopsis",
        "overview": "synopsis",
        "type": "type",
        "title": "title",
        "country": "country",
        "director": "director",
        "cast": "cast",
        "date_added": "date_added",
    }

    out = pd.DataFrame()
    for source, target in mapping.items():
        if source in df.columns and target not in out.columns:
            out[target] = df[source]

    if "title" not in out.columns:
        return pd.DataFrame()

    for col in [
        "type",
        "genres",
        "age_rating",
        "release_year",
        "duration",
        "synopsis",
        "country",
        "director",
        "cast",
        "date_added",
    ]:
        if col not in out.columns:
            out[col] = None

    out["platform"] = platform
    return out


def parse_runtime_minutes(value: Any, content_type: Any = None) -> int | None:
    if pd.isna(value):
        return None
    text = str(value).lower()
    if "season" in text:
        return None
    match = re.search(r"(\d+)", text)
    if not match:
        return None
    return int(match.group(1))


def audience_buckets(age_rating: Any, genres: list[str]) -> list[str]:
    rating = str(age_rating or "").upper()
    genre_text = " ".join(genres).lower()
    buckets: set[str] = set()

    if rating in {"G", "TV-Y", "TV-G"}:
        buckets.update(["Kids", "Family"])
    elif rating in {"PG", "TV-Y7", "TV-PG"}:
        buckets.update(["Kids", "Teens", "Family"])
    elif rating in {"PG-13", "TV-14"}:
        buckets.update(["Teens", "Young Adults"])
    elif rating in {"R", "NC-17", "TV-MA"}:
        buckets.update(["Young Adults", "Adults"])
    else:
        buckets.update(["Young Adults", "Adults"])

    if any(token in genre_text for token in ["family", "kids", "animation"]):
        buckets.add("Family")
    if "children" in genre_text:
        buckets.add("Kids")
    if not buckets:
        buckets.add("Adults")
    return [bucket for bucket in AUDIENCE_BUCKETS if bucket in buckets]


def viewer_vibe(genres: list[str], synopsis: str) -> list[str]:
    if synopsis is None or pd.isna(synopsis):
        synopsis = ""
    text = " ".join(genres + [str(synopsis)]).lower()
    vibes: list[str] = []
    rules = [
        ("Cerebral", ["sci-fi", "science", "mystery", "detective"]),
        ("Familiar", ["family", "kids", "animation"]),
        ("Intensa", ["action", "thriller", "horror", "crime"]),
        ("Emotiva", ["drama", "romance"]),
        ("Ligera", ["comedy", "stand-up"]),
        ("Documental", ["documentary", "docuseries"]),
        ("Musical", ["music", "musical"]),
    ]
    for label, tokens in rules:
        if any(token in text for token in tokens):
            vibes.append(label)
    return vibes[:3] or ["General"]


def audience_focus(buckets: list[str], genres: list[str]) -> str:
    main = buckets[-1] if buckets else "Adults"
    genre = genres[0] if genres else "contenido audiovisual"
    labels = {
        "Kids": "Publico infantil y familias",
        "Teens": "Adolescentes y publico joven",
        "Young Adults": "Jovenes adultos",
        "Adults": "Audiencia adulta",
        "Family": "Familias y visionado compartido",
    }
    return f"{labels.get(main, 'Audiencia general')} con interes en {genre}"


def audience_reason(buckets: list[str], genres: list[str], rating: Any) -> str:
    genre_text = ", ".join(genres[:3]) if genres else "su propuesta narrativa"
    bucket_text = ", ".join(buckets) if buckets else "audiencia general"
    return f"Su clasificacion {rating or 'sin clasificacion'} y generos ({genre_text}) la hacen compatible con {bucket_text}."


def impact_level(gap: int, review_volume: int) -> str:
    if abs(gap) >= 25 or review_volume >= 100_000:
        return "High"
    if abs(gap) >= 10 or review_volume >= 10_000:
        return "Medium"
    return "Low"


def impact_reason(gap: int, fresh_share: int, volume: int) -> str:
    if abs(gap) >= 25:
        return "Existe una diferencia fuerte entre critica y audiencia, por lo que la recepcion puede ser polarizante."
    if fresh_share >= 80 and volume >= 10_000:
        return "La recepcion critica es alta y existe suficiente volumen de audiencia para sostener el interes."
    return "La conversacion critica tiene impacto moderado sobre la percepcion del contenido."


def pearson_correlation(xs: list[float], ys: list[float]) -> float:
    if len(xs) < 2 or len(xs) != len(ys):
        return 0.0
    mean_x = sum(xs) / len(xs)
    mean_y = sum(ys) / len(ys)
    numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    denom_x = math.sqrt(sum((x - mean_x) ** 2 for x in xs))
    denom_y = math.sqrt(sum((y - mean_y) ** 2 for y in ys))
    if not denom_x or not denom_y:
        return 0.0
    return round(numerator / (denom_x * denom_y), 2)


@dataclass
class ModelResult:
    pipeline: Any | None
    platforms: list[str]
    metrics: dict[str, Any]


class StreamingDataService:
    def __init__(self) -> None:
        self.poster_cache: dict[str, str] = {}
        self.platform_df = self._load_platform_catalogs()
        self.rt_movies = self._load_rotten_tomatoes_movies()
        self.rt_reviews = pd.DataFrame()
        self.catalog = self._build_catalog()
        self.model = self._train_model()
        self.movies = self._build_movies()

    def _load_platform_catalogs(self) -> pd.DataFrame:
        frames: list[pd.DataFrame] = []
        for path in find_csvs():
            if "rotten_tomatoes" in path.name:
                continue
            platform = canonical_platform(path)
            if platform is None:
                continue
            try:
                raw = pd.read_csv(path)
            except Exception:
                continue
            normalized = normalize_platform_columns(raw, platform)
            if not normalized.empty:
                frames.append(normalized)
        if not frames:
            return pd.DataFrame()
        df = pd.concat(frames, ignore_index=True)
        df = df.drop_duplicates(subset=["title", "platform", "release_year"], keep="first")
        df["title_key"] = df["title"].map(normalize_text)
        df["release_year"] = pd.to_numeric(df["release_year"], errors="coerce")
        df["runtime_minutes"] = [
            parse_runtime_minutes(duration, content_type)
            for duration, content_type in zip(df["duration"], df["type"])
        ]
        return df

    def _load_rotten_tomatoes_movies(self) -> pd.DataFrame:
        path = project_root() / "cuadernos" / "content" / "datasets" / "rotten_tomatoes_movies.csv"
        if not path.exists():
            return pd.DataFrame()
        usecols = [
            "rotten_tomatoes_link",
            "movie_title",
            "movie_info",
            "critics_consensus",
            "content_rating",
            "genres",
            "directors",
            "authors",
            "actors",
            "original_release_date",
            "streaming_release_date",
            "runtime",
            "production_company",
            "tomatometer_status",
            "tomatometer_rating",
            "tomatometer_count",
            "audience_status",
            "audience_rating",
            "audience_count",
            "tomatometer_top_critics_count",
            "tomatometer_fresh_critics_count",
            "tomatometer_rotten_critics_count",
        ]
        df = pd.read_csv(path, usecols=usecols)
        df["title"] = df["movie_title"]
        df["title_key"] = df["movie_title"].map(normalize_text)
        df["release_year"] = pd.to_datetime(df["original_release_date"], errors="coerce").dt.year
        df["runtime_minutes"] = pd.to_numeric(df["runtime"], errors="coerce")
        return df.drop_duplicates(subset=["title_key", "release_year"], keep="first")

    def _load_rotten_tomatoes_reviews(self) -> pd.DataFrame:
        path = project_root() / "cuadernos" / "content" / "datasets" / "rotten_tomatoes_critic_reviews.csv"
        if not path.exists():
            return pd.DataFrame()
        usecols = ["rotten_tomatoes_link", "review_type", "top_critic"]
        df = pd.read_csv(path, usecols=usecols)
        df["is_fresh"] = df["review_type"].eq("Fresh").astype(int)
        return (
            df.groupby("rotten_tomatoes_link")
            .agg(
                review_rows=("review_type", "size"),
                fresh_share=("is_fresh", "mean"),
                top_critic_share=("top_critic", "mean"),
            )
            .reset_index()
        )

    def _build_catalog(self) -> pd.DataFrame:
        if self.rt_movies.empty:
            return pd.DataFrame()

        df = self.rt_movies.copy()
        df["type"] = "Movie"
        df["age_rating"] = df["content_rating"]
        df["synopsis"] = df["movie_info"]
        df["director"] = df["directors"]
        df["cast"] = df["actors"]
        df["platform"] = None
        df["country"] = None
        df["search_text"] = [
            normalize_text(" ".join([str(title), str(genres), str(rating)]))
            for title, genres, rating in zip(df["title"], df["genres"], df["age_rating"])
        ]
        return df.copy()

    def _train_model(self) -> ModelResult:
        if not TRAIN_MODEL:
            return ModelResult(None, PLATFORMS, {"trained": False, "reason": "Rotten Tomatoes catalog with heuristic platform compatibility"})
        if self.platform_df.empty or not SKLEARN_AVAILABLE:
            return ModelResult(None, PLATFORMS, {"trained": False, "reason": "No platform datasets or sklearn unavailable"})

        df = self.catalog.dropna(subset=["platform", "title"]).copy()
        if len(df) > DEFAULT_TRAIN_LIMIT:
            df = df.sample(DEFAULT_TRAIN_LIMIT, random_state=42)
        if df["platform"].nunique() < 2 or len(df) < 20:
            return ModelResult(None, PLATFORMS, {"trained": False, "reason": "Not enough labeled platform data"})

        features = [
            "type",
            "genres",
            "age_rating",
            "release_year",
            "runtime_minutes",
            "country",
            "tomatometer_rating",
            "audience_rating",
            "tomatometer_count",
            "audience_count",
        ]
        for col in features:
            if col not in df.columns:
                df[col] = None

        X = df[features]
        y = df["platform"]
        numeric = ["release_year", "runtime_minutes", "tomatometer_rating", "audience_rating", "tomatometer_count", "audience_count"]
        categorical = ["type", "genres", "age_rating", "country"]
        preprocess = ColumnTransformer(
            transformers=[
                ("num", SimpleImputer(strategy="median"), numeric),
                ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
            ]
        )
        pipeline = Pipeline(
            [
                ("preprocess", preprocess),
                ("model", RandomForestClassifier(n_estimators=80, random_state=42, class_weight="balanced_subsample", n_jobs=-1)),
            ]
        )

        metrics: dict[str, Any] = {"trained": True}
        try:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
            pipeline.fit(X_train, y_train)
            metrics["accuracy"] = round(float(pipeline.score(X_test, y_test)), 4)
        except Exception:
            pipeline.fit(X, y)
            metrics["accuracy"] = None

        platforms = list(pipeline.named_steps["model"].classes_)
        return ModelResult(pipeline, platforms, metrics)

    def _heuristic_odds(self, row: pd.Series) -> dict[str, int]:
        genres = split_list(row.get("genres") or row.get("genres_rt"))
        genre_text = " ".join(genres).lower()
        rating = str(row.get("age_rating") or row.get("content_rating") or "").upper()
        year = safe_int(row.get("release_year"), 2000)
        runtime = safe_int(row.get("runtime_minutes") or row.get("runtime"), 100)

        scores = {
            "Netflix": 35,
            "Prime Video": 35,
            "Hulu": 35,
            "Disney+": 35,
        }

        if any(token in genre_text for token in ["kids", "family", "animation", "musical"]):
            scores["Disney+"] += 35
        if any(token in genre_text for token in ["horror", "thriller", "crime", "mystery"]):
            scores["Hulu"] += 28
        if any(token in genre_text for token in ["action", "adventure", "sci", "western"]):
            scores["Prime Video"] += 22
        if any(token in genre_text for token in ["comedy", "drama", "romance", "international"]):
            scores["Netflix"] += 22
        if rating in {"G", "PG", "TV-G", "TV-PG", "TV-Y", "TV-Y7"}:
            scores["Disney+"] += 14
        if rating in {"R", "TV-MA", "NC-17"}:
            scores["Hulu"] += 12
            scores["Prime Video"] += 8
            scores["Disney+"] -= 20
        if year >= 2015:
            scores["Netflix"] += 8
            scores["Hulu"] += 5
        if runtime >= 130:
            scores["Prime Video"] += 8

        platform = row.get("platform")
        if platform in scores:
            scores[platform] += 35

        return {platform: max(1, min(99, int(score))) for platform, score in scores.items()}

    def _model_odds(self, row: pd.Series) -> dict[str, int]:
        if self.model.pipeline is None:
            return self._heuristic_odds(row)

        features = [
            "type",
            "genres",
            "age_rating",
            "release_year",
            "runtime_minutes",
            "country",
            "tomatometer_rating",
            "audience_rating",
            "tomatometer_count",
            "audience_count",
        ]
        sample = pd.DataFrame([{col: row.get(col) for col in features}])
        try:
            probabilities = self.model.pipeline.predict_proba(sample)[0]
            odds = {platform: 1 for platform in PLATFORMS}
            for platform, probability in zip(self.model.platforms, probabilities):
                odds[platform] = max(1, min(99, int(round(probability * 100))))
            return odds
        except Exception:
            return self._heuristic_odds(row)

    def _rt_payload(self, row: pd.Series) -> dict[str, Any] | None:
        link = row.get("rotten_tomatoes_link")
        if pd.isna(link) or not link:
            return None
        return {
            "rottenTomatoesLink": f"https://www.rottentomatoes.com/{link}",
            "movieInfo": row.get("movie_info") or "",
            "criticsConsensus": row.get("critics_consensus") or "",
            "contentRating": row.get("content_rating") or row.get("age_rating") or "",
            "directors": split_list(row.get("directors") or row.get("director")),
            "authors": split_list(row.get("authors")),
            "actors": split_list(row.get("actors") or row.get("cast")),
            "originalReleaseDate": iso_date(row.get("original_release_date")),
            "streamingReleaseDate": iso_date(row.get("streaming_release_date")),
            "productionCompany": row.get("production_company") or "",
            "tomatometerStatus": row.get("tomatometer_status") or "",
            "tomatometerRating": safe_int(row.get("tomatometer_rating")),
            "tomatometerCount": safe_int(row.get("tomatometer_count")),
            "audienceStatus": row.get("audience_status") or "",
            "audienceRating": safe_int(row.get("audience_rating")),
            "audienceCount": safe_int(row.get("audience_count")),
            "topCriticsCount": safe_int(row.get("tomatometer_top_critics_count")),
            "freshCriticsCount": safe_int(row.get("tomatometer_fresh_critics_count")),
            "rottenCriticsCount": safe_int(row.get("tomatometer_rotten_critics_count")),
        }

    def _extract_rt_poster_url(self, page_html: str, page_url: str) -> str | None:
        patterns = [
            r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            r'"image"\s*:\s*"([^"]+)"',
            r'(https://resizing\.flixster\.com/[^"\'>\s]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, page_html, flags=re.IGNORECASE)
            if not match:
                continue
            candidate = unescape(match.group(1).strip())
            if candidate.startswith("//"):
                return f"https:{candidate}"
            if candidate.startswith("/"):
                return urljoin(page_url, candidate)
            if candidate.startswith("http"):
                return candidate
        return None

    def _poster_url_for_movie(self, movie: dict[str, Any]) -> str:
        poster_url = movie.get("posterUrl") or "/file.svg"
        if poster_url != "/file.svg":
            return poster_url

        rt = movie.get("rottenTomatoes") or {}
        page_url = rt.get("rottenTomatoesLink")
        if not page_url:
            return poster_url

        if page_url in self.poster_cache:
            return self.poster_cache[page_url]

        request = Request(
            page_url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        try:
            with urlopen(request, timeout=4) as response:
                page_html = response.read(400_000).decode("utf-8", errors="ignore")
        except (TimeoutError, URLError, ValueError):
            self.poster_cache[page_url] = poster_url
            return poster_url
        except Exception:
            self.poster_cache[page_url] = poster_url
            return poster_url

        resolved = self._extract_rt_poster_url(page_html, page_url) or poster_url
        self.poster_cache[page_url] = resolved
        return resolved

    def _platform_availability(self, row: pd.Series) -> dict[str, Any]:
        if self.platform_df.empty:
            return {
                "isAvailable": False,
                "availablePlatforms": [],
                "matchType": "none",
            }

        title_key = row.get("title_key") or normalize_text(row.get("title") or row.get("movie_title"))
        if not title_key:
            return {
                "isAvailable": False,
                "availablePlatforms": [],
                "matchType": "none",
            }

        title_matches = self.platform_df[self.platform_df["title_key"].eq(title_key)]
        if title_matches.empty:
            return {
                "isAvailable": False,
                "availablePlatforms": [],
                "matchType": "none",
            }

        release_year = safe_int(row.get("release_year"), 0)
        exact_matches = pd.DataFrame()
        if release_year:
            platform_years = pd.to_numeric(title_matches["release_year"], errors="coerce")
            exact_matches = title_matches[platform_years.eq(release_year)]

        matches = exact_matches if not exact_matches.empty else title_matches
        platforms = sorted(
            platform for platform in matches["platform"].dropna().unique().tolist()
            if platform in PLATFORMS
        )

        return {
            "isAvailable": bool(platforms),
            "availablePlatforms": platforms,
            "matchType": "title_year" if not exact_matches.empty else "title",
        }

    def _movie_from_row(self, row: pd.Series) -> dict[str, Any] | None:
        title = row.get("title") or row.get("movie_title")
        if not title or pd.isna(title):
            return None

        release_year = safe_int(row.get("release_year"), 0)
        movie_id = slugify(str(title), release_year if release_year else None)
        genres = split_list(row.get("genres") or row.get("genres_rt"))
        age_rating = row.get("age_rating") or row.get("content_rating") or "NR"
        synopsis = row.get("synopsis") or row.get("movie_info") or ""
        buckets = audience_buckets(age_rating, genres)
        odds = self._model_odds(row)
        predicted = sorted(PLATFORMS, key=lambda item: odds.get(item, 0), reverse=True)[:2]
        availability = self._platform_availability(row)
        rt = self._rt_payload(row)

        return {
            "id": movie_id,
            "tmdbId": None,
            "imdbId": None,
            "title": str(title),
            "originalTitle": None,
            "posterUrl": "/file.svg",
            "releaseYear": release_year or None,
            "runtimeMinutes": safe_int(row.get("runtime_minutes") or row.get("runtime"), 0) or None,
            "genres": genres,
            "ageRating": str(age_rating) if age_rating and not pd.isna(age_rating) else "NR",
            "audienceBuckets": buckets,
            "audienceFocus": audience_focus(buckets, genres),
            "audienceReason": audience_reason(buckets, genres, age_rating),
            "viewerVibe": viewer_vibe(genres, synopsis),
            "synopsis": str(synopsis) if synopsis and not pd.isna(synopsis) else "",
            "streamingOdds": odds,
            "predictedPlatforms": predicted,
            "platformAvailability": availability,
            "rottenTomatoes": rt,
        }

    def _build_movies(self) -> list[dict[str, Any]]:
        if self.catalog.empty:
            return []

        movies: list[dict[str, Any]] = []
        for _, row in self.catalog.head(DEFAULT_MOVIE_LIMIT).iterrows():
            movie = self._movie_from_row(row)
            if movie is not None:
                movies.append(movie)
        return movies

    def list_movies(
        self,
        search: str = "",
        platform: str = "All",
        limit: int = 48,
        offset: int = 0,
    ) -> dict[str, Any]:
        search_key = normalize_text(search)
        if self.catalog.empty:
            return {
                "data": [],
                "meta": {
                    "total": 0,
                    "search": search,
                    "platform": platform or "All",
                    "limit": limit,
                    "offset": offset,
                    "returned": 0,
                    "hasMore": False,
                },
            }

        df = self.catalog
        if search_key:
            df = df[df["search_text"].str.contains(search_key, regex=False, na=False)]

        if platform and platform != "All":
            filtered_rows = []
            for _, row in df.iterrows():
                availability = self._platform_availability(row)
                if platform in availability["availablePlatforms"]:
                    filtered_rows.append(row)
            df = pd.DataFrame(filtered_rows)

        total = len(df)
        start = max(0, offset)
        page_limit = max(1, min(limit, 100))
        end = start + page_limit
        page_df = df.iloc[start:end]
        page = [
            movie
            for _, row in page_df.iterrows()
            if (movie := self._movie_from_row(row)) is not None
        ]

        return {
            "data": page,
            "meta": {
                "total": total,
                "search": search,
                "platform": platform or "All",
                "limit": page_limit,
                "offset": start,
                "returned": len(page),
                "hasMore": end < total,
            },
        }

    def movie_detail(self, movie_id: str) -> dict[str, Any] | None:
        for movie in self.movies:
            if movie["id"] == movie_id:
                return {"data": movie}
        for _, row in self.catalog.iterrows():
            movie = self._movie_from_row(row)
            if movie is not None and movie["id"] == movie_id:
                return {"data": movie}
        return None

    def stats_overview(self) -> dict[str, Any]:
        audience_counter: Counter[str] = Counter()
        genre_counter: Counter[str] = Counter()
        platform_sums = {platform: [] for platform in PLATFORMS}
        platform_genres = {platform: Counter() for platform in PLATFORMS}
        platform_audiences = {platform: Counter() for platform in PLATFORMS}
        platform_ratings = {platform: Counter() for platform in PLATFORMS}
        platform_candidates = {platform: 0 for platform in PLATFORMS}
        platform_available = {platform: 0 for platform in PLATFORMS}
        reviewed_titles = 0
        tomatometer_values: list[int] = []
        audience_values: list[int] = []
        rt_platform_scores = {
            platform: {
                "tomato": [],
                "audience": [],
                "gap": [],
                "fresh": 0,
                "reviews": 0,
                "genres": Counter(),
            }
            for platform in PLATFORMS
        }

        for movie in self.movies:
            audience_counter.update(movie["audienceBuckets"])
            genre_counter.update(movie["genres"])
            available_platforms = movie["platformAvailability"]["availablePlatforms"]

            for platform, odds in movie["streamingOdds"].items():
                platform_sums[platform].append(odds)
                if platform in available_platforms:
                    platform_available[platform] += 1

            top_platform = max(
                movie["streamingOdds"],
                key=lambda item: movie["streamingOdds"].get(item, 0),
            )
            platform_candidates[top_platform] += 1
            platform_genres[top_platform].update(movie["genres"])
            platform_audiences[top_platform].update(movie["audienceBuckets"])
            platform_ratings[top_platform].update([movie["ageRating"]])

            rt = movie.get("rottenTomatoes")
            if not rt:
                continue

            tomato = safe_int(rt.get("tomatometerRating"))
            audience = safe_int(rt.get("audienceRating"))
            fresh_count = safe_int(rt.get("freshCriticsCount"))
            review_count = safe_int(rt.get("tomatometerCount"))
            reviewed_titles += 1
            tomatometer_values.append(tomato)
            audience_values.append(audience)

            for platform in available_platforms:
                rt_platform_scores[platform]["tomato"].append(tomato)
                rt_platform_scores[platform]["audience"].append(audience)
                rt_platform_scores[platform]["gap"].append(tomato - audience)
                rt_platform_scores[platform]["fresh"] += fresh_count
                rt_platform_scores[platform]["reviews"] += review_count
                rt_platform_scores[platform]["genres"].update(movie["genres"])

        dominant = audience_counter.most_common(1)[0][0] if audience_counter else "Adults"
        platform_averages = [
            {
                "platform": platform,
                "average": int(round(sum(values) / len(values))) if values else 0,
            }
            for platform, values in platform_sums.items()
        ]
        leading = max(platform_averages, key=lambda item: item["average"])["platform"] if platform_averages else "Netflix"
        platform_profiles = []
        for item in platform_averages:
            platform = item["platform"]
            genres = [genre for genre, _ in platform_genres[platform].most_common(3)]
            audiences = [bucket for bucket, _ in platform_audiences[platform].most_common(2)]
            rating = platform_ratings[platform].most_common(1)[0][0] if platform_ratings[platform] else "NR"
            if genres and audiences:
                tendency = f"Tiende a {', '.join(genres[:2])} para {', '.join(audiences)}"
            elif genres:
                tendency = f"Tiende a {', '.join(genres)}"
            else:
                tendency = "Tendencia general sin segmento dominante"
            platform_profiles.append(
                {
                    "platform": platform,
                    "averageScore": item["average"],
                    "availableCount": platform_available[platform],
                    "candidateCount": platform_candidates[platform],
                    "topGenres": genres,
                    "topAudiences": audiences,
                    "dominantRating": rating,
                    "tendency": tendency,
                }
            )

        rt_platform_profiles = []
        for platform in PLATFORMS:
            scores = rt_platform_scores[platform]
            tomato_scores = scores["tomato"]
            audience_scores = scores["audience"]
            gap_scores = scores["gap"]
            top_genres = [genre for genre, _ in scores["genres"].most_common(3)]
            average_tomato = (
                int(round(sum(tomato_scores) / len(tomato_scores)))
                if tomato_scores
                else 0
            )
            average_audience = (
                int(round(sum(audience_scores) / len(audience_scores)))
                if audience_scores
                else 0
            )
            average_gap = (
                int(round(sum(gap_scores) / len(gap_scores))) if gap_scores else 0
            )
            fresh_share = (
                int(round((scores["fresh"] / scores["reviews"]) * 100))
                if scores["reviews"]
                else 0
            )

            if average_gap >= 10:
                critical_pulse = "La critica responde mejor que la audiencia en este catalogo."
            elif average_gap <= -10:
                critical_pulse = "La audiencia responde mejor que la critica en este catalogo."
            elif average_tomato >= 75 and average_audience >= 75:
                critical_pulse = "Critica y audiencia convergen con aceptacion alta."
            else:
                critical_pulse = "Critica y audiencia se mantienen relativamente alineadas."

            rt_platform_profiles.append(
                {
                    "platform": platform,
                    "reviewedCount": len(tomato_scores),
                    "availableCount": platform_available[platform],
                    "averageTomatometer": average_tomato,
                    "averageAudience": average_audience,
                    "averageGap": average_gap,
                    "freshShare": fresh_share,
                    "topGenres": top_genres,
                    "criticalPulse": critical_pulse,
                }
            )

        top_rt_platform = max(
            rt_platform_profiles,
            key=lambda item: (
                item["averageTomatometer"],
                item["reviewedCount"],
                item["averageAudience"],
            ),
        )["platform"] if rt_platform_profiles else "Netflix"

        return {
            "data": {
                "totals": {
                    "movies": len(self.movies),
                    "dominantAudience": dominant,
                    "leadingPlatform": leading,
                    "averageTomatometer": int(round(sum(tomatometer_values) / len(tomatometer_values))) if tomatometer_values else 0,
                    "averageAudience": int(round(sum(audience_values) / len(audience_values))) if audience_values else 0,
                },
                "audienceStats": [{"bucket": bucket, "count": audience_counter.get(bucket, 0)} for bucket in AUDIENCE_BUCKETS],
                "genreStats": [{"genre": genre, "count": count} for genre, count in genre_counter.most_common(12)],
                "platformAverages": platform_averages,
                "platformProfiles": platform_profiles,
                "rottenTomatoesCross": {
                    "titlesWithReviews": reviewed_titles,
                    "topPlatformByTomatometer": top_rt_platform,
                    "platformBreakdown": rt_platform_profiles,
                },
                "model": self.model.metrics,
            }
        }

    def reviews_overview(self) -> dict[str, Any]:
        items: list[dict[str, Any]] = []
        tomatometer_values: list[int] = []
        audience_values: list[int] = []
        runtime_tomato_x: list[float] = []
        runtime_tomato_y: list[float] = []
        runtime_audience_x: list[float] = []
        runtime_audience_y: list[float] = []
        year_tomato_x: list[float] = []
        year_tomato_y: list[float] = []
        year_audience_x: list[float] = []
        year_audience_y: list[float] = []
        runtime_band_order = ["Corta", "Media", "Larga"]
        runtime_bands = {
            label: {"count": 0, "tomato": [], "audience": []}
            for label in runtime_band_order
        }
        age_profiles = {
            bucket: {"count": 0, "tomato": [], "audience": [], "runtime": []}
            for bucket in AUDIENCE_BUCKETS
        }
        year_bands: dict[str, dict[str, Any]] = {}
        actor_profiles: dict[str, dict[str, Any]] = {}

        for movie in self.movies:
            rt = movie.get("rottenTomatoes")
            if not rt:
                continue
            tomato = safe_int(rt.get("tomatometerRating"))
            audience = safe_int(rt.get("audienceRating"))
            if tomato:
                tomatometer_values.append(tomato)
            if audience:
                audience_values.append(audience)
            gap = tomato - audience
            runtime = safe_int(movie.get("runtimeMinutes"))
            release_year = safe_int(movie.get("releaseYear"))
            fresh_count = safe_int(rt.get("freshCriticsCount"))
            total_count = safe_int(rt.get("tomatometerCount"))
            fresh_share = int(round((fresh_count / total_count) * 100)) if total_count else tomato
            volume = safe_int(rt.get("audienceCount")) + safe_int(rt.get("tomatometerCount"))
            level = impact_level(gap, volume)
            poster_url = self._poster_url_for_movie(movie)

            if runtime:
                runtime_tomato_x.append(runtime)
                runtime_tomato_y.append(tomato)
                runtime_audience_x.append(runtime)
                runtime_audience_y.append(audience)
                runtime_label = "Corta" if runtime <= 100 else "Media" if runtime <= 130 else "Larga"
                runtime_bands[runtime_label]["count"] += 1
                runtime_bands[runtime_label]["tomato"].append(tomato)
                runtime_bands[runtime_label]["audience"].append(audience)

            if release_year:
                year_tomato_x.append(release_year)
                year_tomato_y.append(tomato)
                year_audience_x.append(release_year)
                year_audience_y.append(audience)
                decade = f"{(release_year // 10) * 10}s"
                if decade not in year_bands:
                    year_bands[decade] = {"count": 0, "tomato": [], "audience": []}
                year_bands[decade]["count"] += 1
                year_bands[decade]["tomato"].append(tomato)
                year_bands[decade]["audience"].append(audience)

            for bucket in movie.get("audienceBuckets", []):
                age_profiles[bucket]["count"] += 1
                age_profiles[bucket]["tomato"].append(tomato)
                age_profiles[bucket]["audience"].append(audience)
                if runtime:
                    age_profiles[bucket]["runtime"].append(runtime)

            for actor in rt.get("actors", [])[:6]:
                if actor not in actor_profiles:
                    actor_profiles[actor] = {
                        "count": 0,
                        "tomato": [],
                        "audience": [],
                        "runtime": [],
                        "latestYear": 0,
                        "titles": [],
                    }
                actor_profiles[actor]["count"] += 1
                actor_profiles[actor]["tomato"].append(tomato)
                actor_profiles[actor]["audience"].append(audience)
                if runtime:
                    actor_profiles[actor]["runtime"].append(runtime)
                if release_year:
                    actor_profiles[actor]["latestYear"] = max(
                        actor_profiles[actor]["latestYear"], release_year
                    )
                if movie["title"] not in actor_profiles[actor]["titles"]:
                    actor_profiles[actor]["titles"].append(movie["title"])

            items.append(
                {
                    "id": movie["id"],
                    "title": movie["title"],
                    "posterUrl": poster_url,
                    "productionCompany": rt.get("productionCompany") or "",
                    "originalReleaseDate": rt.get("originalReleaseDate"),
                    "consensus": rt.get("criticsConsensus") or "",
                    "tomatometerRating": tomato,
                    "audienceRating": audience,
                    "criticGap": gap,
                    "freshShare": fresh_share,
                    "reviewVolume": volume,
                    "impactLevel": level,
                    "impactReason": impact_reason(gap, fresh_share, volume),
                    "combinedScore": tomato + audience,
                    "runtimeMinutes": runtime or None,
                    "releaseYear": release_year or None,
                    "ageRating": movie.get("ageRating") or "NR",
                    "audienceBuckets": movie.get("audienceBuckets", []),
                    "actors": rt.get("actors", [])[:5],
                }
            )

        ranking = sorted(items, key=lambda item: item["combinedScore"], reverse=True)[:10]
        critical = sorted(items, key=lambda item: (item["impactLevel"] == "High", abs(item["criticGap"]), item["reviewVolume"]), reverse=True)[:20]
        distribution = Counter(item["impactLevel"] for item in items)
        actor_rows = [
            {
                "actor": actor,
                "movieCount": stats["count"],
                "averageTomatometer": int(round(sum(stats["tomato"]) / len(stats["tomato"]))) if stats["tomato"] else 0,
                "averageAudience": int(round(sum(stats["audience"]) / len(stats["audience"]))) if stats["audience"] else 0,
                "averageRuntime": int(round(sum(stats["runtime"]) / len(stats["runtime"]))) if stats["runtime"] else 0,
                "latestReleaseYear": stats["latestYear"] or None,
                "notableTitles": stats["titles"][:3],
            }
            for actor, stats in actor_profiles.items()
            if stats["count"] >= 2
        ]
        actor_rows.sort(
            key=lambda item: (
                item["averageTomatometer"],
                item["movieCount"],
                item["averageAudience"],
            ),
            reverse=True,
        )
        age_rows = [
            {
                "bucket": bucket,
                "movieCount": stats["count"],
                "averageTomatometer": int(round(sum(stats["tomato"]) / len(stats["tomato"]))) if stats["tomato"] else 0,
                "averageAudience": int(round(sum(stats["audience"]) / len(stats["audience"]))) if stats["audience"] else 0,
                "averageRuntime": int(round(sum(stats["runtime"]) / len(stats["runtime"]))) if stats["runtime"] else 0,
            }
            for bucket, stats in age_profiles.items()
            if stats["count"] > 0
        ]
        age_rows.sort(key=lambda item: (item["movieCount"], item["averageTomatometer"]), reverse=True)
        runtime_rows = [
            {
                "label": label,
                "movieCount": runtime_bands[label]["count"],
                "averageTomatometer": int(round(sum(runtime_bands[label]["tomato"]) / len(runtime_bands[label]["tomato"]))) if runtime_bands[label]["tomato"] else 0,
                "averageAudience": int(round(sum(runtime_bands[label]["audience"]) / len(runtime_bands[label]["audience"]))) if runtime_bands[label]["audience"] else 0,
            }
            for label in runtime_band_order
            if runtime_bands[label]["count"] > 0
        ]
        year_rows = [
            {
                "label": label,
                "movieCount": stats["count"],
                "averageTomatometer": int(round(sum(stats["tomato"]) / len(stats["tomato"]))) if stats["tomato"] else 0,
                "averageAudience": int(round(sum(stats["audience"]) / len(stats["audience"]))) if stats["audience"] else 0,
            }
            for label, stats in year_bands.items()
        ]
        year_rows.sort(key=lambda item: item["label"], reverse=True)

        return {
            "data": {
                "summary": {
                    "averageTomatometer": int(round(sum(tomatometer_values) / len(tomatometer_values))) if tomatometer_values else 0,
                    "averageAudience": int(round(sum(audience_values) / len(audience_values))) if audience_values else 0,
                    "highImpactCount": distribution.get("High", 0),
                    "reviewedTitles": len(items),
                },
                "correlations": {
                    "runtimeToTomatometer": pearson_correlation(runtime_tomato_x, runtime_tomato_y),
                    "runtimeToAudience": pearson_correlation(runtime_audience_x, runtime_audience_y),
                    "yearToTomatometer": pearson_correlation(year_tomato_x, year_tomato_y),
                    "yearToAudience": pearson_correlation(year_audience_x, year_audience_y),
                    "strongestActor": actor_rows[0]["actor"] if actor_rows else None,
                },
                "runtimeBands": runtime_rows,
                "yearBands": year_rows[:5],
                "ageProfiles": age_rows,
                "actorProfiles": actor_rows[:8],
                "acceptanceRanking": [
                    {
                        "id": item["id"],
                        "title": item["title"],
                        "posterUrl": item["posterUrl"],
                        "tomatometerRating": item["tomatometerRating"],
                        "audienceRating": item["audienceRating"],
                        "combinedScore": item["combinedScore"],
                    }
                    for item in ranking
                ],
                "impactDistribution": [{"level": level, "count": distribution.get(level, 0)} for level in ["High", "Medium", "Low"]],
                "criticalItems": [{key: value for key, value in item.items() if key != "combinedScore"} for item in critical],
            }
        }


SERVICE = StreamingDataService()
