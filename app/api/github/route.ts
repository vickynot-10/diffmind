import { NextRequest, NextResponse } from "next/server"

const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  go: "go",
  rs: "rust",
  java: "java",
  cpp: "cpp",
  rb: "ruby",
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url?.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const parts = url.replace("https://", "").split("/")
    const owner = parts[1]
    const repo = parts[2]
    const pull_number = parts[4]

    if (!owner || !repo || !pull_number) {
      return NextResponse.json({ error: "Invalid GitHub PR URL" }, { status: 400 })
    }

    const prRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    )

    if (!prRes.ok) {
      return NextResponse.json({ error: "PR not found or repo is private" }, { status: 400 })
    }

    const prData = await prRes.json()
    const baseSha = prData.base.sha

    const filesRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`,
      { headers: { Accept: "application/vnd.github.v3+json" ,   Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}` } }
    )

    if (!filesRes.ok) {
      return NextResponse.json({ error: "Failed to fetch PR files" }, { status: 400 })
    }

    const files = await filesRes.json()

    const codeFiles = files.filter((file: any) => {
      const ext = file.filename.split(".").pop()
      return ext in EXT_TO_LANG && file.status !== "removed"
    })

    if (codeFiles.length === 0) {
      return NextResponse.json({ error: "No code files found in this PR" }, { status: 400 })
    }

    const file = codeFiles[0]
    const ext = file.filename.split(".").pop() ?? "js"
    const language = EXT_TO_LANG[ext] ?? "javascript"

    const newRes = await fetch(file.raw_url)
    const newCode = await newRes.text()

    const oldRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${file.filename}?ref=${baseSha}`,
      { headers: { Accept: "application/vnd.github.v3+json" ,   Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}` }  } ,
      
    )
    const oldData = await oldRes.json()
    const oldCode = Buffer.from(oldData.content, "base64").toString("utf-8")

    return NextResponse.json({
      oldCode,
      newCode,
      language,
      filename: file.filename,
      isFetched: true,
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}