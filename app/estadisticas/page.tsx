import { Card, Chip } from "@heroui/react";

import { AppShellNav } from "../components/app-shell-nav";
import { getStatsOverview } from "../data/streaming-api";

export default async function EstadisticasPage() {
  const overview = await getStatsOverview();
  const { totals, audienceStats, genreStats, platformProfiles } = overview.data;
  const visibleGenreStats = genreStats.slice(0, 6);
  const strongestGenre = visibleGenreStats[0]?.count ?? 1;

  return (
    <main className="cinema-bg min-h-screen">
      <AppShellNav current="estadisticas" />

      <div className="flex w-full flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="warm-card rounded-[1.5rem] border border-[#3A3C45] bg-[#17181E] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
              Titulos modelados
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
              {totals.movies}
            </p>
          </Card>
          <Card className="warm-card rounded-[1.5rem] border border-[#3A3C45] bg-[#17181E] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
              Audiencia dominante
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
              {totals.dominantAudience}
            </p>
          </Card>
          <Card className="warm-card rounded-[1.5rem] border border-[#3A3C45] bg-[#17181E] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
              Mejor compatibilidad
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
              {totals.leadingPlatform}
            </p>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                  Audience distribution
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                  Segmentos de publico
                </h3>
              </div>

              <div className="space-y-4">
                {audienceStats.map((item) => (
                  <div
                    key={item.bucket}
                    className="grid gap-2 sm:grid-cols-[130px_1fr_52px] sm:items-center"
                  >
                    <p className="text-sm text-[#D2CDC2]">{item.bucket}</p>
                    <div className="h-3 overflow-hidden rounded-full bg-[#101116]">
                      <div
                        className="warm-bar-fill h-full rounded-full bg-[#D9C393]"
                        style={{
                          width: `${totals.movies ? (item.count / totals.movies) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-right font-mono text-xs text-[#F3EBDD]">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                  Genre pressure
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                  Generos con mayor presencia
                </h3>
              </div>

              <div className="space-y-4">
                {visibleGenreStats.map((item) => (
                  <div
                    key={item.genre}
                    className="grid gap-2 sm:grid-cols-[130px_1fr_52px] sm:items-center"
                  >
                    <p className="text-sm text-[#D2CDC2]">{item.genre}</p>
                    <div className="h-3 overflow-hidden rounded-full bg-[#101116]">
                      <div
                        className="warm-bar-fill h-full rounded-full bg-[#8DAA91]"
                        style={{
                          width: `${(item.count / strongestGenre) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-right font-mono text-xs text-[#F3EBDD]">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="warm-panel warm-reveal grid gap-6 rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
              Platform tendencies
            </p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
              A que tiende cada plataforma
            </h3>
            <p className="text-sm leading-7 text-[#B5B0A6]">
              La API agrupa las peliculas por la plataforma con mayor
              compatibilidad estimada y resume patrones de genero, audiencia y
              clasificacion.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {platformProfiles.map((item) => (
              <div
                key={item.platform}
                className="warm-card rounded-[1.5rem] border border-[#3A3C45] bg-[#111217] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#F3EBDD]">
                    {item.platform}
                  </span>
                  <span className="font-mono text-sm text-[#F3EBDD]">
                    {item.averageScore}%
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#17181E]">
                  <div
                    className="warm-bar-fill h-full rounded-full bg-[#D9C393]"
                    style={{ width: `${item.averageScore}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-[#B5B0A6]">
                  {item.tendency}
                </p>
                <div className="mt-4 grid gap-3 text-xs text-[#D2CDC2]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Candidatas</span>
                    <span className="font-mono text-[#F3EBDD]">
                      {item.candidateCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Encontradas en catalogos</span>
                    <span className="font-mono text-[#F3EBDD]">
                      {item.availableCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Clasificacion dominante</span>
                    <span className="font-mono text-[#F3EBDD]">
                      {item.dominantRating}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.topGenres.map((genre) => (
                    <Chip
                      key={genre}
                      variant="soft"
                      className="rounded-full border border-[#3A3C45] bg-[#17181E] px-3 text-[#D2CDC2]"
                    >
                      {genre}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
