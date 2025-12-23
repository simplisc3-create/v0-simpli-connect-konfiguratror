export function ConfiguratorHeader() {
  return (
    <header className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-3 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary md:h-10 md:w-10">
          <span className="text-base font-bold text-primary-foreground md:text-lg">S</span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-card-foreground md:text-lg">Shelf Configurator</h1>
          <p className="hidden text-xs text-muted-foreground sm:block md:text-sm">Design your perfect shelf system</p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
        <button className="rounded-lg border border-border px-3 py-1.5 text-xs text-card-foreground transition-colors hover:bg-secondary md:px-4 md:py-2 md:text-sm">
          Save Design
        </button>
        <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:px-4 md:py-2 md:text-sm">
          Share
        </button>
      </div>
    </header>
  )
}
