/**
 * Footer.tsx - Organism Component
 * Footer with company info, links, and social media (TypeScript)
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={` py-20 text-black  md:px-12 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-3 gap-12 mb-16">
          {/* Left Column - Info and Languages */}
          <div className="flex flex-col gap-12">
            {/* INFO Section */}
            <div>
              <h5 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                INFO
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <a href="#" className="transition hover:text-black">
                    PRICING
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-black">
                    ABOUT
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-black">
                    CONTACTS
                  </a>
                </li>
              </ul>
            </div>

            {/* LANGUAGES Section */}
            <div>
              <h5 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                LANGUAGES
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <a href="#" className="transition hover:text-black">
                    ENG
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-black">
                    ESP
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-black">
                    SVE
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Center Column - Logo and QR */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src="/icons/brandlogo.svg"
                alt="logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Column - Technologies */}
          <div className="flex flex-col items-center gap-12">
            <div>
              <h5 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                TECHNOLOGIES
              </h5>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-300">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>&copy; 2026 — nocopyright</p>
            <a href="#" className="transition hover:text-black">
              privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
