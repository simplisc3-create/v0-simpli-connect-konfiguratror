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
export async function isAdminAuthenticated(): Promise<boolean> {
  const adminPw = getAdminPassword()
  if (!adminPw) return false
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === adminPw
}

/** Validates the password and sets the session cookie on success. */
export async function adminLogin(password: string): Promise<{ ok: boolean; error?: string }> {
  const adminPw = getAdminPassword()
  if (!adminPw) {
    return { ok: false, error: "Kein Admin-Passwort konfiguriert." }
  }
  if (password !== adminPw) {
    return { ok: false, error: "Falsches Passwort." }
  }

  const store = await cookies()
  store.set(COOKIE_NAME, adminPw, {
    httpOnly: true,
    sameSite: "lax",
    // `secure` cookies are dropped over http://localhost, which would break the
    // local preview. Only require HTTPS in production.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return { ok: true }
}

/** Clears the admin session. Used as a form action. */
export async function adminLogout() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
  redirect("/admin/orders")
}
