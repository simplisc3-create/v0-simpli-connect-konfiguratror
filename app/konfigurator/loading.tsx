export default function KonfiguratorLoading() {
  return (
    <main className="h-dvh w-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center animate-pulse">
          <span className="text-lg font-bold text-white">S</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#1a1a1a] animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-[#1a1a1a] animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-[#1a1a1a] animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-xs text-gray-400 font-medium tracking-wide">Konfigurator wird geladen…</p>
      </div>
    </main>
  )
}
