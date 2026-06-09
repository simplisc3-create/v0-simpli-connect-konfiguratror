"use client"

import { useCallback, useRef } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession, type CheckoutLineInput } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripeCheckout({
  lines,
  onComplete,
}: {
  lines: CheckoutLineInput[]
  onComplete?: (sessionId: string) => void
}) {
  // Capture the session id created server-side so we can route to the
  // confirmation page once the payment completes.
  const sessionIdRef = useRef<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret, sessionId } = await startCheckoutSession(lines)
    sessionIdRef.current = sessionId
    return clientSecret
  }, [lines])

  const handleComplete = useCallback(() => {
    if (sessionIdRef.current) {
      onComplete?.(sessionIdRef.current)
    }
  }, [onComplete])

  return (
    <div id="checkout" className="rounded-xl overflow-hidden">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret, onComplete: handleComplete }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
