export function ConfiguratorHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:h-16 md:px-8">
      {/* Logo and brand */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Geometric logo mark */}
        <div className="flex h-8 w-8 items-center justify-center md:h-9 md:w-9">
          <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" aria-label="SIMPLI Logo">
            {/* Architectural grid mark */}
            <rect x="2" y="2" width="12" height="12" fill="currentColor" className="text-foreground" />
            <rect
              x="18"
              y="2"
              width="12"
              height="12"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground"
              fill="none"
            />
            <rect
              x="2"
              y="18"
              width="12"
              height="12"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground"
              fill="none"
            />
            <rect x="18" y="18" width="12" height="12" fill="currentColor" className="text-foreground" />
          </svg>
        </div>

        {/* Brand name with technical typography */}
        <div className="flex flex-col">
          <span className="font-mono text-xs font-medium tracking-[0.25em] text-foreground md:text-sm">SIMPLI</span>
          <span className="hidden font-mono text-[9px] tracking-[0.15em] text-muted-foreground sm:block md:text-[10px]">
            MODULAR SYSTEMS
          </span>
        </div>
      </div>

      {/* Navigation and actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Technical product label */}
        <span className="hidden font-mono text-[10px] tracking-wider text-muted-foreground lg:block">
          CONFIGURATOR V2.0
        </span>

        <div className="h-4 w-px bg-border hidden lg:block" />

        <button className="font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground px-2 py-1.5 md:px-3 md:py-2">
          SAVE
        </button>
        <button className="bg-foreground text-background font-mono text-xs tracking-wide px-3 py-1.5 transition-colors hover:bg-foreground/90 md:px-4 md:py-2">
          EXPORT
        </button>
      </div>
    </header>
  )
}
