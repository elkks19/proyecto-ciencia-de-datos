import Link from "next/link";

type AppShellNavProps = {
  current: "catalogo" | "estadisticas" | "criticas";
};

export function AppShellNav({ current }: AppShellNavProps) {
  const itemClass = (isActive: boolean) =>
    `inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
      isActive
        ? "bg-[#F3EBDD] text-[#17181E] shadow-[0_10px_30px_rgba(216,178,109,0.18)]"
        : "border border-[#6D543B]/45 bg-[#211612]/80 text-[#D2CDC2] hover:border-[#D8B26D]/60"
    }`;

  return (
    <header className="border-b border-[#6D543B]/25 bg-[#1A100D]/82 backdrop-blur-xl">
      <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D8B26D]">
              Sala de analisis
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#F3EBDD] sm:text-4xl">
              Radar de peliculas y plataformas
            </h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link href="/" className={itemClass(current === "catalogo")}>
              Catalogo
            </Link>
            <Link
              href="/estadisticas"
              className={itemClass(current === "estadisticas")}
            >
              Estadisticas
            </Link>
            <Link
              href="/criticas"
              className={itemClass(current === "criticas")}
            >
              Criticas
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
