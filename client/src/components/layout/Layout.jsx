import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="flex h-screen max-w-full overflow-hidden bg-background font-sans text-foreground selection:bg-none select-none">
            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isMobile={isMobile}
            />

            {/* Main Content Area */}
            <main
                className={`flex h-full min-w-0 max-w-full flex-1 flex-col transition-all duration-300 ease-in-out ${
                    isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'
                }`}
            >
                {/* Mobile Top Bar */}
                {isMobile && (
                    <header className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md shadow-sm">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                            aria-label="Toggle navigation"
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                            WorkNest
                        </span>

                        {/* Right spacer — keeps title centered */}
                        <div className="h-9 w-9" />
                    </header>
                )}

                {/* Scrollable Content */}
                <div className="relative w-full max-w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <Outlet context={{ isSidebarOpen, isMobile }} />
                </div>
            </main>
        </div>
    );
};

export default Layout;
