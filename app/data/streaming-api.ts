export type StreamingPlatform =
  | "Netflix"
  | "Prime Video"
  | "Hulu"
  | "Disney+";

export type AudienceBucket =
  | "Kids"
  | "Teens"
  | "Young Adults"
  | "Adults"
  | "Family";

export type RottenTomatoesInfo = {
  rottenTomatoesLink: string;
  movieInfo: string;
  criticsConsensus: string | null;
  contentRating: string;
  directors: string[];
  authors: string[];
  actors: string[];
  originalReleaseDate: string | null;
  streamingReleaseDate: string | null;
  productionCompany: string;
  tomatometerStatus: string;
  tomatometerRating: number;
  tomatometerCount: number;
  audienceStatus: string;
  audienceRating: number;
  audienceCount: number;
  topCriticsCount: number;
  freshCriticsCount: number;
  rottenCriticsCount: number;
};

export type PlatformAvailability = {
  isAvailable: boolean;
  availablePlatforms: StreamingPlatform[];
  matchType: "title_year" | "title" | "none";
};

export type Movie = {
  id: string;
  tmdbId: number | null;
  imdbId: string | null;
  title: string;
  originalTitle: string | null;
  posterUrl: string;
  releaseYear: number | null;
  runtimeMinutes: number | null;
  genres: string[];
  ageRating: string;
  audienceBuckets: AudienceBucket[];
  audienceFocus: string;
  audienceReason: string;
  viewerVibe: string[];
  synopsis: string;
  streamingOdds: Record<StreamingPlatform, number>;
  predictedPlatforms: StreamingPlatform[];
  platformAvailability: PlatformAvailability;
  rottenTomatoes: RottenTomatoesInfo | null;
};

export type MoviesResponse = {
  data: Movie[];
  meta: {
    total: number;
    search: string;
    platform: StreamingPlatform | "All";
    limit: number;
    offset: number;
    returned: number;
    hasMore: boolean;
  };
};

export type StatsOverview = {
  data: {
    totals: {
      movies: number;
      dominantAudience: AudienceBucket;
      leadingPlatform: StreamingPlatform;
    };
    audienceStats: { bucket: AudienceBucket; count: number }[];
    genreStats: { genre: string; count: number }[];
    platformAverages: { platform: StreamingPlatform; average: number }[];
    platformProfiles: {
      platform: StreamingPlatform;
      averageScore: number;
      availableCount: number;
      candidateCount: number;
      topGenres: string[];
      topAudiences: AudienceBucket[];
      dominantRating: string;
      tendency: string;
    }[];
    model?: Record<string, unknown>;
  };
};

export type ReviewsOverview = {
  data: {
    summary: {
      averageTomatometer: number;
      averageAudience: number;
      highImpactCount: number;
    };
    acceptanceRanking: {
      id: string;
      title: string;
      posterUrl: string;
      tomatometerRating: number;
      audienceRating: number;
      combinedScore: number;
    }[];
    impactDistribution: { level: "High" | "Medium" | "Low"; count: number }[];
    criticalItems: {
      id: string;
      title: string;
      posterUrl: string;
      productionCompany: string;
      originalReleaseDate: string | null;
      consensus: string | null;
      tomatometerRating: number;
      audienceRating: number;
      criticGap: number;
      freshShare: number;
      reviewVolume: number;
      impactLevel: "High" | "Medium" | "Low";
      impactReason: string;
    }[];
  };
};

const API_BASE_URL =
  process.env.STREAMING_API_BASE_URL ??
  process.env.NEXT_PUBLIC_STREAMING_API_BASE_URL ??
  "http://127.0.0.1:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getMovies(params?: {
  search?: string;
  platform?: StreamingPlatform | "All";
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.platform) {
    searchParams.set("platform", params.platform);
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.offset) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  return apiFetch<MoviesResponse>(`/api/movies${query ? `?${query}` : ""}`);
}

export async function getMovieById(id: string) {
  return apiFetch<{ data: Movie }>(`/api/movies/${encodeURIComponent(id)}`);
}

export async function getStatsOverview() {
  return apiFetch<StatsOverview>("/api/stats/overview");
}

export async function getReviewsOverview() {
  return apiFetch<ReviewsOverview>("/api/reviews/overview");
}
