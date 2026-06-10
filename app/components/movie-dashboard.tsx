"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Chip } from "@heroui/react";

import {
  getMovies,
  type Movie,
  type MoviesResponse,
} from "../data/streaming-api";
import { AppShellNav } from "./app-shell-nav";

const PAGE_SIZE = 48;

type MovieDashboardProps = {
  initialMovies: Movie[];
  initialMeta: MoviesResponse["meta"];
};

export function MovieDashboard({
  initialMovies,
  initialMeta,
}: MovieDashboardProps) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(initialMovies);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await getMovies({
          search: query,
          limit: PAGE_SIZE,
          offset: 0,
        });
        setMovies(response.data);
        setMeta(response.meta);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  async function loadMore() {
    setIsLoadingMore(true);
    try {
      const response = await getMovies({
        search: query,
        limit: PAGE_SIZE,
        offset: movies.length,
      });
      setMovies((current) => [...current, ...response.data]);
      setMeta(response.meta);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="cinema-bg min-h-screen">
      <AppShellNav current="catalogo" />

      <div className="flex w-full flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <section className="warm-panel warm-reveal overflow-hidden rounded-[2rem] border border-[#3A3C45] bg-[#17181E] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 p-6 sm:p-8">
              <Chip className="w-fit rounded-full border border-[#D8B26D]/30 bg-[#2C1C14] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#E6C784]">
                Cartelera viva
              </Chip>
              <div className="max-w-4xl space-y-3">
                <h2 className="text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#F3EBDD] sm:text-5xl">
                  Busca una pelicula y mira donde encaja.
                </h2>
                <p className="warm-copy max-w-3xl text-sm leading-7 sm:text-base">
                  Partimos del catalogo de Rotten Tomatoes y cruzamos cada
                  titulo con los catalogos de streaming para leer disponibilidad
                  y afinidad por plataforma.
                </p>
              </div>
            </div>

            <div className="border-t border-[#D8B26D]/20 bg-[#1A100D]/72 p-6 xl:border-l xl:border-t-0">
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <div className="border-b border-dashed border-[#D8B26D]/20 pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                    Catalogo visible
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
                    {movies.length}/{meta.total}
                  </p>
                </div>
                <div className="border-b border-dashed border-[#D8B26D]/20 pb-4">
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
                  <p className="warm-copy mt-2 text-sm leading-7">
                    Abre una ficha para ver disponibilidad real y
                    compatibilidad estimada por plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:p-5">
          <input
            aria-label="Buscar pelicula"
            placeholder="Busca una pelicula por titulo, genero o tipo de audiencia"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="warm-field min-h-12 w-full rounded-2xl border border-[#3A3C45] bg-[#111217] px-4 text-sm text-[#F3EBDD] outline-none transition placeholder:text-[#A99178] focus:border-[#D8B26D]"
          />
          {isLoading ? (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
              Buscando...
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {movies.map((movie) => (
            <Card
              key={movie.id}
              className="warm-card overflow-hidden rounded-[2rem] border border-[#3A3C45] bg-[#17181E] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
            >
              <div className="flex h-full flex-col">
                <Link
                  href={`/movies/${movie.id}`}
                    className="relative aspect-[4/5] w-full overflow-hidden border-b border-[#D8B26D]/20"
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
                  <div>
                    <Link
                      href={`/movies/${movie.id}`}
                      className="text-xl font-semibold tracking-[-0.05em] text-[#F3EBDD] transition hover:text-white"
                    >
                      {movie.title}
                    </Link>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#7F7A71]">
                      {movie.releaseYear ?? "S/A"} /{" "}
                      {movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "S/D"} /{" "}
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
                        variant="soft"
                        className="rounded-full border border-[#3A3C45] bg-[#111217] px-3 text-[#D2CDC2]"
                      >
                        {genre}
                      </Chip>
                    ))}
                  </div>

                  <div className="rounded-[1.4rem] border border-[#D8B26D]/20 bg-[#1A100D]/72 p-3">
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
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#F3EBDD] px-4 text-sm font-medium text-[#17181E] transition hover:bg-white hover:shadow-[0_10px_28px_rgba(216,178,109,0.2)]"
                    >
                      Ver ficha
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {meta.hasMore ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="warm-panel inline-flex min-h-11 items-center justify-center rounded-full border border-[#3A3C45] bg-[#17181E] px-6 text-sm font-medium text-[#F3EBDD] transition hover:border-[#D8B26D] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? "Cargando..." : "Cargar mas"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
