"use client";
import { IoAnalyticsOutline } from "react-icons/io5";
import { DiffEditor, type Monaco } from "@monaco-editor/react";
import LanguageSelect from "@/components/LanguageSelect";
import { useState, useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";

export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [oldLines, setOldLines] = useState(1);
  const [newLines, setNewLines] = useState(1);
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
      const oldCode = editorRef.current?.getOriginalEditor().getValue() ?? "";
      const newCode = editorRef.current?.getModifiedEditor().getValue() ?? "";

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCode, newCode, language }),
      });
      const data = await res.json();
      console.log(data);
    } catch (e) {
      console.log(e);
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
          className="analyze-btn px-3 py-3 flex flex-row items-center gap-3 border-[1]  border-[#acacac73]  "
        >
          <IoAnalyticsOutline size={20} /> Analyze
        </button>
      </div>
    </div>
  );
}
