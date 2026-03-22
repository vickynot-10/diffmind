import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { raw_url, filename, owner, repo, baseSha } = await req.json()

    const newRes = await fetch(raw_url)
    const newCode = await newRes.text()

    const oldRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filename}?ref=${baseSha}`,
      { headers: { Accept: "application/vnd.github.v3+json", Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}` } }
    )
    const oldData = await oldRes.json()
    
    const oldCode = Buffer.from(oldData.content, "base64").toString("utf-8")

    return NextResponse.json({ oldCode, newCode })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}