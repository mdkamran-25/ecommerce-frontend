/**
 * Layout.tsx - Organism Component
 * Main layout wrapper for all pages (TypeScript)
 */

import React from "react";
import Head from "next/head";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "XIV - Modern Fashion Store",
  description = "Discover our curated collection of modern fashion",
  keywords = "fashion, clothing, modern style",
  robots = "index, follow",
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <main className="grow">{children}</main>
      </div>
    </>
  );
};

export default Layout;
