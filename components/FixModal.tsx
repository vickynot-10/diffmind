"use client";

import { memo, useState } from "react";
import { TbX, TbCheck, TbCopy } from "react-icons/tb";

type Fix = {
  title: string;
  description: string;
  code: string;
};

type FixModalProps = {
  item: {
    name: string;
    severity: string;
    summary: string;
    details: string;
    risk: string;
    fixes?: Fix[];
  };
  onClose: () => void;
};

function FixModal({ item, onClose }: FixModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

 function copyCode(code: string, index: number) {
  navigator.clipboard.writeText(code.replace(/\\n/g, "\n"))
  setCopiedIndex(index)
  setTimeout(() => setCopiedIndex(null), 2000)
}
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-[#34343a] bg-[#0f1011] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#23252a]">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded border capitalize
              ${item.severity === "breaking" ? "bg-[rgba(235,87,87,0.12)] text-[#ff8583] border-[rgba(235,87,87,0.2)]" : ""}
              ${item.severity === "warning" ? "bg-[rgba(240,191,0,0.1)] text-[#ffd500] border-[rgba(240,191,0,0.2)]" : ""}
              ${item.severity === "info" ? "bg-[rgba(113,112,255,0.1)] text-[#828fff] border-[rgba(113,112,255,0.2)]" : ""}
            `}
            >
              {item.severity}
            </span>
            <span className="font-mono text-[14px] text-[#f7f8f8]">
              {item.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#62666d] hover:text-[#f7f8f8] hover:bg-white/6 transition-colors cursor-pointer border-none outline-none bg-transparent"
          >
            <TbX size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#62666d] uppercase tracking-wider font-medium">
              Summary
            </span>
            <p className="text-[13px] text-[#d0d6e0] leading-relaxed">
              {item.summary}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#62666d] uppercase tracking-wider font-medium">
              Details
            </span>
            <p className="text-[13px] text-[#8a8f98] leading-relaxed">
              {item.details}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#62666d] uppercase tracking-wider font-medium">
              Action needed
            </span>
            <div className="bg-[#141516] border border-[#23252a] rounded-lg px-3 py-2.5">
              <p className="text-[12px] text-[#8a8f98] leading-relaxed">
                <span className="text-[#d0d6e0] font-medium">Risk: </span>
                {item.risk}
              </p>
            </div>
          </div>

          {item.fixes && item.fixes.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] text-[#62666d] uppercase tracking-wider font-medium">
                Possible fixes ({item.fixes.length})
              </span>
              {item.fixes.map((fix, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border border-[#23252a] rounded-lg overflow-hidden"
                >
                  <div className="flex items-start justify-between px-4 py-3 bg-[#141516]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-[#f7f8f8]">
                        {fix.title}
                      </span>
                      <span className="text-[11px] text-[#8a8f98] leading-relaxed">
                        {fix.description}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0b] border-t border-[#23252a]">
                      <span className="text-[10px] text-[#3e3e44] font-mono uppercase tracking-wider">
                        code
                      </span>
                      <button
                        onClick={() => copyCode(fix.code, index)}
                        className={[
                          "flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all duration-150 cursor-pointer border outline-none",
                          copiedIndex === index
                            ? "bg-[rgba(39,166,68,0.1)] text-[#43bc58] border-[rgba(39,166,68,0.2)]"
                            : "bg-transparent text-[#62666d] border-[#34343a] hover:text-[#d0d6e0] hover:border-[#3e3e44]",
                        ].join(" ")}
                      >
                        {copiedIndex === index ? (
                          <>
                            <TbCheck size={11} /> Copied
                          </>
                        ) : (
                          <>
                            <TbCopy size={11} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  <pre className="px-4 py-3 overflow-x-auto bg-[#0a0a0b] text-[12px] text-[#d0d6e0] font-mono leading-relaxed border-t border-[#23252a] m-0 whitespace-pre">
  <code>{fix.code.replace(/\\n/g, "\n")}</code>
</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(FixModal);
