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

        if (!process.env.GITHUB_REPO_TOKEN) {
            return NextResponse.json({ error: "GITHUB_REPO_TOKEN not set" }, { status: 500 })
        }

       
        const GH_HEADERS = {
            Accept: "application/vnd.github.v3+json",
            Authorization: `Bearer ${process.env.GITHUB_REPO_TOKEN}`,
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
            { headers: GH_HEADERS }
        )

    
        if (!prRes.ok) {
            const err = await prRes.json().catch(() => ({}))
            return NextResponse.json(
                { error: `PR not found or repo is private or repo is old: ${err.message ?? prRes.statusText}` },
                { status: 400 }
            )
        }

        const prData = await prRes.json()
        const baseSha = prData.base.sha

        const filesRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`,
            { headers: GH_HEADERS }
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

        return NextResponse.json({
            files: codeFiles.map((file: any) => ({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                raw_url: file.raw_url,
            })),
            owner,
            repo,
            baseSha,
            isFetched: true,
        })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}