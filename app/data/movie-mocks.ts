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

export type MovieMock = {
  id: string;
  tmdbId: number;
  imdbId: string;
  title: string;
  originalTitle?: string;
  posterUrl: string;
  releaseYear: number;
  runtimeMinutes: number;
  genres: string[];
  ageRating: string;
  audienceBuckets: AudienceBucket[];
  audienceFocus: string;
  audienceReason: string;
  viewerVibe: string[];
  synopsis: string;
  streamingOdds: Record<StreamingPlatform, number>;
  predictedPlatforms: StreamingPlatform[];
  rottenTomatoes: {
    rottenTomatoesLink: string;
    movieInfo: string;
    criticsConsensus: string;
    contentRating: string;
    directors: string[];
    authors: string[];
    actors: string[];
    originalReleaseDate: string;
    streamingReleaseDate: string;
    productionCompany: string;
    tomatometerStatus: "Fresh" | "Certified Fresh" | "Rotten";
    tomatometerRating: number;
    tomatometerCount: number;
    audienceStatus: "Upright" | "Spilled";
    audienceRating: number;
    audienceCount: number;
    topCriticsCount: number;
    freshCriticsCount: number;
    rottenCriticsCount: number;
  };
};

export const MOVIE_MOCKS: MovieMock[] = [
  {
    id: "arrival-2016",
    tmdbId: 329865,
    imdbId: "tt2543164",
    title: "Arrival",
    posterUrl: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    releaseYear: 2016,
    runtimeMinutes: 116,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    ageRating: "PG-13",
    audienceBuckets: ["Young Adults", "Adults"],
    audienceFocus: "Adultos curiosos por sci-fi reflexiva",
    audienceReason:
      "Funciona mejor con personas que disfrutan tension lenta, lenguaje visual y temas filosoficos.",
    viewerVibe: ["Cerebral", "Atmosferica", "Conversacion post-pelicula"],
    synopsis:
      "A linguist is recruited to decode extraterrestrial communication while global tension escalates.",
    streamingOdds: {
      Netflix: 46,
      "Prime Video": 78,
      Hulu: 31,
      "Disney+": 8,
    },
    predictedPlatforms: ["Prime Video", "Netflix"],
    rottenTomatoes: {
      rottenTomatoesLink: "https://www.rottentomatoes.com/m/arrival_2016",
      movieInfo:
        "A first-contact drama built on language, grief and global uncertainty.",
      criticsConsensus:
        "Arrival delivers science fiction with emotional intelligence and unusual depth.",
      contentRating: "PG-13",
      directors: ["Denis Villeneuve"],
      authors: ["Eric Heisserer", "Ted Chiang"],
      actors: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
      originalReleaseDate: "2016-11-11",
      streamingReleaseDate: "2017-02-14",
      productionCompany: "Paramount Pictures",
      tomatometerStatus: "Certified Fresh",
      tomatometerRating: 94,
      tomatometerCount: 433,
      audienceStatus: "Upright",
      audienceRating: 82,
      audienceCount: 25000,
      topCriticsCount: 52,
      freshCriticsCount: 407,
      rottenCriticsCount: 26,
    },
  },
  {
    id: "encanto-2021",
    tmdbId: 568124,
    imdbId: "tt2953050",
    title: "Encanto",
    posterUrl: "https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg",
    releaseYear: 2021,
    runtimeMinutes: 102,
    genres: ["Animation", "Family", "Fantasy"],
    ageRating: "PG",
    audienceBuckets: ["Kids", "Family", "Teens"],
    audienceFocus: "Familias y publico joven que busca algo calido",
    audienceReason:
      "Su musicalidad, humor y conflicto familiar conectan mejor con visionado compartido.",
    viewerVibe: ["Colorida", "Musical", "Afectiva"],
    synopsis:
      "A magical Colombian family faces a quiet crisis when the only ordinary daughter becomes their last hope.",
    streamingOdds: {
      Netflix: 6,
      "Prime Video": 18,
      Hulu: 12,
      "Disney+": 96,
    },
    predictedPlatforms: ["Disney+"],
    rottenTomatoes: {
      rottenTomatoesLink: "https://www.rottentomatoes.com/m/encanto",
      movieInfo:
        "An animated family musical about pressure, gifts and belonging inside a magical house.",
      criticsConsensus:
        "Encanto charms with color, music and a generous emotional core.",
      contentRating: "PG",
      directors: ["Jared Bush", "Byron Howard"],
      authors: ["Jared Bush", "Charise Castro Smith"],
      actors: ["Stephanie Beatriz", "María Cecilia Botero", "John Leguizamo"],
      originalReleaseDate: "2021-11-24",
      streamingReleaseDate: "2021-12-24",
      productionCompany: "Walt Disney Animation Studios",
      tomatometerStatus: "Fresh",
      tomatometerRating: 91,
      tomatometerCount: 279,
      audienceStatus: "Upright",
      audienceRating: 93,
      audienceCount: 5000,
      topCriticsCount: 42,
      freshCriticsCount: 254,
      rottenCriticsCount: 25,
    },
  },
  {
    id: "glass-onion-2022",
    tmdbId: 661374,
    imdbId: "tt11564570",
    title: "Glass Onion",
    originalTitle: "Glass Onion: A Knives Out Mystery",
    posterUrl: "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg",
    releaseYear: 2022,
    runtimeMinutes: 139,
    genres: ["Mystery", "Comedy", "Crime"],
    ageRating: "PG-13",
    audienceBuckets: ["Young Adults", "Adults"],
    audienceFocus: "Publico que disfruta misterio pop y dialogo filoso",
    audienceReason:
      "La experiencia gana fuerza con espectadores que siguen pistas y disfrutan satira social.",
    viewerVibe: ["Ingeniosa", "Ensamble", "Fiesta de sospechosos"],
    synopsis:
      "A flamboyant tech billionaire invites guests to a private island where a murder game turns real.",
    streamingOdds: {
      Netflix: 97,
      "Prime Video": 5,
      Hulu: 4,
      "Disney+": 1,
    },
    predictedPlatforms: ["Netflix"],
    rottenTomatoes: {
      rottenTomatoesLink:
        "https://www.rottentomatoes.com/m/glass_onion_a_knives_out_mystery",
      movieInfo:
        "A glossy whodunit with celebrity satire, puzzles and an island full of suspects.",
      criticsConsensus:
        "Glass Onion doubles down on the original's strengths with sharp ensemble energy.",
      contentRating: "PG-13",
      directors: ["Rian Johnson"],
      authors: ["Rian Johnson"],
      actors: ["Daniel Craig", "Janelle Monáe", "Edward Norton"],
      originalReleaseDate: "2022-11-23",
      streamingReleaseDate: "2022-12-23",
      productionCompany: "T-Street",
      tomatometerStatus: "Certified Fresh",
      tomatometerRating: 92,
      tomatometerCount: 420,
      audienceStatus: "Upright",
      audienceRating: 76,
      audienceCount: 2500,
      topCriticsCount: 53,
      freshCriticsCount: 386,
      rottenCriticsCount: 34,
    },
  },
  {
    id: "prey-2022",
    tmdbId: 766507,
    imdbId: "tt11866324",
    title: "Prey",
    posterUrl: "https://image.tmdb.org/t/p/w500/ujr5pztc1oitbe7ViMUOilFaJ7s.jpg",
    releaseYear: 2022,
    runtimeMinutes: 100,
    genres: ["Action", "Thriller", "Sci-Fi"],
    ageRating: "R",
    audienceBuckets: ["Young Adults", "Adults"],
    audienceFocus: "Fans de accion directa y tension de supervivencia",
    audienceReason:
      "Tiene una lectura fisica y feroz que conecta mejor con publico que quiere intensidad inmediata.",
    viewerVibe: ["Fisica", "Tensa", "Supervivencia"],
    synopsis:
      "A skilled Comanche hunter faces a highly advanced predator in the northern plains.",
    streamingOdds: {
      Netflix: 9,
      "Prime Video": 11,
      Hulu: 93,
      "Disney+": 27,
    },
    predictedPlatforms: ["Hulu"],
    rottenTomatoes: {
      rottenTomatoesLink: "https://www.rottentomatoes.com/m/prey_2022",
      movieInfo:
        "A stripped-down franchise survival thriller anchored by a hunter facing an alien predator.",
      criticsConsensus:
        "Prey revitalizes the franchise with clear action and a strong central perspective.",
      contentRating: "R",
      directors: ["Dan Trachtenberg"],
      authors: ["Patrick Aison"],
      actors: ["Amber Midthunder", "Dakota Beavers", "Dane DiLiegro"],
      originalReleaseDate: "2022-08-05",
      streamingReleaseDate: "2022-08-05",
      productionCompany: "20th Century Studios",
      tomatometerStatus: "Certified Fresh",
      tomatometerRating: 94,
      tomatometerCount: 289,
      audienceStatus: "Upright",
      audienceRating: 74,
      audienceCount: 2500,
      topCriticsCount: 48,
      freshCriticsCount: 272,
      rottenCriticsCount: 17,
    },
  },
  {
    id: "the-martian-2015",
    tmdbId: 286217,
    imdbId: "tt3659388",
    title: "The Martian",
    posterUrl: "/posters/the-martian.svg",
    releaseYear: 2015,
    runtimeMinutes: 144,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    ageRating: "PG-13",
    audienceBuckets: ["Teens", "Young Adults", "Adults"],
    audienceFocus: "Audiencia amplia con gusto por ciencia accesible",
    audienceReason:
      "Combina humor, supervivencia y ciencia popular, por eso funciona con jovenes y adultos.",
    viewerVibe: ["Ingeniosa", "Optimista", "Aventura cientifica"],
    synopsis:
      "An astronaut stranded on Mars survives through science, improvisation and a global rescue effort.",
    streamingOdds: {
      Netflix: 38,
      "Prime Video": 69,
      Hulu: 21,
      "Disney+": 42,
    },
    predictedPlatforms: ["Prime Video", "Disney+"],
    rottenTomatoes: {
      rottenTomatoesLink: "https://www.rottentomatoes.com/m/the_martian",
      movieInfo:
        "A science-driven survival story about ingenuity, isolation and rescue on Mars.",
      criticsConsensus:
        "The Martian balances scientific problem solving with broad crowd-pleasing adventure.",
      contentRating: "PG-13",
      directors: ["Ridley Scott"],
      authors: ["Drew Goddard", "Andy Weir"],
      actors: ["Matt Damon", "Jessica Chastain", "Chiwetel Ejiofor"],
      originalReleaseDate: "2015-10-02",
      streamingReleaseDate: "2016-01-12",
      productionCompany: "20th Century Fox",
      tomatometerStatus: "Certified Fresh",
      tomatometerRating: 91,
      tomatometerCount: 315,
      audienceStatus: "Upright",
      audienceRating: 91,
      audienceCount: 50000,
      topCriticsCount: 47,
      freshCriticsCount: 286,
      rottenCriticsCount: 29,
    },
  },
  {
    id: "turning-red-2022",
    tmdbId: 508947,
    imdbId: "tt8097030",
    title: "Turning Red",
    posterUrl: "https://image.tmdb.org/t/p/w500/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg",
    releaseYear: 2022,
    runtimeMinutes: 100,
    genres: ["Animation", "Comedy", "Coming-of-Age"],
    ageRating: "PG",
    audienceBuckets: ["Kids", "Family", "Teens"],
    audienceFocus: "Preteens, teens y familias con sensibilidad coming-of-age",
    audienceReason:
      "Habla de identidad, verguenza y amistad desde un tono veloz que engancha a publico joven.",
    viewerVibe: ["Energica", "Emocional", "Caotica en buen sentido"],
    synopsis:
      "A confident thirteen-year-old transforms into a giant red panda whenever her emotions spike.",
    streamingOdds: {
      Netflix: 3,
      "Prime Video": 8,
      Hulu: 6,
      "Disney+": 98,
    },
    predictedPlatforms: ["Disney+"],
    rottenTomatoes: {
      rottenTomatoesLink: "https://www.rottentomatoes.com/m/turning_red",
      movieInfo:
        "A fast, emotional coming-of-age comedy about family expectations and adolescent chaos.",
      criticsConsensus:
        "Turning Red's specificity and energy give Pixar one of its liveliest recent entries.",
      contentRating: "PG",
      directors: ["Domee Shi"],
      authors: ["Julia Cho", "Domee Shi"],
      actors: ["Rosalie Chiang", "Sandra Oh", "Ava Morse"],
      originalReleaseDate: "2022-03-11",
      streamingReleaseDate: "2022-03-11",
      productionCompany: "Pixar Animation Studios",
      tomatometerStatus: "Certified Fresh",
      tomatometerRating: 95,
      tomatometerCount: 289,
      audienceStatus: "Upright",
      audienceRating: 67,
      audienceCount: 2500,
      topCriticsCount: 45,
      freshCriticsCount: 274,
      rottenCriticsCount: 15,
    },
  },
];

