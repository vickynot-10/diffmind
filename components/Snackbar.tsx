"use client";

import { memo, useEffect, useState } from "react";
import { TbCheck, TbX, TbAlertTriangle } from "react-icons/tb";

type SnackbarType = "success" | "error";

type SnackbarProps = {
  message: string;
  type: SnackbarType;
  duration?: number;
  onClose: () => void;
};

 function Snackbar({
  message,
  type,
  duration = 4000,
  onClose,
}: SnackbarProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [duration, onClose]);

  function handleClose() {
    setLeaving(true);
    setTimeout(onClose, 300);
  }

  const isSuccess = type === "success";

  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "border shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 ease-in-out",
        "min-w-70 max-w-120",
        isSuccess
          ? "bg-[#0f1a12] border-[rgba(39,166,68,0.25)]"
          : "bg-[#1a0f0f] border-[rgba(235,87,87,0.25)]",
        visible && !leaving
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      <div
        className={[
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
          isSuccess ? "bg-[rgba(39,166,68,0.15)]" : "bg-[rgba(235,87,87,0.15)]",
        ].join(" ")}
      >
        {isSuccess ? (
          <TbCheck size={14} className="text-[#43bc58]" />
        ) : (
          <TbAlertTriangle size={14} className="text-[#ff8583]" />
        )}
      </div>

      <p
        className={[
          "flex-1 text-[13px] font-medium tracking-tight",
          isSuccess ? "text-[#a3e6b0]" : "text-[#ffb3b0]",
        ].join(" ")}
      >
        {message}
      </p>

      <button
        onClick={handleClose}
        className={[
          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
          "transition-colors duration-100 cursor-pointer border-none outline-none",
          isSuccess
            ? "text-[#3b6d44] hover:bg-[rgba(39,166,68,0.1)] hover:text-[#43bc58]"
            : "text-[#6d3b3b] hover:bg-[rgba(235,87,87,0.1)] hover:text-[#ff8583]",
        ].join(" ")}
      >
        <TbX size={13} />
      </button>

      <div
        className={[
          "absolute bottom-0 left-0 h-0.5 rounded-b-xl",
          isSuccess ? "bg-[#27a644]" : "bg-[#eb5757]",
        ].join(" ")}
        style={{
          animation: `shrink ${duration}ms linear forwards`,
          width: "100%",
        }}
      />

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}


export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: SnackbarType;
  } | null>(null);

  function show(message: string, type: SnackbarType) {
    setSnackbar({ message, type });
  }

  function hide() {
    setSnackbar(null);
  }

  return { snackbar, show, hide };
}
export default memo(Snackbar)