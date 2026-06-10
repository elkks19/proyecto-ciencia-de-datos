import { Card, Chip } from "@heroui/react";
import Image from "next/image";

import { AppShellNav } from "../components/app-shell-nav";
import { getReviewsOverview } from "../data/streaming-api";

const impactStyles = {
  High: "border-[#8B3A2E] bg-[#291714] text-[#F2C0B5]",
  Medium: "border-[#7A6841] bg-[#241E12] text-[#E8D39D]",
  Low: "border-[#3E5B49] bg-[#132019] text-[#B8D6C0]",
} as const;

const impactColors = {
  High: "#B35C4B",
  Medium: "#D9C393",
  Low: "#8DAA91",
} as const;

function formatCorrelation(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default async function CriticasPage() {
  const overview = await getReviewsOverview();
  const {
    summary,
    correlations,
    runtimeBands,
    yearBands,
    ageProfiles,
    actorProfiles,
    acceptanceRanking,
    impactDistribution,
    criticalItems,
  } = overview.data;
  const totalImpact = impactDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const pieStops = impactDistribution
    .filter((item) => item.count > 0)
    .reduce(
      (acc, item) => {
        const start = acc.current;
        const portion = totalImpact ? (item.count / totalImpact) * 100 : 0;
        const end = start + portion;

        acc.stops.push(`${impactColors[item.level]} ${start}% ${end}%`);
        acc.current = end;
        return acc;
      },
      { current: 0, stops: [] as string[] }
    ).stops;

  return (
    <main className="cinema-bg min-h-screen">
      <AppShellNav current="criticas" />

      <div className="flex w-full flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <section className="warm-panel warm-reveal overflow-hidden rounded-[2rem] border border-[#3A3C45] bg-[#17181E] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 p-6 sm:p-8">
              <Chip className="w-fit rounded-full border border-[#D8B26D]/30 bg-[#2C1C14] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#E6C784]">
                Pulso critico
              </Chip>
              <div className="max-w-4xl space-y-3">
                <h2 className="text-4xl font-semibold leading-[0.92] tracking-[-0.07em] text-[#F3EBDD] sm:text-5xl">
                  Cuando la critica puede afectar la percepcion de una pelicula.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-[#B5B0A6] sm:text-base">
                  Esta pagina consume la API Python y resume tomatometer,
                  audiencia, brecha critica, volumen de reseñas e impacto.
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-t border-[#D8B26D]/20 bg-[#1A100D]/72 p-6 sm:grid-cols-3 xl:border-l xl:border-t-0 xl:grid-cols-1">
              <div className="border-b border-dashed border-[#3A3C45] pb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                  Tomatometer medio
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
                  {summary.averageTomatometer}
                </p>
              </div>
              <div className="border-b border-dashed border-[#3A3C45] pb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                  Audience medio
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
                  {summary.averageAudience}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7F7A71]">
                  Riesgo alto
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#F3EBDD]">
                  {summary.highImpactCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                  Correlation lab
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                  Duracion, ano y edad
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Duracion vs Tomato
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {formatCorrelation(correlations.runtimeToTomatometer)}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Duracion vs Audiencia
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {formatCorrelation(correlations.runtimeToAudience)}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Ano vs Tomato
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {formatCorrelation(correlations.yearToTomatometer)}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                    Ano vs Audiencia
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                    {formatCorrelation(correlations.yearToAudience)}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-[#3A3C45] bg-[#111217] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                  Actor con mejor senal critica
                </p>
                <p className="mt-2 text-xl font-semibold text-[#F3EBDD]">
                  {correlations.strongestActor ?? "Sin patron suficiente"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#B5B0A6]">
                  El calculo toma actores repetidos en al menos dos peliculas con
                  Rotten Tomatoes dentro del dataset. Muestra evaluada:{" "}
                  {summary.reviewedTitles} titulos.
                </p>
              </div>
            </div>
          </Card>

          <Card className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                  Audience slices
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                  Edad, epoca y duracion
                </h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  {ageProfiles.map((item) => (
                    <div
                      key={item.bucket}
                      className="warm-card rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[#F3EBDD]">{item.bucket}</span>
                        <span className="font-mono text-xs text-[#D9C393]">
                          {item.movieCount} titulos
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-[#B5B0A6]">
                        Tomato {item.averageTomatometer} / Audiencia{" "}
                        {item.averageAudience} / {item.averageRuntime || "S/D"} min
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {runtimeBands.map((item) => (
                    <div
                      key={item.label}
                      className="warm-card rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[#F3EBDD]">
                          Ventana {item.label}
                        </span>
                        <span className="font-mono text-xs text-[#D9C393]">
                          {item.movieCount}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-[#B5B0A6]">
                        Tomato {item.averageTomatometer} / Audiencia{" "}
                        {item.averageAudience}
                      </p>
                    </div>
                  ))}

                  {yearBands.map((item) => (
                    <div
                      key={item.label}
                      className="warm-card rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[#F3EBDD]">{item.label}</span>
                        <span className="font-mono text-xs text-[#D9C393]">
                          {item.movieCount}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-[#B5B0A6]">
                        Tomato {item.averageTomatometer} / Audiencia{" "}
                        {item.averageAudience}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                  Visual summary
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                  Distribucion del impacto critico
                </h3>
              </div>

              <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
                <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border border-[#D8B26D]/20 bg-[#1A100D]/72">
                  <div
                    className="flex h-[168px] w-[168px] items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(${pieStops.join(", ")})`,
                    }}
                  >
                    <div className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#17181E] text-center">
                      <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#F3EBDD]">
                        {totalImpact}
                        <br />
                        titulos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {impactDistribution.map((item) => (
                    <div
                      key={item.level}
                      className="warm-card flex items-center justify-between rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: impactColors[item.level] }}
                        />
                        <span className="text-sm text-[#D2CDC2]">
                          {item.level}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-[#F3EBDD]">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                  Acceptance ranking
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                  Peliculas mejor aceptadas
                </h3>
              </div>

              <div className="space-y-3">
                {acceptanceRanking.slice(0, 3).map((item, index) => (
                  <div
                    key={item.id}
                    className="warm-card flex items-center justify-between gap-4 rounded-[1.4rem] border border-[#3A3C45] bg-[#111217] px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-12 overflow-hidden rounded-[0.9rem] border border-[#3A3C45]">
                        <Image
                          src={item.posterUrl}
                          alt={`Poster de ${item.title}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#584E40] text-sm font-semibold text-[#D9C393]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#F3EBDD]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#B5B0A6]">
                          Tomato {item.tomatometerRating} / Audiencia{" "}
                          {item.audienceRating}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-sm text-[#F3EBDD]">
                      {item.combinedScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="warm-panel warm-reveal rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
                Actor signals
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                Actores que se repiten en la muestra
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {actorProfiles.map((item) => (
                <div
                  key={item.actor}
                  className="warm-card rounded-[1.4rem] border border-[#3A3C45] bg-[#111217] p-4"
                >
                  <p className="text-base font-semibold text-[#F3EBDD]">
                    {item.actor}
                  </p>
                  <p className="mt-1 text-xs text-[#B5B0A6]">
                    {item.movieCount} peliculas / ultimo corte{" "}
                    {item.latestReleaseYear ?? "S/F"}
                  </p>
                  <div className="mt-4 grid gap-2 text-xs text-[#D2CDC2]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Tomato medio</span>
                      <span className="font-mono text-[#F3EBDD]">
                        {item.averageTomatometer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Audience media</span>
                      <span className="font-mono text-[#F3EBDD]">
                        {item.averageAudience}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Duracion media</span>
                      <span className="font-mono text-[#F3EBDD]">
                        {item.averageRuntime || "S/D"} min
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.notableTitles.map((title) => (
                      <Chip
                        key={title}
                        variant="soft"
                        className="rounded-full border border-[#3A3C45] bg-[#17181E] px-3 text-[#D2CDC2]"
                      >
                        {title}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {criticalItems.map((item) => (
            <Card
              key={item.id}
              className="warm-card rounded-[2rem] border border-[#3A3C45] bg-[#17181E] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
            >
              <div className="flex gap-4">
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-[1.2rem] border border-[#3A3C45]">
                  <Image
                    src={item.posterUrl}
                    alt={`Poster de ${item.title}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.05em] text-[#F3EBDD]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#B5B0A6]">
                        {item.productionCompany || "Sin productora"} /{" "}
                        {item.originalReleaseDate ?? "Sin fecha"} /{" "}
                        {item.runtimeMinutes ? `${item.runtimeMinutes} min` : "S/D"} /{" "}
                        {item.ageRating}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-2 text-xs font-semibold ${impactStyles[item.impactLevel]}`}
                    >
                      Impacto {item.impactLevel}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-[#C8C2B8]">
                    {item.consensus ?? "Sin consenso critico disponible."}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                        Tomato
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                        {item.tomatometerRating}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                        Audiencia
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                        {item.audienceRating}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                        Gap
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                        {item.criticGap > 0 ? "+" : ""}
                        {item.criticGap}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#3A3C45] bg-[#111217] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                        Fresh share
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#F3EBDD]">
                        {item.freshShare}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-[#3A3C45] bg-[#111217] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                      Lectura de impacto
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#B5B0A6]">
                      {item.impactReason}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.audienceBuckets.map((bucket) => (
                      <Chip
                        key={`${item.id}-${bucket}`}
                        variant="soft"
                        className="rounded-full border border-[#3A3C45] bg-[#17181E] px-3 text-[#D2CDC2]"
                      >
                        {bucket}
                      </Chip>
                    ))}
                  </div>

                  <div className="rounded-[1.4rem] border border-[#3A3C45] bg-[#111217] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7F7A71]">
                      Actores visibles en la muestra
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.actors.map((actor) => (
                        <Chip
                          key={`${item.id}-${actor}`}
                          variant="soft"
                          className="rounded-full border border-[#3A3C45] bg-[#17181E] px-3 text-[#D2CDC2]"
                        >
                          {actor}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
