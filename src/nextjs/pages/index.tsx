"use client"

import { useRouter } from "next/router"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { MessageCircle, FileText } from "lucide-react"
import type React from "react"
import { useEffect } from "react"
import { useUser } from "@/lib/userContext"
import type { Liff } from "@line/liff"

interface HomeProps {
  liff: Liff | null
  liffError: string | null
}

export default function Home({ liff, liffError }: HomeProps) {
  const router = useRouter()
  const { userId, setUserId } = useUser()

  useEffect(() => {
    if (liff && !userId) {
      if (liff.isLoggedIn()) {
        liff
          .getProfile()
          .then((profile) => {
            setUserId(profile.userId)
          })
          .catch((err) => console.error("Error getting profile:", err))
      } else {
        liff.login()
      }
    }
  }, [liff, userId, setUserId])

  const renderButton = (label: string, route: string, icon: React.ReactNode) => (
    <Button
      variant="secondary"
      className="w-64 h-12 text-gray-700 bg-white hover:bg-gray-100 rounded-lg flex items-center gap-2"
      onClick={() => router.push(route)}
    >
      {icon}
      <span>{label}</span>
    </Button>
  )

  if (liffError) {
    return <div className="flex justify-center items-center h-screen">LIFF error: {liffError}</div>
  }

  if (!userId) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-[#FFB5B5] flex flex-col items-center px-4">
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-12 mt-8">
        <div className="w-48 relative">
          <Image
            src="/img/background-off-squ.svg"
            alt="Background"
            width={500}
            height={300}
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="w-full flex flex-col items-center space-y-4">
          {renderButton("しつもんボタン", `/chat`, <MessageCircle size={20} />)}
          {renderButton("資料一覧ボタン", "/documents", <FileText size={20} />)}
        </div>
      </div>
      <BottomNav />
    </main>
  )
}