export function getMovieById(id: string) {
  return MOVIE_MOCKS.find((movie) => movie.id === id);
}

export function getAudienceStats() {
  const order: AudienceBucket[] = [
    "Kids",
    "Teens",
    "Young Adults",
    "Adults",
    "Family",
  ];

  return order.map((bucket) => ({
    bucket,
    count: MOVIE_MOCKS.filter((movie) => movie.audienceBuckets.includes(bucket))
      .length,
  }));
}

export function getGenreStats() {
  const genreMap = new Map<string, number>();

  for (const movie of MOVIE_MOCKS) {
    for (const genre of movie.genres) {
      genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
    }
  }

  return [...genreMap.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((left, right) => right.count - left.count);
}

export function getPlatformAverages() {
  const platforms: StreamingPlatform[] = [
    "Netflix",
    "Prime Video",
    "Hulu",
    "Disney+",
  ];

  return platforms.map((platform) => ({
    platform,
    average: Math.round(
      MOVIE_MOCKS.reduce((sum, movie) => sum + movie.streamingOdds[platform], 0) /
        MOVIE_MOCKS.length
    ),
  }));
}

export function getCriticalImpactStats() {
  return MOVIE_MOCKS.map((movie) => {
    const criticGap =
      movie.rottenTomatoes.tomatometerRating -
      movie.rottenTomatoes.audienceRating;
    const reviewVolume =
      movie.rottenTomatoes.tomatometerCount +
      movie.rottenTomatoes.audienceCount;
    const freshShare = Math.round(
      (movie.rottenTomatoes.freshCriticsCount /
        Math.max(movie.rottenTomatoes.tomatometerCount, 1)) *
        100
    );

    let impactLevel: "Low" | "Medium" | "High" = "Low";
    let impactReason =
      "La recepcion critica no deberia alterar demasiado la disposicion del publico.";

    if (
      movie.rottenTomatoes.tomatometerRating < 75 ||
      Math.abs(criticGap) >= 20 ||
      movie.rottenTomatoes.rottenCriticsCount >= 40
    ) {
      impactLevel = "High";
      impactReason =
        "Hay suficiente friccion entre critica, audiencia o volumen negativo para afectar conversion o percepcion.";
    } else if (
      movie.rottenTomatoes.tomatometerRating < 85 ||
      Math.abs(criticGap) >= 10 ||
      movie.rottenTomatoes.topCriticsCount >= 45
    ) {
      impactLevel = "Medium";
      impactReason =
        "La conversacion critica puede mover la percepcion, sobre todo en usuarios que comparan reseñas antes de ver.";
    }

    return {
      id: movie.id,
      title: movie.title,
      tomatometerRating: movie.rottenTomatoes.tomatometerRating,
      audienceRating: movie.rottenTomatoes.audienceRating,
      criticGap,
      reviewVolume,
      freshShare,
      impactLevel,
      impactReason,
      consensus: movie.rottenTomatoes.criticsConsensus,
      status: movie.rottenTomatoes.tomatometerStatus,
    };
  }).sort((left, right) => {
    const rank = { High: 3, Medium: 2, Low: 1 };
    return rank[right.impactLevel] - rank[left.impactLevel];
  });
}
