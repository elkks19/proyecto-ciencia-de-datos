import { Card, Chip } from "@heroui/react";

import { AppShellNav } from "../components/app-shell-nav";
import {
  getAudienceStats,
  getGenreStats,
  getPlatformAverages,
  MOVIE_MOCKS,
} from "../data/movie-mocks";

const audienceStats = getAudienceStats();
const genreStats = getGenreStats().slice(0, 6);
const platformStats = getPlatformAverages();

const strongestAudience = audienceStats
  .slice()
  .sort((left, right) => right.count - left.count)[0];

const strongestPlatform = platformStats
  .slice()
  .sort((left, right) => right.average - left.average)[0];

export default function EstadisticasPage() {
  return (
    <main className="min-h-screen bg-[#111217]">
      <AppShellNav current="estadisticas" />

      <div className="flex w-full flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-[#3A3C45] bg-[#17181E] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 p-6 sm:p-8">
              <Chip className="w-fit rounded-full border border-[#584E40] bg-[#201D18] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#D9C393]">
                Statistics room
              </Chip>
              <div className="max-w-4xl space-y-3">
                <h2 className="text-4xl font-semibold leading-[0.92] tracking-[-0.07em] text-[#F3EBDD] sm:text-5xl">
                  La lectura estadistica vive aqui, no en medio del catalogo.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-[#B5B0A6] sm:text-base">
                  Esta pagina resume lo que importa para ciencia de datos:
                  concentracion de audiencias, generos dominantes y fuerza media
                  por plataforma sobre el dataset mockeado.
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-t border-[#3A3C45] bg-[#111217] p-6 sm:grid-cols-3 xl:border-l xl:border-t-0 xl:grid-cols-1">
              <div className="border-b border-dashed border-[#3A3C45] pb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                  Titulos modelados
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
                  {MOVIE_MOCKS.length}
                </p>
              </div>
              <div className="border-b border-dashed border-[#3A3C45] pb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                  Audiencia dominante
                </p>
                <p className="mt-2 text-lg font-semibold text-[#F3EBDD]">
                  {strongestAudience?.bucket}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                  Plataforma lider
                </p>
                <p className="mt-2 text-lg font-semibold text-[#F3EBDD]">
                  {strongestPlatform?.platform}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
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
                        className="h-full rounded-full bg-[#D9C393]"
                        style={{
                          width: `${(item.count / MOVIE_MOCKS.length) * 100}%`,
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

          <Card className="rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
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
                {genreStats.map((item) => (
                  <div
                    key={item.genre}
                    className="grid gap-2 sm:grid-cols-[130px_1fr_52px] sm:items-center"
                  >
                    <p className="text-sm text-[#D2CDC2]">{item.genre}</p>
                    <div className="h-3 overflow-hidden rounded-full bg-[#101116]">
                      <div
                        className="h-full rounded-full bg-[#8DAA91]"
                        style={{
                          width: `${(item.count / genreStats[0].count) * 100}%`,
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

        <section className="grid gap-6 rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
              Streaming probability
            </p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
              Fuerza media por plataforma
            </h3>
            <p className="text-sm leading-7 text-[#B5B0A6]">
              Este bloque funciona como lectura ejecutiva del mock: donde hay
              mas chance agregada de presencia y donde valdria la pena priorizar
              integracion o comparacion de catalogo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {platformStats.map((item) => (
              <div
                key={item.platform}
                className="rounded-[1.5rem] border border-[#3A3C45] bg-[#111217] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#F3EBDD]">
                    {item.platform}
                  </span>
                  <span className="font-mono text-sm text-[#F3EBDD]">
                    {item.average}%
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#17181E]">
                  <div
                    className="h-full rounded-full bg-[#D9C393]"
                    style={{ width: `${item.average}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
