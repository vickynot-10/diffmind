"use client";
import { IoAnalyticsOutline } from "react-icons/io5";
import { DiffEditor, type Monaco } from "@monaco-editor/react";
import LanguageSelect from "@/components/LanguageSelect";
import { useState, useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import Loader from "./Loader";
export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [oldLines, setOldLines] = useState(1);
  const [newLines, setNewLines] = useState(1);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const mountedRef = useRef(false);

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
      const newCode = editorRef.current?.getModifiedEditor().getValue() ?? "";

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCode, newCode, language }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.analysis);
      setAnalysis(parsed);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-15 px-5">
      <div className="flex flex-row w-full items-center gap-3">
        <span className="text-[#8a8f98] text-[13px]">Language</span>
        <LanguageSelect onSelect={(val: string) => SetnewLanguage(val)} />
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
            original={`
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
}`}
            modified={`
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
}`}
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

      <div>
        <button
          onClick={AnalyzeCode}
          disabled={loading}
          className="analyze-btn px-3 py-3 flex flex-row items-center justify-center gap-3 border border-[#acacac73] disabled:cursor-not-allowed disabled:opacity-50"
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
      bg-[#0f1011] border border-[#34343a] rounded-lg p-4
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
  );
}
