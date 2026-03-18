import { FaLaptopCode } from "react-icons/fa";
export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6"
      style={{
        height: "48px",
        background:
          "linear-gradient(180deg, rgba(11,11,11,0.90) 0%, rgba(11,11,11,0.85) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <FaLaptopCode size={20} />
        <span
          className="text-white text-[18px] font-medium"
          style={{
            letterSpacing: "-1.5",
          }}
        >
          Code Sense
        </span>
      </div>
    </header>
  );
}
