import Link from "next/link";

type AppShellNavProps = {
  current: "catalogo" | "estadisticas" | "criticas";
};

export function AppShellNav({ current }: AppShellNavProps) {
  const itemClass = (isActive: boolean) =>
    `inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
      isActive
        ? "bg-[#F3EBDD] text-[#17181E]"
        : "border border-[#3A3C45] bg-[#111217] text-[#D2CDC2] hover:border-[#B9A57A]"
    }`;

  return (
    <header className="border-b border-[#2A2C34] bg-[#111217]/95 backdrop-blur">
      <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#B9A57A]">
              Screening deck
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#F3EBDD] sm:text-4xl">
              Streaming cinema intelligence
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
