import { ConfiguratorLoader } from "@/components/configurator-loader"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <ConfiguratorLoader />
    </main>
  )
}
