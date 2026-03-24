import { FaLaptopCode } from "react-icons/fa";
import { SiGithub } from "react-icons/si";

export default function Header() {
  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
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
            DiffMind
          </span>
        </div>

        <div className=" flex flex-row items-center gap-5">
          <a
            href="https://github.com/vickynot-10"
            target="_blank"
            className="flex items-center gap-2 text-[#8a8f98] hover:text-white transition"
          >
            <SiGithub size={18} />
          </a>
        </div>
      </header>
    </>
  );
}
