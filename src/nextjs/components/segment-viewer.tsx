"use client"

import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDocumentSegments, type Segment } from "@/lib/dify"

interface SegmentViewerProps {
  documentId: string
  documentName: string
  onClose: () => void
  datasetId: string
  initialSegmentId?: string // 追加：特定のセグメントにジャンプするためのID
}

export function SegmentViewer({ documentId, documentName, onClose, datasetId, initialSegmentId }: SegmentViewerProps) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSegments() {
      try {
        setIsLoading(true)
        const response = await getDocumentSegments(datasetId, documentId)
        // positionでソート
        const sortedSegments = response.data.sort((a, b) => a.position - b.position)
        setSegments(sortedSegments)

        // 特定のセグメントが指定されている場合、そこまでスクロール
        if (initialSegmentId) {
          setTimeout(() => {
            const element = document.getElementById(initialSegmentId)
            if (element) {
              element.scrollIntoView({ behavior: "smooth" })
              element.classList.add("bg-accent", "transition-colors")
              setTimeout(() => {
                element.classList.remove("bg-accent")
              }, 2000)
            }
          }, 100)
        }
      } catch (err) {
        console.error("Error fetching segments:", err)
        setError("セグメントの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSegments()
  }, [documentId, datasetId, initialSegmentId])

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{documentName}</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto p-4 overflow-auto h-[calc(100vh-3.5rem)]">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {segments.map((segment) => (
              <div
                key={segment.id}
                id={segment.id}
                className="mb-4 p-2 rounded-lg transition-colors duration-300 whitespace-pre-wrap"
              >
                {segment.content}
              </div>
            ))}
            {segments.length === 0 && (
              <div className="text-center text-muted-foreground p-8">セグメントが見つかりません</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

