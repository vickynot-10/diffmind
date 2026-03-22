"use client";
import { IoAnalyticsOutline } from "react-icons/io5";
import { DiffEditor, type Monaco } from "@monaco-editor/react";
import LanguageSelect from "@/components/LanguageSelect";
import { useState, useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { MdClear } from "react-icons/md";
import Loader from "./Loader";
import Snackbar, { useSnackbar } from "@/components/Snackbar";
import { SiGithub } from "react-icons/si";
import { TbX, TbArrowRight } from "react-icons/tb";
const OLD_CODE = `
  function fetchUser(id) {
  const user = db.query(id);
  return user;
}

function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

function sendEmail(to, message) {
  mailer.send(to, message);
}
  `;
const NEW_CODE = `
async function fetchUser(id) {
  const cached = await cache.get(id);
  if (cached) return cached;
  const user = await db.query(id);
  await cache.set(id, user);
  return user;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

async function sendEmail(to, subject, message) {
  await mailer.send({ to, subject });
  logger.info("email sent", { to });
}
  `;

export default function Home() {
  const { snackbar, show, hide } = useSnackbar();
  const [language, setLanguage] = useState("javascript");
  const [oldLines, setOldLines] = useState(1);
  const [newLines, setNewLines] = useState(1);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const mountedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  function handleMount(
    diffEditor: MonacoEditor.IStandaloneDiffEditor,
    monaco: Monaco,
  ) {
    editorRef.current = diffEditor;
    monacoRef.current = monaco;
    mountedRef.current = true;

    const original = diffEditor.getOriginalEditor();
    const modified = diffEditor.getModifiedEditor();

    original.onDidChangeModelContent(() => {
      setOldLines(original.getModel()?.getLineCount() ?? 1);
    });
    modified.onDidChangeModelContent(() => {
      setNewLines(modified.getModel()?.getLineCount() ?? 1);
    });
  }
  function SetnewLanguage(val: any) {
    setLanguage(val);
  }

  async function AnalyzeCode() {
    try {
      setLoading(true);
      const oldCode = editorRef.current?.getOriginalEditor().getValue() ?? "";
      if (
        !oldCode ||
        !oldCode.length ||
        !oldCode.trim() ||
        oldCode.replace(/\s/g, "").trim() === ""
      ) {
        return show("Original Code is Required", "error");
      }

      const newCode = editorRef.current?.getModifiedEditor().getValue() ?? "";

      if (
        !newCode ||
        !newCode.length ||
        !newCode.trim() ||
        newCode.replace(/\s/g, "").trim() === ""
      ) {
        return show("Modified Code is Required", "error");
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCode, newCode, language }),
      });
      const data = await res.json();
      if (data.isFetched && data.analysis) {
        const parsed = JSON.parse(data.analysis);
        setAnalysis(parsed);
        show("Analysis complete!", "success");
      } else {
        show(data.msg, "error");
      }
    } catch (e: any) {
      const error_msg =
        e.message ||
        e.msg ||
        e.error.msg ||
        e.error.message ||
        e.error ||
        "Error Occured";
      show(error_msg, "error");
    } finally {
      setLoading(false);
    }
  }

  function clearCode() {
    editorRef.current?.getModifiedEditor().setValue("");
    editorRef.current?.getOriginalEditor().setValue("");
  }

  function handleToggle() {
    setOpen((prev) => !prev);
    setUrl("");
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") setOpen(false);
  }
  function handleSubmit() {
    if (!url.trim()) return;

    GetGithubRepo();
  }

  const [ghLoading, setGhLoading] = useState(false);



