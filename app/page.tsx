import { ShelfConfigurator } from "@/components/shelf-configurator"

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      <ShelfConfigurator />
    </main>
  )
}
