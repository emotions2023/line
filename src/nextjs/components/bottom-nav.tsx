"use client"

import Link from "next/link"
import { Home, MessageCircle, FileText, Plus } from "lucide-react"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()
  const navItems = [
    {
      href: "/",
      label: "ホーム",
      icon: Home,
    },
    {
      href: "/chat",
      label: "チャット",
      icon: MessageCircle,
    },
    {
      href: "/documents",
      label: "ドキュメント",
      icon: FileText,
    },
    {
      href: "/add",
      label: "新規作成",
      icon: Plus,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center ${
              pathname === item.href ? "text-primary" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

