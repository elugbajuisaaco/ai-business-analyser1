"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Upload", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Ask AI", path: "/ask" },
    { name: "Results", path: "/results" },
    { name: "Compare", path: "/compare" },
  ];

  return (
    <nav className="relative bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold tracking-wide">AI Business Analyser</div>
      <button type="button" className="md:hidden" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Close navigation" : "Open navigation"}>
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <div className={`${isOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-4 bg-slate-900 px-6 py-4 md:static md:flex md:flex-row md:space-x-6 md:gap-0`}>
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                isActive ? "text-blue-400 underline underline-offset-4" : "text-slate-300"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}