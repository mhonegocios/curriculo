import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

/* ═══════════════════════════════════════════════════════
   AppLayout — Shell principal con sidebar y contenido
   ═══════════════════════════════════════════════════════ */

export function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <main
                className={`transition-all duration-300 min-h-screen p-6 md:p-8
          ${collapsed ? 'ml-[72px]' : 'ml-[280px]'}`}
            >
                <Outlet />
            </main>
            <Toaster theme="dark" richColors position="top-right" />
        </div>
    );
}
