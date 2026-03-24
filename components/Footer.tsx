export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 py-4 text-center text-sm text-[#62666d]">
      © {new Date().getFullYear()} Built by Vicky •{" "}
      <a
        href="https://github.com/vickynot-10"
        target="_blank"
        className="ml-1 text-[#8a8f98] hover:text-white"
      >
        GitHub
      </a>
    </footer>
  );
}