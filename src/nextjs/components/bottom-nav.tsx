"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface BottomNavItem {
  href: string
  icon: () => ReactNode
  label: string
}

const navItems = [
  {
    href: "/",
    label: "ホーム",
    icon: () => <img src="/img/home.svg" alt="Home" width={24} height={24} />,
  },
  {
    href: "/chat",
    label: "チャット",
    icon: () => <img src="/img/chat.svg" alt="Chat" width={24} height={24} />,
  },
  {
    href: "/documents",
    label: "ドキュメント",
    icon: () => <img src="/img/document.svg" alt="Document" width={24} height={24} />,
  },
  {
    href: "/add",
    label: "新規作成",
    icon: () => <img src="/img/add.svg" alt="Add" width={24} height={24} />,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 rounded-lg ${
              pathname === item.href ? "bg-[#F3AFA7] p-3" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className={`${pathname === item.href ? "brightness-0 invert" : ""}`}>
              <item.icon />
            </div>
          </Link>
        ))}
      </div>
    </nav>
  )
}