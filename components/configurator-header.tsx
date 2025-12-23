export function ConfiguratorHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">S</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-card-foreground">Shelf Configurator</h1>
          <p className="text-xs text-muted-foreground">Design your perfect shelf system</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-border px-4 py-2 text-sm text-card-foreground transition-colors hover:bg-secondary">
          Save Design
        </button>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Share
        </button>
      </div>
    </header>
  )
}
