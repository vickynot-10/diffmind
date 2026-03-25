import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { raw_url, filename, owner, repo, baseSha } = await req.json()

    if (!baseSha || !filename || !owner || !repo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newRes = await fetch(raw_url)
    if (!newRes.ok) {
      return NextResponse.json({ error: "Failed to fetch new file" }, { status: 502 })
    }
    const newCode = await newRes.text()

    const encodedFilename = filename.split("/").map(encodeURIComponent).join("/")
    const oldRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${baseSha}/${encodedFilename}`

    const oldRes = await fetch(oldRawUrl, {
      headers: process.env.GITHUB_REPO_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}` }
        : {},
    })

   
    const oldCode = oldRes.ok ? await oldRes.text() : null

    return NextResponse.json({
      oldCode,          
      newCode,
      isNewFile: !oldRes.ok,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}