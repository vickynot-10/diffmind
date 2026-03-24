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
import FixModal from "./FixModal";
import { IoPlay } from "react-icons/io5";
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

  const [url, setUrl] = useState("");
  const [oldCode, setOldCode] = useState("// Paste Your Old Code Here");
  const [newCode, setNewCode] = useState("//  Paste Your New Code Here");
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

      if (
        !oldCode ||
        !oldCode.length ||
        !oldCode.trim() ||
        oldCode.replace(/\s/g, "").trim() === ""
      ) {
        return show("Original Code is Required", "error");
      }

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
    setOldCode("");
    setNewCode("");
  }

  function handleSubmit() {
    if (!url.trim()) return;

    GetGithubRepo();
  }

  const [ghLoading, setGhLoading] = useState(false);
  const [prFiles, setPrFiles] = useState<any[]>([]);
  const [prMeta, setPrMeta] = useState<any>(null);
  async function GetGithubRepo() {
    try {
      setGhLoading(true);
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.error, "error");

      setPrFiles(data.files);
      setPrMeta({ owner: data.owner, repo: data.repo, baseSha: data.baseSha });

      show(
        `Found ${data.files.length} file${data.files.length > 1 ? "s" : ""}`,
        "success",
      );
    } catch (e: any) {
      show(e.message ?? "Error fetching PR", "error");
    } finally {
      setGhLoading(false);
    }
  }

  const [fileLoading, setFileLoading] = useState(false);

  async function loadFile(file: any) {
    try {
      setAnalysis([]);
      setGhLoading(true);
      setFileLoading(true);
      const ext = file.filename.split(".").pop() ?? "js";
      const EXT_TO_LANG: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        go: "go",
        rs: "rust",
        java: "java",
        cpp: "cpp",
        rb: "ruby",
      };

      const res = await fetch("/api/github/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_url: file.raw_url,
          filename: file.filename,
          owner: prMeta.owner,
          repo: prMeta.repo,
          baseSha: prMeta.baseSha,
        }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.error, "error");

      setLanguage(EXT_TO_LANG[ext] ?? "javascript");
      setOldCode(data.oldCode);
      setNewCode(data.newCode);

      show(`Loaded ${file.filename}`, "success");
    } catch (e: any) {
      show(e.message ?? "Error loading file", "error");
    } finally {
      setFileLoading(false);
      setGhLoading(false);
    }
  }

  function SaveGhUrl(e: any) {
    setUrl(e.target.value);
  }

  function ClearGHUrl() {
    setUrl("");
  }

  function AddDemoCode() {
    setOldCode(`function fetchUser(id) {
  const user = db.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
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
}`);

    setNewCode(`async function fetchUser(id) {
  const cached = await cache.get(id);
  if (cached) return cached;

  const user = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  await cache.set(id, user, 300);
  logger.info('cache miss', { id });
  return user;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

async function sendEmail(to, subject, message) {
  await mailer.send({ to, subject, body: message });
  logger.info('email sent', { to });
}`);

    setTimeout(() => {
      AnalyzeCode();
    }, 500);
  }

  return (
    <>
      <div className="flex flex-col gap-5 pt-15 px-5">
        <div className="flex flex-row w-full items-center gap-3">
          <span className="text-[#8a8f98] text-[13px]">Language</span>
          <LanguageSelect onSelect={(val: string) => SetnewLanguage(val)} />

          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="flex items-center gap-2 w-full border border-white/10 bg-white/4 rounded-lg px-3 py-1.5 focus-within:border-white/25 focus-within:bg-white/6 transition-all duration-150">
              <SiGithub size={13} className="text-[#8a8f98] shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => SaveGhUrl(e)}
                placeholder="github.com/org/repo/pull/123"
                className="flex-1 bg-transparent outline-none border-none text-[12px] text-[#d0d6e0] placeholder:text-[#3e3e44] min-w-0"
              />
              {url && (
                <button
                  onClick={ClearGHUrl}
                  className="text-[#62666d] hover:text-[#8a8f98] transition-colors cursor-pointer border-none outline-none bg-transparent shrink-0"
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
              {ghLoading ? <Loader /> : <TbArrowRight size={13} />}
            </button>
          </div>
        </div>

        <div>
          {prFiles.length > 0 && (
            <div className="flex flex-col gap-2 p-3 rounded-[10px] border border-white/8 bg-[#0f1011]">
              <span className="text-[11px] text-[#62666d] uppercase tracking-wider font-medium">
                Select file to analyze
              </span>
              {prFiles.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => loadFile(file)}
                  disabled={fileLoading}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#34343a] bg-[#141516] hover:border-[#3e3e44] hover:bg-[#1c1c1f] text-left transition-colors duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="font-mono text-[12px] text-[#d0d6e0]">
                    {file.filename}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-green-400/70">
                      +{file.additions}
                    </span>
                    <span className="text-[11px] text-red-400/70">
                      -{file.deletions}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        file.status === "modified"
                          ? "bg-[rgba(240,191,0,0.1)] text-[#ffd500]"
                          : file.status === "added"
                            ? "bg-[rgba(39,166,68,0.1)] text-[#43bc58]"
                            : "bg-[rgba(235,87,87,0.1)] text-[#ff8583]"
                      }`}
                    >
                      {file.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="  flex flex-row  justify-between mt-2">
          <div className=" text-[12px] text-[#8a8f98]  m-0">
            Compare two versions of your code or paste a
            <span className="text-[#d0d6e0]"> GitHub PR URL</span> to analyze
            changes
          </div>

          <div className=" flex flex-row items-center gap-3">
            <button
              onClick={clearCode}
              className="analyze-btn px-3 py-2 flex flex-row items-center justify-center gap-3 border border-[#acacac73] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdClear size={20} /> Clear
            </button>

            <button
              onClick={AddDemoCode}
              disabled={loading}
              className="analyze-btn px-3 py-2 flex flex-row items-center justify-center gap-3 border border-[#acacac73] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IoPlay size={20} />
              Try Now
            </button>
          </div>
        </div>
        {fileLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 min-h-100 bg-[#1e1e1e]">
            <Loader />
            <span className="text-[12px] text-[#62666d]">Loading file...</span>
          </div>
        ) : (
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
                original={oldCode}
                modified={newCode}
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
        )}

        <div className=" flex flex-row items-center gap-5 justify-end">
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
        text-[10px] font-medium px-2 py-0.5 rounded capitalize
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
              <div className="flex items-center justify-between mt-3">
                <div className="bg-[#141516] rounded-md p-2 border border-[#23252a] flex-1">
                  <p className="text-[11px] text-[#8a8f98]">
                    <span className="text-[#d0d6e0] font-medium">Risk: </span>
                    {item.risk}
                  </p>
                </div>
                {item.fixes && item.fixes.length > 0 && (
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="ml-3 text-[11px] px-3 py-1.5 rounded-lg border border-[#34343a] text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#3e3e44] transition-colors cursor-pointer bg-transparent outline-none"
                  >
                    View fixes →
                  </button>
                )}
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

      {selectedItem && (
        <FixModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
