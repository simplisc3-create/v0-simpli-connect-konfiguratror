"use client"

import type { PutBlobResult } from "@vercel/blob"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Upload, Loader2 } from "lucide-react"

export default function UploadModelsContent() {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [blob, setBlob] = useState<PutBlobResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload GLB Models</CardTitle>
            <CardDescription>
              Upload 3D model files (.glb) to Vercel Blob Storage for use in the configurator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                setError(null)
                setBlob(null)

                if (!inputFileRef.current?.files) {
                  setError("No file selected")
                  return
                }

                const file = inputFileRef.current.files[0]
                setUploading(true)

                try {
                  const response = await fetch(`/api/models/upload?filename=${file.name}`, {
                    method: "POST",
                    body: file,
                  })

                  if (!response.ok) {
                    throw new Error("Upload failed")
                  }

                  const newBlob = (await response.json()) as PutBlobResult
                  setBlob(newBlob)

                  if (inputFileRef.current) {
                    inputFileRef.current.value = ""
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed")
                } finally {
                  setUploading(false)
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <input
                  name="file"
                  ref={inputFileRef}
                  type="file"
                  accept=".glb"
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-100"
                />
                <p className="text-sm text-muted-foreground">
                  Select a .glb file to upload. Use descriptive filenames like "80x40x40-1-1-white_optimized.glb"
                </p>
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Model
                  </>
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {blob && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="font-semibold">Upload successful!</div>
                  <div className="mt-1 text-sm break-all">
                    URL:{" "}
                    <a href={blob.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {blob.url}
                    </a>
                  </div>
                  <div className="mt-3 rounded bg-white p-2 text-xs font-mono text-slate-800">
                    "{blob.pathname}": "{blob.url}",
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    Copy the code above and add it to the UPLOADED_MODELS object in lib/glb-registry.ts
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Upload each GLB model file using the form above</p>
            <p>2. Copy the generated Blob Storage URL</p>
            <p>
              3. Update the GLB registry in <code className="rounded bg-muted px-1 py-0.5">lib/glb-registry.ts</code>{" "}
              with the new URLs
            </p>
            <p>4. The configurator will automatically use the uploaded models</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
