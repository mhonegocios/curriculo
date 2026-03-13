import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
    ChevronLeft, ChevronRight, LayoutDashboard, Search, GraduationCap, BookMarked,
    Hammer, FolderOpen, Route, Puzzle,
    Sun, Moon, Settings
} from 'lucide-react';
import { SettingsModal } from '../components/admin/SettingsModal';
import { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   Sidebar — Navegación Principal V2
   ═══════════════════════════════════════════════════════ */

interface NavItem {
    to: string;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    soon?: boolean;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
    {
        title: 'Explorador MNC',
        items: [
            { to: '/explorador', label: 'Explorador de Cualificaciones', shortLabel: 'Explorador', icon: <Search size={20} /> },
        ],
    },
    {
        title: 'Educación Continua',
        items: [
            { to: '/edu-continua/constructor', label: 'Constructor', shortLabel: 'Constructor', icon: <Hammer size={20} /> },
            { to: '/edu-continua/catalogo', label: 'Catálogo', shortLabel: 'Catálogo', icon: <BookMarked size={20} /> },
        ],
    },
    {
        title: 'Programas ETDH',
        items: [
            { to: '/programas/nuevo', label: 'Nuevo Programa', shortLabel: 'Nuevo', icon: <GraduationCap size={20} /> },
            { to: '/programas', label: 'Mis Programas', shortLabel: 'Programas', icon: <FolderOpen size={20} /> },
        ],
    },
    {
        title: 'Rutas Formativas',
        items: [
            { to: '/rutas/constructor', label: 'Constructor de Rutas', shortLabel: 'Constructor', icon: <Puzzle size={20} /> },
            { to: '/rutas', label: 'Mis Rutas', shortLabel: 'Rutas', icon: <Route size={20} /> },
        ],
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const { theme, toggleTheme } = useTheme();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <aside
            className={`fixed top-0 left-0 h-screen z-40 flex flex-col
        transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-[280px]'}`}
            style={{
                background: 'var(--surface-1)',
                borderRight: '1px solid var(--border-subtle)',
            }}
        >
            {/* Logo / Marca */}
            <div className="flex items-center gap-3 px-4 h-16 shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                    DC
                </div>
                {!collapsed && (
                    <div className="animate-fade-in overflow-hidden">
                        <h1 className="text-sm font-semibold text-text-primary truncate">Diseño Curricular</h1>
                        <p className="text-xs text-text-muted truncate">Inteligente v2</p>
                    </div>
                )}
            </div>

            {/* Navegación */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {/* Dashboard */}
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isActive
                            ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`
                    }
                    style={({ isActive }) => (!isActive ? { ['--hover-bg' as string]: 'var(--hover-overlay)' } : undefined)}
                >
                    <LayoutDashboard size={20} className="shrink-0" />
                    {!collapsed && <span className="truncate">Panel Principal</span>}
                </NavLink>

                {/* Secciones */}
                {NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                        <div className="my-3 mx-3" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                        {!collapsed && (
                            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                                {section.title}
                            </p>
                        )}
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => {
                                    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                    ${item.soon ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isActive && !item.soon
                                            ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }`;
                                }}
                                onClick={(e) => { if (item.soon) e.preventDefault(); }}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className="truncate flex-1">{item.shortLabel}</span>
                                        {item.soon && (
                                            <span className="text-[10px] bg-surface-3 text-text-muted px-1.5 py-0.5 rounded-md font-medium">
                                                Próx.
                                            </span>
                                        )}
                                    </>
                                )}
                                {/* Tooltip para estado colapsado */}
                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 glass text-text-primary shadow-xl">
                                        {item.shortLabel}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Tema, Configuración y Colapsar */}
            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                    onClick={() => setShowSettings(true)}
                    className={`w-full flex items-center gap-3 px-4 h-12 text-text-muted hover:text-text-primary transition-colors cursor-pointer
            ${collapsed ? 'justify-center' : ''}`}
                    title="Configuración de Entorno"
                >
                    <Settings size={18} />
                    {!collapsed && <span className="text-sm font-medium">Configuración</span>}
                </button>
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-4 h-12 text-text-muted hover:text-text-primary transition-colors cursor-pointer
            ${collapsed ? 'justify-center' : ''}`}
                    title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    {!collapsed && <span className="text-sm font-medium">Modo {theme === 'dark' ? 'Claro' : 'Oscuro'}</span>}
                </button>
                <button
                    onClick={onToggle}
                    className="w-full shrink-0 flex items-center justify-center h-12 text-text-muted hover:text-text-primary cursor-pointer"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Modal de Configuración */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </aside>
    );
}
