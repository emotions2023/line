"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { getDocuments } from "@/lib/dify"
import { SegmentViewer } from "@/components/segment-viewer"
import type { Document as DifyDocument } from "@/lib/dify"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DifyDocument[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DifyDocument | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await getDocuments(currentPage)
        setDocuments(response.data)
        // 1ページあたり20件で固定
        setTotalPages(Math.ceil(response.total / 20))
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("ドキュメントの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentPage])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleDocumentClick = (document: DifyDocument) => {
    setSelectedDocument(document)
  }

  if (selectedDocument) {
    return (
      <SegmentViewer
        documentId={selectedDocument.id}
        documentName={selectedDocument.name}
        onClose={() => setSelectedDocument(null)}
        datasetId={process.env.NEXT_PUBLIC_DIFY_DATASETS_ID || ""}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">ドキュメント一覧</h1>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </header>

      <main className="flex-1 overflow-auto pb-16">
        <div className="container max-w-md mx-auto p-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="space-y-2">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleDocumentClick(document)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{document.name}</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>作成日: {new Date(document.created_at * 1000).toLocaleDateString()}</span>
                      <span>ステータス: {document.indexing_status}</span>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="text-center text-muted-foreground p-8">ドキュメントが見つかりません</div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 mb-4">
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
            </>
          )}
        </div>
      </main>

      <div className="h-16">
        <BottomNav />
      </div>
    </div>
  )
}