async function GetGithubRepo() {
  try {
    setGhLoading(true)

    const res = await fetch("/api/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()

    if (!res.ok) {
      return show(data.error, "error")
    }

    setLanguage(data.language)
    editorRef.current?.getOriginalEditor().setValue(data.oldCode)
    editorRef.current?.getModifiedEditor().setValue(data.newCode)
    setOpen(false)
    show(`Loaded ${data.filename}`, "success")

  } catch (e: any) {
    show(e.message ?? "Error fetching PR", "error")
  } finally {
    setGhLoading(false)
  }
}

  return (
    <>
      <div className="flex flex-col gap-5 pt-15 px-5">
        <div className="flex flex-row w-full items-center gap-3">
          <span className="text-[#8a8f98] text-[13px]">Language</span>
          <LanguageSelect onSelect={(val: string) => SetnewLanguage(val)} />

          <button
            onClick={handleToggle}
            className={[
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer outline-none",
              "border transition-all duration-150 text-[13px] font-medium",
              open
                ? "border-white/20 bg-white/6 text-[#f7f8f8]"
                : "border-white/10 bg-white/4 text-[#8a8f98] hover:border-white/20 hover:bg-white/6 hover:text-[#f7f8f8]",
            ].join(" ")}
          >
            <SiGithub size={14} />
            <span className="hidden sm:inline">GitHub</span>
          </button>

          <div
            className={[
              "flex items-center gap-2 overflow-hidden transition-all duration-200 ease-in-out",
              open ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 w-full border border-white/10 bg-white/4 rounded-lg px-3 py-1.5 focus-within:border-white/25 focus-within:bg-white/6 transition-all duration-150">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="github.com/org/repo/pull/123"
                className="flex-1 bg-transparent outline-none border-none text-[12px] text-[#d0d6e0] placeholder:text-[#3e3e44] min-w-0"
                autoFocus={open}
              />
              {url && (
                <button
                  onClick={() => setUrl("")}
                  className="text-[#62666d] hover:text-[#8a8f98] transition-colors cursor-pointer border-none outline-none bg-transparent"
                >
                  <TbX size={12} />
                </button>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!url.trim() || ghLoading}
              className={[
                "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                "border transition-all duration-150 cursor-pointer outline-none",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                url.trim()
                  ? "border-white/20 bg-white/6 text-[#f7f8f8] hover:bg-white/10 hover:border-white/25"
                  : "border-white/10 bg-transparent text-[#62666d]",
              ].join(" ")}
            >
              {ghLoading ? (
                <Loader />
              ) : (
                <>
                  <TbArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-[10px] border border-white/8 overflow-hidden">
          <div className="grid grid-cols-2 border-b border-white/8">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-white/8 bg-[#0f1011]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/70 shrink-0" />
              <span className="text-[12px] font-medium text-[#8a8f98] tracking-tight">
                Old version
              </span>
              <span className="ml-auto text-[11px] tabular-nums text-[#3e3e44]">
                {oldLines} {oldLines === 1 ? "line" : "lines"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-[#0f1011]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400/70 shrink-0" />
              <span className="text-[12px] font-medium text-[#8a8f98] tracking-tight">
                New version
              </span>
              <span className="ml-auto text-[11px] tabular-nums text-[#3e3e44]">
                {newLines} {newLines === 1 ? "line" : "lines"}
              </span>
            </div>
          </div>

          <div className="resize-y overflow-auto border border-white/8 rounded-[10px]">
            <DiffEditor
              height="100%"
              className="  min-h-100"
              language={language}
              theme="vs-dark"
              original={OLD_CODE}
              modified={NEW_CODE}
              onMount={handleMount}
              options={{
                readOnly: false,
                renderSideBySide: true,
                originalEditable: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 22,
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                overviewRulerBorder: false,
                renderOverviewRuler: false,
                hideCursorInOverviewRuler: true,
              }}
            />
          </div>
        </div>

        <div className=" flex flex-row items-center gap-5 justify-end">
          <button
            onClick={clearCode}
            className="analyze-btn px-3 py-3 flex flex-row items-center justify-center gap-3 border border-[#acacac73] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdClear size={20} /> Clear
          </button>

          <button
            onClick={AnalyzeCode}
            disabled={loading}
            className="analyze-btn  w-28 px-3 py-3 flex flex-row items-center justify-center gap-3 border border-[#acacac73] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                <IoAnalyticsOutline size={20} /> Analyze
              </>
            )}
          </button>
        </div>

        {analysis &&
          !loading &&
          analysis.length > 0 &&
          analysis.map((item) => (
            <div
              key={item.name}
              className={`
      bg-[#0f1011] border border-[#34343a] rounded-lg p-4 mb-5
      ${item.severity === "breaking" ? "border-l-2 border-l-[#eb5757] rounded-l-none!" : ""}
      ${item.severity === "warning" ? "border-l-2 border-l-[#f0bf00] rounded-l-none!" : ""}
      ${item.severity === "info" ? "border-l-2 border-l-[#7170ff] rounded-l-none!" : ""}
    `}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`
        text-[10px] font-medium px-2 py-0.5 rounded
        ${item.severity === "breaking" ? "bg-[rgba(235,87,87,0.12)] text-[#ff8583] border border-[rgba(235,87,87,0.2)]" : ""}
        ${item.severity === "warning" ? "bg-[rgba(240,191,0,0.1)] text-[#ffd500] border border-[rgba(240,191,0,0.2)]" : ""}
        ${item.severity === "info" ? "bg-[rgba(113,112,255,0.1)] text-[#828fff] border border-[rgba(113,112,255,0.2)]" : ""}
      `}
                >
                  {item.severity}
                </span>
                <span className="font-mono text-[13px] text-[#f7f8f8]">
                  {item.name}
                </span>
              </div>
              <p className="text-[13px] text-[#d0d6e0] mb-1">{item.summary}</p>
              <p className="text-[12px] text-[#8a8f98] mb-3">{item.details}</p>
              <div className="bg-[#141516] rounded-md p-2 border border-[#23252a]">
                <p className="text-[11px] text-[#8a8f98]">
                  <span className="text-[#d0d6e0] font-medium">Risk: </span>
                  {item.risk}
                </p>
              </div>
            </div>
          ))}
      </div>
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={hide}
        />
      )}
      )
    </>
  );
}
