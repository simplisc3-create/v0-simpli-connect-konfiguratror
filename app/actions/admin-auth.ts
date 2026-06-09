"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "sc_admin"

/**
 * Returns the configured admin password. When ADMIN_PASSWORD is not set we
 * deliberately return null so the gate fails closed (no access) rather than
 * granting everyone access.
 */
function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD
  return pw && pw.length > 0 ? pw : null
}

/** True when the current request carries a valid admin session cookie. */
export async function isAdminAuthed(): Promise<boolean> {
  const adminPw = getAdminPassword()
  if (!adminPw) return false
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === adminPw
}

/** Whether an admin password has been configured at all. */
export async function isAdminConfigured(): Promise<boolean> {
  return getAdminPassword() !== null
}

export async function adminLogin(formData: FormData) {
  const adminPw = getAdminPassword()
  const entered = String(formData.get("password") ?? "")

  if (!adminPw || entered !== adminPw) {
    redirect("/admin/bestellungen?error=1")
  }

  const store = await cookies()
  store.set(COOKIE_NAME, adminPw, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })
  redirect("/admin/bestellungen")
}

export async function adminLogout() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
  redirect("/admin/bestellungen")
}
