export function ConfiguratorHeader() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <span className="text-lg font-bold text-[#1a1a1a]">S</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Shelf Configurator</h1>
          <p className="text-xs text-white/50">Design your perfect shelf system</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
          Save Design
        </button>
        <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-white/90">
          Share
        </button>
      </div>
    </header>
  )
}
