"use client"

import type React from "react"
import { createContext, useState, useContext } from "react"

interface UserContextType {
  userId: string | null
  setUserId: (id: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null)

  return <UserContext.Provider value={{ userId, setUserId }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

