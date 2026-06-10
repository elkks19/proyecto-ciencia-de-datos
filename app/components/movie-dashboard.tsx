"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, Chip } from "@heroui/react";

import {
  MOVIE_MOCKS,
  type MovieMock,
  type StreamingPlatform,
} from "../data/movie-mocks";
import { AppShellNav } from "./app-shell-nav";

const PLATFORMS: StreamingPlatform[] = [
  "Netflix",
  "Prime Video",
  "Hulu",
  "Disney+",
];

const PLATFORM_STYLES: Record<StreamingPlatform, string> = {
  Netflix: "bg-[#E50914] text-white",
  "Prime Video": "bg-[#00A8E1] text-slate-950",
  Hulu: "bg-[#1CE783] text-slate-950",
  "Disney+": "bg-[#113CCF] text-white",
};

function matchMovie(movie: MovieMock, query: string, activePlatform: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const text =
    `${movie.title} ${movie.originalTitle ?? ""} ${movie.genres.join(" ")} ${movie.audienceBuckets.join(" ")}`.toLowerCase();

  const matchesQuery =
    normalizedQuery.length === 0 || text.includes(normalizedQuery);
  const matchesPlatform =
    activePlatform === "All" ||
    movie.predictedPlatforms.includes(activePlatform as StreamingPlatform);

  return matchesQuery && matchesPlatform;
}

export function MovieDashboard() {
  const [query, setQuery] = useState("");
  const [activePlatform, setActivePlatform] = useState<
    StreamingPlatform | "All"
  >("All");

  const filteredMovies = useMemo(
    () => MOVIE_MOCKS.filter((movie) => matchMovie(movie, query, activePlatform)),
    [query, activePlatform]
  );

  return (
    <div className="min-h-screen bg-[#111217]">
      <AppShellNav current="catalogo" />

      <div className="flex w-full flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-[#3A3C45] bg-[#17181E] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 p-6 sm:p-8">
              <Chip className="w-fit rounded-full border border-[#584E40] bg-[#201D18] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#D9C393]">
                Curated for discovery
              </Chip>
              <div className="max-w-4xl space-y-3">
                <h2 className="text-4xl font-semibold leading-[0.92] tracking-[-0.07em] text-[#F3EBDD] sm:text-5xl">
                  Elige una pelicula como si estuvieras leyendo una mesa de programacion.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-[#B5B0A6] sm:text-base">
                  El catalogo ocupa toda la pantalla para que la exploracion se
                  sienta amplia. La lectura estadistica vive en una pagina
                  aparte para no mezclar descubrimiento con analitica.
                </p>
              </div>
            </div>

            <div className="border-t border-[#3A3C45] bg-[#111217] p-6 xl:border-l xl:border-t-0">
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <div className="border-b border-dashed border-[#3A3C45] pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                    Catalogo visible
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
                    {filteredMovies.length}
                  </p>
                </div>
                <div className="border-b border-dashed border-[#3A3C45] pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                    Modo de uso
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#F3EBDD]">
                    Explorar primero
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                    Siguiente paso
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#B5B0A6]">
                    Abre `Estadisticas` para ver distribucion de audiencias,
                    generos dominantes y fuerza por plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <input
            aria-label="Buscar pelicula"
            placeholder="Busca por titulo, genero o tipo de audiencia"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-[#3A3C45] bg-[#111217] px-4 text-sm text-[#F3EBDD] outline-none transition focus:border-[#B9A57A]"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              radius="full"
              variant={activePlatform === "All" ? "solid" : "ghost"}
              className={
                activePlatform === "All"
                  ? "bg-[#F3EBDD] text-[#17181E]"
                  : "border border-[#3A3C45] bg-[#111217] text-[#D2CDC2]"
              }
              onPress={() => setActivePlatform("All")}
            >
              Todas
            </Button>
            {PLATFORMS.map((platform) => (
              <Button
                key={platform}
                radius="full"
                variant={activePlatform === platform ? "solid" : "ghost"}
                className={
                  activePlatform === platform
                    ? PLATFORM_STYLES[platform]
                    : "border border-[#3A3C45] bg-[#111217] text-[#D2CDC2]"
                }
                onPress={() => setActivePlatform(platform)}
              >
                {platform}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredMovies.map((movie) => (
            <Card
              key={movie.id}
              className="overflow-hidden rounded-[2rem] border border-[#3A3C45] bg-[#17181E] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
            >
              <div className="flex h-full flex-col">
                <Link
                  href={`/movies/${movie.id}`}
                  className="relative aspect-[4/5] w-full overflow-hidden border-b border-[#3A3C45]"
                >
                  <Image
                    src={movie.posterUrl}
                    alt={`Poster de ${movie.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1536px) 33vw, 25vw"
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#17181E] to-transparent" />
                </Link>

                <div className="flex h-full flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {movie.predictedPlatforms.map((platform) => (
                      <Chip
                        key={platform}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${PLATFORM_STYLES[platform]}`}
                      >
                        {platform}
                      </Chip>
                    ))}
                  </div>

                  <div>
                    <Link
                      href={`/movies/${movie.id}`}
                      className="text-xl font-semibold tracking-[-0.05em] text-[#F3EBDD] transition hover:text-white"
                    >
                      {movie.title}
                    </Link>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#7F7A71]">
                      {movie.releaseYear} / {movie.runtimeMinutes} min /{" "}
                      {movie.ageRating}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-[#C8C2B8]">
                    {movie.synopsis}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Chip
                        key={genre}
                        variant="flat"
                        className="rounded-full border border-[#3A3C45] bg-[#111217] px-3 text-[#D2CDC2]"
                      >
                        {genre}
                      </Chip>
                    ))}
                  </div>

                  <div className="rounded-[1.4rem] border border-[#3A3C45] bg-[#111217] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                      Para quien funciona mejor
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#F3EBDD]">
                      {movie.audienceFocus}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#B5B0A6]">
                      {movie.audienceReason}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {movie.viewerVibe.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#584E40] px-2 py-1 text-[11px] text-[#D9C393]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/movies/${movie.id}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#F3EBDD] px-4 text-sm font-medium text-[#17181E] transition hover:bg-white"
                    >
                      Ver ficha
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
