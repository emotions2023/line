import liff from "@line/liff"

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID

export async function initializeLiff(): Promise<void> {
  try {
    await liff.init({
      liffId: LIFF_ID as string,
    })
    console.log("LIFF initialization succeeded.")
  } catch (error) {
    console.error("LIFF initialization failed:", error)
    throw error
  }
}

export async function getLiffUserId(): Promise<string> {
  if (!liff.isLoggedIn()) {
    console.log("User is not logged in. Redirecting to login...")
    liff.login()
    return ""
  }

  try {
    const profile = await liff.getProfile()
    return profile.userId
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

export function isLoggedIn(): boolean {
  return liff.isLoggedIn()
}

