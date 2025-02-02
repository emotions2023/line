"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDocumentSegments, type Segment } from "@/lib/dify"

interface SegmentViewerProps {
  documentId: string
  documentName: string
  onClose: () => void
  datasetId: string
}

export function SegmentViewer({ documentId, documentName, onClose, datasetId }: SegmentViewerProps) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSegments() {
      try {
        setIsLoading(true)
        const response = await getDocumentSegments(datasetId, documentId)
        setSegments(response.data)
        // 1ページあたり20件で固定
        setTotalPages(Math.ceil(response.total / 20))
      } catch (err) {
        console.error("Error fetching segments:", err)
        setError("セグメントの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSegments()
  }, [documentId, datasetId])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

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

      <main className="container max-w-3xl mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {segments.map((segment) => (
              <div key={segment.id} className="mb-4">
                {segment.content}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

