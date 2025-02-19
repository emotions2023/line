"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { convertAndAddToKnowledgeBase } from "@/lib/dify"

const DIFY_DATASET_ID = process.env.NEXT_PUBLIC_DIFY_DATASETS_ID

export default function NewDocumentPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !fileName || isLoading || !DIFY_DATASET_ID) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await convertAndAddToKnowledgeBase(file, fileName, DIFY_DATASET_ID)
      setSuccess("ファイルが正常に処理され、ナレッジベースに追加されました。")
      setFileName("")
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("処理エラー:", err)
      setError(`エラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 overflow-auto p-4">
        <h1 className="text-xl font-semibold text-center mb-8 mt-4">PDFファイルをアップロード</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <label htmlFor="file-name" className="text-sm font-medium text-gray-700">
              保存するファイル名
            </label>
            <Input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="example.pdf"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">PDFファイルを選択</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
                ref={fileInputRef}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#FFE4E4] hover:bg-[#FFD4D4] transition-colors"
              >
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">クリックしてPDFファイルを選択</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FFB5B5] hover:bg-[#FFA5A5] text-black relative"
            disabled={!file || !fileName || isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">ナレッジベースに追加</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              "ナレッジベースに追加"
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </form>
      </main>

      <div className="h-16">
        <BottomNav />
      </div>
    </div>
  )
}

