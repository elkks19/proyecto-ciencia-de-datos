import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@heroui/react";

import { AppShellNav } from "../../components/app-shell-nav";
import { getMovieById, type Movie } from "../../data/streaming-api";

type MoviePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const platformStyles: Record<string, string> = {
  Netflix: "bg-[#E50914] text-white",
  "Prime Video": "bg-[#00A8E1] text-slate-950",
  Hulu: "bg-[#1CE783] text-slate-950",
  "Disney+": "bg-[#113CCF] text-white",
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  let movie: Movie;

  try {
    const response = await getMovieById(id);
    movie = response.data;
  } catch {
    notFound();
  }

  const alternativeOdds = Object.entries(movie.streamingOdds).filter(
    ([platform]) =>
      !movie.platformAvailability.availablePlatforms.includes(
        platform as keyof typeof movie.streamingOdds
      )
  );
  const visibleOdds = alternativeOdds.length
    ? alternativeOdds
    : Object.entries(movie.streamingOdds);

  return (
    <main className="cinema-bg min-h-screen">
      <AppShellNav current="catalogo" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="warm-card warm-reveal relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#3A3C45]">
            <Image
              src={movie.posterUrl}
              alt={`Poster de ${movie.title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover"
            />
          </div>

          <Link
            href="/"
            className="warm-panel inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#3A3C45] bg-[#17181E] px-4 text-sm font-medium text-[#F3EBDD] transition hover:border-[#D8B26D]"
          >
            Volver al listado
          </Link>
        </div>

        <section className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
            {movie.title}
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.24em] text-[#7F7A71]">
            {movie.releaseYear ?? "S/A"} /{" "}
            {movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "S/D"} /{" "}
            {movie.ageRating}
          </p>

          <p className="mt-6 max-w-3xl text-base leading-8 text-[#C8C2B8]">
            {movie.synopsis}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <Chip
                key={genre}
                variant="soft"
                className="rounded-full border border-[#3A3C45] bg-[#111217] px-3 text-[#D2CDC2]"
              >
                {genre}
              </Chip>
            ))}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="warm-card rounded-[1.5rem] border border-[#3A3C45] bg-[#111217] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7F7A71]">
                Publico sugerido
              </p>
              <p className="mt-3 text-xl font-semibold text-[#F3EBDD]">
                {movie.audienceFocus}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#B5B0A6]">
                {movie.audienceReason}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.audienceBuckets.map((bucket) => (
                  <Chip
                    key={bucket}
                    className="rounded-full border border-[#584E40] bg-[#201D18] px-3 text-[#D9C393]"
                  >
                    {bucket}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="warm-card rounded-[1.5rem] border border-[#3A3C45] bg-[#111217] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7F7A71]">
                Disponibilidad
              </p>
              {movie.platformAvailability.isAvailable ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-7 text-[#B5B0A6]">
                    Se encontro una coincidencia en los catalogos de plataformas
                    usando{" "}
                    {movie.platformAvailability.matchType === "title_year"
                      ? "titulo y anio de estreno"
                      : "titulo"}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {movie.platformAvailability.availablePlatforms.map((platform) => (
                      <Chip
                        key={platform}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${platformStyles[platform]}`}
                      >
                        {platform}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-7 text-[#B5B0A6]">
                    No aparece en los catalogos analizados. Esta es la
                    compatibilidad estimada para decidir en que plataforma
                    podria publicarse.
                  </p>
                </div>
              )}

              <div className="mt-5 space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                  Compatibilidad estimada
                </p>
                {visibleOdds.map(([platform, score]) => (
                  <div key={platform} className="space-y-1">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#B5B0A6]">
                      <span>{platform}</span>
                      <span>{score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#17181E]">
                      <div
                        className={`warm-bar-fill h-2 rounded-full ${platformStyles[platform].split(" ")[0]}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="warm-card mt-4 rounded-[1.5rem] border border-[#3A3C45] bg-[#111217] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7F7A71]">
              Tono de experiencia
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.viewerVibe.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#584E40] px-3 py-2 text-sm text-[#D9C393]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {movie.rottenTomatoes ? (
            <div className="warm-card mt-4 rounded-[1.5rem] border border-[#3A3C45] bg-[#111217] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7F7A71]">
                  Rotten Tomatoes
                </p>
                <a
                  href={movie.rottenTomatoes.rottenTomatoesLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#3A3C45] px-3 text-xs font-medium text-[#F3EBDD] transition hover:border-[#B9A57A]"
                >
                  Abrir fuente
                </a>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#17181E] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Tomatometer
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {movie.rottenTomatoes.tomatometerRating}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#17181E] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Audiencia
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {movie.rottenTomatoes.audienceRating}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#17181E] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Criticas
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {movie.rottenTomatoes.tomatometerCount}
                  </p>
                </div>
              </div>
              {movie.rottenTomatoes.criticsConsensus ? (
                <p className="mt-4 text-sm leading-7 text-[#B5B0A6]">
                  {movie.rottenTomatoes.criticsConsensus}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
