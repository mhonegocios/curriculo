import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { ArrowLeft, Clock } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Página Próximamente — Para módulos no implementados
   ═══════════════════════════════════════════════════════ */

export function ComingSoonPage({ titulo }: { titulo: string }) {
    return (
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 flex items-center justify-center border border-white/[0.06]">
                <Clock size={36} className="text-brand-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-text-primary">{titulo}</h1>
                <p className="text-text-muted mt-2 leading-relaxed">
                    Este módulo está en desarrollo y estará disponible próximamente.<br />
                    Mientras tanto, explora las funcionalidades ya disponibles.
                </p>
            </div>
            <Link to="/">
                <Button variant="secondary" icon={<ArrowLeft size={16} />}>
                    Volver al Panel Principal
                </Button>
            </Link>
        </div>
    );
}
