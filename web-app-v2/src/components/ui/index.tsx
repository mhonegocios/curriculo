import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/* ═══════════════════════════════════════════════════════
   Componentes UI Reutilizables — Diseño Curricular V2
   ═══════════════════════════════════════════════════════ */

/* ── Tarjeta ──────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    glow?: boolean;
}

export function Card({ children, className, glow, style, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl p-5 transition-all',
                glow && 'animate-pulse-glow',
                className,
            )}
            style={{
                background: 'var(--surface-1)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-subtle)',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
}

/* ── Botón ────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/20',
    brand: 'bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 text-white shadow-lg shadow-brand-500/20 border border-brand-400/50',
    secondary: 'bg-surface-3 hover:bg-surface-4 text-text-primary border-theme-btn',
    ghost: 'bg-transparent hover-overlay text-text-secondary hover:text-text-primary',
    danger: 'bg-red-600/80 hover:bg-red-500 text-white',
};

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
    return (
        <button
            className={clsx(
                'inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'active:scale-[0.97]',
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            disabled={disabled || loading}
            style={variant === 'secondary' ? { borderColor: 'var(--border-subtle)' } : undefined}
            {...props}
        >
            {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon ? (
                <span className="shrink-0">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}

/* ── Campo de Entrada ─────────────────────────────────── */
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
}

export function Input({ label, helperText, error, className, id, ...props }: InputFieldProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={clsx(
                    'w-full px-4 py-2.5 rounded-xl border text-sm',
                    'bg-surface-2 text-text-primary placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
                    className,
                )}
                style={{ borderColor: error ? 'rgb(239 68 68 / 0.5)' : 'var(--border-subtle)' }}
                {...props}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
        </div>
    );
}

/* ── Selector ─────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    helperText?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export function Select({ label, helperText, error, className, id, options, placeholder, ...props }: SelectProps) {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    className={clsx(
                        'w-full px-4 py-2.5 rounded-xl border text-sm appearance-none',
                        'bg-surface-2 text-text-primary',
                        'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
                        className,
                    )}
                    style={{ borderColor: error ? 'rgb(239 68 68 / 0.5)' : 'var(--border-subtle)' }}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface-2 text-text-primary">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
        </div>
    );
}

/* ── Insignia ─────────────────────────────────────────── */
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'brand';
    className?: string;
}

const badgeVariants: Record<string, string> = {
    default: 'bg-surface-3 text-text-secondary',
    success: 'bg-accent-500/15 text-accent-400',
    warning: 'bg-warn-500/15 text-warn-400',
    info: 'bg-brand-500/15 text-brand-400',
    danger: 'bg-red-500/15 text-red-400',
    brand: 'bg-gradient-to-r from-brand-500/20 to-accent-500/20 text-brand-400 border border-brand-500/20',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium', badgeVariants[variant], className)}>
            {children}
        </span>
    );
}

/* ── Pestañas ─────────────────────────────────────────── */
interface TabItem {
    key: string;
    label: string;
    icon?: ReactNode;
}

interface TabsProps {
    items: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
    return (
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--surface-1)' }}>
            {items.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                        activeKey === tab.key
                            ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                            : 'text-text-secondary hover:text-text-primary',
                    )}
                    style={activeKey !== tab.key ? { '--tw-bg-opacity': 0 } as React.CSSProperties : undefined}
                >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}

/* ── Estados de Carga / Error / Vacío ─────────────────── */
export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted">{message}</p>
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">⚠️</div>
            <p className="text-sm text-red-400 max-w-md">{message}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}

export function EmptyState({ icon = '📭', title, description }: { icon?: string; title: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-4xl">{icon}</span>
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            {description && <p className="text-sm text-text-muted max-w-md">{description}</p>}
        </div>
    );
}

/* ── Encabezado de Sección ────────────────────────────── */
export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {action}
        </div>
    );
}

/* ── Modal ────────────────────────────────────────────── */
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl p-6 animate-slide-up"
                style={{
                    background: 'var(--surface-1)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border-subtle)',
                }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl">×</button>
                </div>
                <div>{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
}

/* ── Indicador de Pasos ───────────────────────────────── */
interface StepperProps {
    steps: string[];
    current: number;
}

export function Stepper({ steps, current }: StepperProps) {
    return (
        <div className="flex items-center w-full">
            {steps.map((step, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                            i < current ? 'bg-accent-500 text-white' :
                                i === current ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' :
                                    'bg-surface-3 text-text-muted',
                        )}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        <span className={clsx(
                            'text-[10px] font-medium text-center max-w-[80px] leading-tight',
                            i <= current ? 'text-text-primary' : 'text-text-muted',
                        )}>{step}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={clsx(
                            'flex-1 h-0.5 mx-2 rounded-full transition-all',
                            i < current ? 'bg-accent-500' : 'bg-surface-3',
                        )} />
                    )}
                </div>
            ))}
        </div>
    );
}
