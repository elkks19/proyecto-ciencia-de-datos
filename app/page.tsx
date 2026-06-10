import { MovieDashboard } from "./components/movie-dashboard";
import { getMovies } from "./data/streaming-api";

export default async function Home() {
  const movies = await getMovies({ limit: 48, offset: 0 });

  return (
    <main className="min-h-screen bg-[#160f0d]">
      <MovieDashboard initialMovies={movies.data} initialMeta={movies.meta} />
    </main>
  );
}
