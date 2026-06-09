import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/actions/admin-auth"
import { getInvoiceUrl } from "@/app/actions/orders"

export const runtime = "nodejs"

export async function GET(request: Request) {
  // Protect: only authenticated admins can fetch invoice links (they contain PII).
  const authed = await isAdminAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")
  if (!sessionId) {
    return NextResponse.json({ error: "session_id fehlt" }, { status: 400 })
  }

  const result = await getInvoiceUrl(sessionId)
  if (!result.url) {
    return NextResponse.json({ error: result.error ?? "Keine Rechnung verfügbar" }, { status: 404 })
  }

  return NextResponse.json({ url: result.url })
}
