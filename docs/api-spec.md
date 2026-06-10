# API Spec

## Base

- Base URL: `/api`
- Content type: `application/json`
- Movie id: `string`
- Platform values:
  - `Netflix`
  - `Prime Video`
  - `Hulu`
  - `Disney+`
- Audience bucket values:
  - `Kids`
  - `Teens`
  - `Young Adults`
  - `Adults`
  - `Family`

## 1. List Movies

- Method: `GET`
- Path: `/movies`
- Query params:
  - `search`: string
  - `platform`: `Netflix | Prime Video | Hulu | Disney+ | All`

### Response

```json
{
  "data": [
    {
      "id": "arrival-2016",
      "tmdbId": 329865,
      "imdbId": "tt2543164",
      "title": "Arrival",
      "originalTitle": null,
      "posterUrl": "https://...",
      "releaseYear": 2016,
      "runtimeMinutes": 116,
      "genres": ["Sci-Fi", "Drama", "Mystery"],
      "ageRating": "PG-13",
      "audienceBuckets": ["Young Adults", "Adults"],
      "audienceFocus": "Adultos curiosos por sci-fi reflexiva",
      "audienceReason": "Funciona mejor con personas...",
      "viewerVibe": ["Cerebral", "Atmosferica"],
      "synopsis": "A linguist is recruited...",
      "streamingOdds": {
        "Netflix": 46,
        "Prime Video": 78,
        "Hulu": 31,
        "Disney+": 8
      },
      "predictedPlatforms": ["Prime Video", "Netflix"]
    }
  ],
  "meta": {
    "total": 1,
    "search": "arrival",
    "platform": "All"
  }
}
```

## 2. Movie Detail

- Method: `GET`
- Path: `/movies/:id`

### Response

```json
{
  "data": {
    "id": "arrival-2016",
    "tmdbId": 329865,
    "imdbId": "tt2543164",
    "title": "Arrival",
    "originalTitle": null,
    "posterUrl": "https://...",
    "releaseYear": 2016,
    "runtimeMinutes": 116,
    "genres": ["Sci-Fi", "Drama", "Mystery"],
    "ageRating": "PG-13",
    "audienceBuckets": ["Young Adults", "Adults"],
    "audienceFocus": "Adultos curiosos por sci-fi reflexiva",
    "audienceReason": "Funciona mejor con personas...",
    "viewerVibe": ["Cerebral", "Atmosferica", "Conversacion post-pelicula"],
    "synopsis": "A linguist is recruited...",
    "streamingOdds": {
      "Netflix": 46,
      "Prime Video": 78,
      "Hulu": 31,
      "Disney+": 8
    },
    "predictedPlatforms": ["Prime Video", "Netflix"],
    "rottenTomatoes": {
      "rottenTomatoesLink": "https://www.rottentomatoes.com/...",
      "movieInfo": "A first-contact drama...",
      "criticsConsensus": "Arrival delivers science fiction...",
      "contentRating": "PG-13",
      "directors": ["Denis Villeneuve"],
      "authors": ["Eric Heisserer", "Ted Chiang"],
      "actors": ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
      "originalReleaseDate": "2016-11-11",
      "streamingReleaseDate": "2017-02-14",
      "productionCompany": "Paramount Pictures",
      "tomatometerStatus": "Certified Fresh",
      "tomatometerRating": 94,
      "tomatometerCount": 433,
      "audienceStatus": "Upright",
      "audienceRating": 82,
      "audienceCount": 25000,
      "topCriticsCount": 52,
      "freshCriticsCount": 407,
      "rottenCriticsCount": 26
    }
  }
}
```

## 3. Statistics Page

- Method: `GET`
- Path: `/stats/overview`

### Response

```json
{
  "data": {
    "totals": {
      "movies": 6,
      "dominantAudience": "Young Adults",
      "leadingPlatform": "Prime Video"
    },
    "audienceStats": [
      { "bucket": "Kids", "count": 2 },
      { "bucket": "Teens", "count": 3 },
      { "bucket": "Young Adults", "count": 5 },
      { "bucket": "Adults", "count": 4 },
      { "bucket": "Family", "count": 2 }
    ],
    "genreStats": [
      { "genre": "Sci-Fi", "count": 3 },
      { "genre": "Drama", "count": 2 }
    ],
    "platformAverages": [
      { "platform": "Netflix", "average": 33 },
      { "platform": "Prime Video", "average": 31 },
      { "platform": "Hulu", "average": 28 },
      { "platform": "Disney+", "average": 45 }
    ]
  }
}
```

## 4. Reviews Page

- Method: `GET`
- Path: `/reviews/overview`

### Response

```json
{
  "data": {
    "summary": {
      "averageTomatometer": 93,
      "averageAudience": 81,
      "highImpactCount": 2
    },
    "acceptanceRanking": [
      {
        "id": "the-martian-2015",
        "title": "The Martian",
        "posterUrl": "/posters/the-martian.svg",
        "tomatometerRating": 91,
        "audienceRating": 91,
        "combinedScore": 182
      }
    ],
    "impactDistribution": [
      { "level": "High", "count": 2 },
      { "level": "Medium", "count": 3 },
      { "level": "Low", "count": 1 }
    ],
    "criticalItems": [
      {
        "id": "arrival-2016",
        "title": "Arrival",
        "posterUrl": "https://...",
        "productionCompany": "Paramount Pictures",
        "originalReleaseDate": "2016-11-11",
        "consensus": "Arrival delivers science fiction...",
        "tomatometerRating": 94,
        "audienceRating": 82,
        "criticGap": 12,
        "freshShare": 94,
        "reviewVolume": 25433,
        "impactLevel": "Medium",
        "impactReason": "La conversacion critica puede mover la percepcion..."
      }
    ]
  }
}
```

## 5. Error Shape

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Movie not found"
  }
}
```

## Notes

- `posterUrl` can be remote or local.
- `impactLevel` allowed values:
  - `High`
  - `Medium`
  - `Low`
- Ratings should be integers from `0` to `100`.
- Counts should be integers `>= 0`.
- Dates should use ISO `YYYY-MM-DD`.
