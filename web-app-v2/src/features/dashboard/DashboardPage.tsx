import { Link } from 'react-router-dom';
import { Card, Badge } from '../../components/ui';
import {
    Search, Hammer, BookMarked, GraduationCap, Route,
    Sparkles, ArrowRight, TrendingUp, BookOpen, Award, LayoutGrid,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Panel Principal — Dashboard V2
   ═══════════════════════════════════════════════════════ */

interface ModuloRapido {
    titulo: string;
    desc: string;
    ruta: string;
    icono: React.ReactNode;
    color: string;
    disponible: boolean;
}

const MODULOS: ModuloRapido[] = [
    {
        titulo: 'Explorador MNC',
        desc: 'Navega las cualificaciones del Marco Nacional',
        ruta: '/explorador',
        icono: <Search size={24} />,
        color: 'from-blue-500/20 to-purple-600/20',
        disponible: true,
    },
    {
        titulo: 'Constructor Microcredenciales',
        desc: 'Diseña microcredenciales basadas en RAs',
        ruta: '/edu-continua/constructor',
        icono: <Hammer size={24} />,
        color: 'from-emerald-500/20 to-teal-600/20',
        disponible: true,
    },
    {
        titulo: 'Catálogo Microcredenciales',
        desc: 'Consulta microcredenciales creadas',
        ruta: '/edu-continua/catalogo',
        icono: <BookMarked size={24} />,
        color: 'from-amber-500/20 to-orange-600/20',
        disponible: true,
    },
    {
        titulo: 'Programas ETDH',
        desc: 'Diseña programas técnicos laborales',
        ruta: '/programas/nuevo',
        icono: <GraduationCap size={24} />,
        color: 'from-rose-500/20 to-pink-600/20',
        disponible: false,
    },
    {
        titulo: 'Rutas Formativas',
        desc: 'Construye trayectorias de aprendizaje',
        ruta: '/rutas/constructor',
        icono: <Route size={24} />,
        color: 'from-cyan-500/20 to-sky-600/20',
        disponible: false,
    },
    {
        titulo: 'Módulos IA',
        desc: 'Generación inteligente de contenidos',
        ruta: '/ia/contenidos',
        icono: <Sparkles size={24} />,
        color: 'from-violet-500/20 to-indigo-600/20',
        disponible: false,
    },
];

const ESTADISTICAS = [
    { label: 'Cualificaciones MNC', valor: '8', icono: <Award size={20} />, color: 'text-brand-400' },
    { label: 'Competencias', valor: '26', icono: <BookOpen size={20} />, color: 'text-accent-400' },
    { label: 'Resultados de Aprendizaje', valor: '91', icono: <TrendingUp size={20} />, color: 'text-warn-400' },
    { label: 'Módulos Activos', valor: '3', icono: <LayoutGrid size={20} />, color: 'text-emerald-400' },
];

export function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-white/[0.06]"
                style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-surface-1))' }}>
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-accent-500/5 blur-3xl" />
                <div className="relative">
                    <Badge variant="info">Plataforma Educativa v2</Badge>
                    <h1 className="text-3xl md:text-4xl font-bold mt-4 text-text-primary leading-tight">
                        Diseño Curricular<br />
                        <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                            Inteligente
                        </span>
                    </h1>
                    <p className="text-text-secondary mt-3 max-w-xl text-base leading-relaxed">
                        Automatiza el diseño curricular basado en el Marco Nacional de Cualificaciones
                        de Colombia. Microcredenciales, programas técnicos y rutas formativas.
                    </p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ESTADISTICAS.map((stat) => (
                    <Card key={stat.label}>
                        <div className="flex items-center gap-3">
                            <div className={`${stat.color}`}>{stat.icono}</div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{stat.valor}</p>
                                <p className="text-xs text-text-muted">{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Módulos */}
            <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">Módulos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MODULOS.map((modulo) => (
                        <Link
                            key={modulo.titulo}
                            to={modulo.disponible ? modulo.ruta : '#'}
                            onClick={(e) => { if (!modulo.disponible) e.preventDefault(); }}
                            className={`group block ${!modulo.disponible ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Card className="h-full hover:border-brand-500/30 transition-all group-hover:scale-[1.01]">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${modulo.color} flex items-center justify-center text-text-primary mb-4`}>
                                    {modulo.icono}
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-text-primary">{modulo.titulo}</h3>
                                    {!modulo.disponible && <Badge>Próximamente</Badge>}
                                </div>
                                <p className="text-sm text-text-muted mt-1 leading-relaxed">{modulo.desc}</p>
                                {modulo.disponible && (
                                    <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                                        Abrir <ArrowRight size={14} />
                                    </div>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
