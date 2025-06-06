import { NextResponse } from "next/server"

const FATSECRET_API_KEY = process.env.FATSECRET_API_KEY
const FATSECRET_API_SECRET = process.env.FATSECRET_API_SECRET
const BASE_URL = "https://platform.fatsecret.com/rest/server.api"

async function getAccessToken() {
  const response = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "basic",
      client_id: FATSECRET_API_KEY,
      client_secret: FATSECRET_API_SECRET,
    }),
  })

  const data = await response.json()
  return data.access_token
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const method = searchParams.get("method")
    const query = searchParams.get("q")

    const token = await getAccessToken()

    const response = await fetch(`${BASE_URL}?method=${method}&search_expression=${query}&format=json`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("FatSecret API error:", error)
    return NextResponse.json({ error: "Failed to fetch food data" }, { status: 500 })
  }
}