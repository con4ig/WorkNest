import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Responsive check logic
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            // Auto open on desktop, auto close on mobile
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
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground selection:bg-none select-none">
            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm transition-opacity"
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
                className={`flex h-full flex-1 flex-col transition-all duration-300 ease-in-out ${
                    isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'
                }`}
            >
                {/* Scrollable Content */}
                <div className="relative w-full flex-1 overflow-y-auto overflow-x-hidden">
                    <Outlet context={{ isSidebarOpen, isMobile }} />
                </div>
            </main>
        </div>
    );
};

export default Layout;

