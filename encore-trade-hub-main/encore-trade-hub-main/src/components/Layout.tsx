import { ReactNode } from 'react';
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TickerTape from "./TickerTape";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--tv-background)]">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <TickerTape />
      </header>
      <main className="pt-[104px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
