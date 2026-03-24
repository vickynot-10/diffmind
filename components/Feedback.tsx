"use client";
import { useState } from "react";
import { TbX, TbStar, TbStarFilled } from "react-icons/tb";

export default function FeedbackModal({ onClose }: any) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  async function submitFeedback() {
    if (!message.trim()) return;

    try {
      setLoading(true);

      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, rating }),
      });

      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#0f1011] border border-[#34343a] rounded-xl p-5 flex flex-col gap-4">
    
        <div className="flex justify-between items-center">
          <span className="text-white text-sm font-medium">
            Feedback
          </span>
          <button onClick={onClose}>
            <TbX />
          </button>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)}>
              {i <= rating ? (
                <TbStarFilled className="text-yellow-400" />
              ) : (
                <TbStar className="text-[#62666d]" />
              )}
            </button>
          ))}
        </div>

        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What confused you? (anonymous)"
          className="bg-[#141516] border border-[#23252a] rounded-lg p-3 text-sm text-white outline-none resize-none h-24"
        />

       
        <button
          onClick={submitFeedback}
          disabled={loading}
          className="bg-white text-black py-2 rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}