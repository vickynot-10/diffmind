"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MdPeople, MdStorefront, MdBarChart } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { FiPieChart, FiChevronDown } from "react-icons/fi";


const nav_items = [
  { id: 1, icon: FiPieChart, label: "Dashboard", url: "/" },
  { id: 2, icon: FaRegFolder, label: "Projects", url: "/projects" },
  { id: 3, icon: MdPeople, label: "Customers", url: "/customers" },
  { id: 4, icon: MdStorefront, label: "Shop", url: "/shop" },
  { id: 5, icon: MdBarChart, label: "Reports", url: "/reports" },
];

const settings_children = [
  { label: "Environments", url: "/settings/environment" },
  { label: "Tags", url: "/settings/tags" },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings"),
  );

  const isSettingsActive = pathname.startsWith("/settings");

  function ToggleSettings() {
    setSettingsOpen((prev) => !prev);
   
  }

  return (
   <div className="flex w-60 bg-white flex-col h-full shrink-0 shadow-[2px_0_12px_0_rgba(0,0,0,0.06)]">
      <span className="text-[22px] text-center px-6 font-bold tracking-tight text-[#1814F3] py-5 ">
        uiboard
      </span>

      <div className="flex flex-col gap-0.5 px-3 py-5 overflow-y-auto flex-1">
        <p className="text-[11px] font-semibold text-[#B1B1B1] tracking-widest uppercase px-3 mb-3">
          Main
        </p>

        {nav_items.map(({ id, icon: Icon, label, url }) => {
          const isActive = pathname === url;
          return (
            <Link
              key={id}
              href={url}
              className="relative flex items-center gap-3.5 px-3 py-3 rounded-lg font-medium text-[15px] transition-colors duration-150"
              style={{
                color: isActive ? "#1814F3" : "#B1B1B1",
                backgroundColor: isActive ? "#E8E7FD" : "transparent",
              }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] rounded-r-full bg-[#1814F3]" />
              )}
              <Icon size={20} color={isActive ? "#1814F3" : "#B1B1B1"} />
              {label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-[#E6EFF5]" />

        <p className="text-[11px] font-semibold text-[#B1B1B1] tracking-widest uppercase px-3 mb-3">
          Apps
        </p>

        <div>
          <button
            onClick={ToggleSettings}
            className="relative w-full flex items-center justify-between px-3 py-3 rounded-lg font-medium text-[15px] transition-colors duration-150"
            style={{
              color: isSettingsActive ? "#1814F3" : "#B1B1B1",
              backgroundColor: isSettingsActive ? "#E8E7FD" : "transparent",
            }}
          >
            {isSettingsActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] rounded-r-full bg-[#1814F3]" />
            )}
            <span className="flex items-center gap-3.5">
              <IoSettingsOutline
                size={20}
                color={isSettingsActive ? "#1814F3" : "#B1B1B1"}
              />
              Settings
            </span>
            <FiChevronDown
              size={14}
              color="#B1B1B1"
              style={{
                transform: settingsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.25s ease",
              }}
            />
          </button>

          <div
            style={{
              overflow: "hidden",
              maxHeight: settingsOpen ? "200px" : "0px",
              transition: "max-height 0.25s ease",
            }}
          >
            <div className="ml-8 mt-1 flex flex-col gap-0.5 pb-1">
              {settings_children.map(({ label, url }) => {
                const isActive = pathname === url;
                return (
                  <Link
                    key={url}
                    href={url}
                    className="flex items-center gap-2.5 px-2 py-2.5 rounded-md text-[13px] font-medium transition-colors duration-150"
                    style={{
                      color: isActive ? "#1814F3" : "#B1B1B1",
                      backgroundColor: isActive ? "#E8E7FD" : "transparent",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isActive ? "#1814F3" : "#B1B1B1",
                      }}
                    />
                   
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
