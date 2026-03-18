"use client";
import { FaJava } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import {
    SiJavascript,
    SiTypescript,
    SiPython,
    SiGo,
    SiRust,
    SiCplusplus,
    SiRuby,
} from "react-icons/si";
import { TbChevronDown, TbCheck } from "react-icons/tb";

const languages = [
    {
        value: "javascript",
        label: "JavaScript",
        icon: SiJavascript,
        color: "text-yellow-400",
    },
    {
        value: "typescript",
        label: "TypeScript",
        icon: SiTypescript,
        color: "text-blue-400",
    },
    { value: "python", label: "Python", icon: SiPython, color: "text-blue-400" },
    { value: "go", label: "Go", icon: SiGo, color: "text-cyan-400" },
    { value: "rust", label: "Rust", icon: SiRust, color: "text-orange-400" },
    { value: "cpp", label: "C++", icon: SiCplusplus, color: "text-blue-400" },
    { value: "java", label: "Java", icon: FaJava, color: "text-orange-400" },
    { value: "ruby", label: "Ruby", icon: SiRuby, color: "text-red-400" },
];

type Language = (typeof languages)[number];

type LanguageSelectProps = {
    onSelect: (val: string) => void;
};

export default function LanguageSelect({ onSelect }: LanguageSelectProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Language>(languages[0]);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const SelectedIcon = selected.icon;

    return (
        <div ref={ref} className="relative inline-block min-w-44">
            <button
                onClick={() => setOpen((v) => !v)}
                className={[
                    "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg outline-none cursor-pointer",
                    "border transition-all duration-150",
                    open
                        ? "border-[rgba(113,112,255,0.45)] bg-[rgba(113,112,255,0.07)] shadow-[0_0_0_3px_rgba(113,112,255,0.12)]"
                        : "border-white/10 bg-white/4 hover:border-white/18 hover:bg-white/6",
                ].join(" ")}
            >
                <SelectedIcon size={14} className={`shrink-0 ${selected.color}`} />
                <span className="flex-1 text-left text-[13px] font-medium text-[#d0d6e0] tracking-tight">
                    {selected.label}
                </span>
                <TbChevronDown
                    size={13}
                    className={`shrink-0 text-[#62666d] transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                />
            </button>

            <div
                className={[
                    "absolute top-[calc(100%+6px)] left-0 right-0 z-50 p-1",
                    "rounded-[10px] border border-white/9 bg-[#141516]",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]",
                    "origin-top transition-all duration-180 ease-in-out",
                    open
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-1.5 scale-[0.98] pointer-events-none",
                ].join(" ")}
            >
                {languages.map((lang) => {
                    const Icon = lang.icon;
                    const isSelected = selected.value === lang.value;

                    return (
                        <button
                            key={lang.value}
                            onClick={() => {
                                setSelected(lang);
                                setOpen(false);
                                
                                 onSelect(lang.value);
                            }}
                            className={[
                                "flex items-center gap-2.5 w-full px-2.5 py-1.75 rounded-md",
                                "border-none outline-none cursor-pointer transition-colors duration-100",
                                isSelected
                                    ? "bg-[rgba(113,112,255,0.08)]"
                                    : "bg-transparent hover:bg-white/6",
                            ].join(" ")}
                        >
                            <Icon
                                size={14}
                                className={`shrink-0 ${lang.color} ${isSelected ? "opacity-100" : "opacity-75"}`}
                            />
                            <span
                                className={[
                                    "flex-1 text-left text-[13px] tracking-tight transition-colors duration-100",
                                    isSelected
                                        ? "font-medium text-[#f7f8f8]"
                                        : "font-normal text-[#8a8f98]",
                                ].join(" ")}
                            >
                                {lang.label}
                            </span>
                            {isSelected && (
                                <TbCheck size={13} className="text-[#7170ff] shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
