"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { uploadDocumentToDify } from "@/lib/dify"

export default function NewDocumentPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!name) {
        setName(selectedFile.name)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      await uploadDocumentToDify(file, name)
      router.push("/documents")
    } catch (err) {
      console.error("Error uploading document:", err)
      setError("ドキュメントのアップロードに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Link href="/documents">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">あたらしい資料を追加</h1>
        </div>
        <Link href="/documents">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </Link>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              資料のなまえ
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="資料の名前を入力..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">資料はこっちへ</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">クリックしてファイルを選択</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/documents")}>
              やめる
            </Button>
            <Button type="submit" className="flex-1" disabled={!file || !name || isLoading}>
              {isLoading ? "とうろく中..." : "とうろく"}
            </Button>
          </div>
        </form>
      </main>

      <div className="h-16">
        <BottomNav />
      </div>
    </div>
  )
}

