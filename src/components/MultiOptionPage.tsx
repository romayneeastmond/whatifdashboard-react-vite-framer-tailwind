
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Wallet, Home, BarChart3, Target, Clock, Scale, CreditCard, Check,
    Dumbbell, Flame, CalendarDays, Utensils, TrendingUp, ShieldAlert, Banknote,
    Plus, Pencil, Trash2,
} from 'lucide-react';
import { SalaryCalculator } from './calculators/SalaryCalculator';
import { MortgageCalculator } from './calculators/MortgageCalculator';
import { InvestmentCalculator } from './calculators/InvestmentCalculator';
import { GoalsCalculator } from './calculators/GoalsCalculator';
import { TimeCalculator } from './calculators/TimeCalculator';
import { BardalCalculator } from './calculators/BardalCalculator';
import { DebtCalculator } from './calculators/DebtCalculator';
import { ProteinCalculator } from './calculators/ProteinCalculator';
import { WeightLossCalculator } from './calculators/WeightLossCalculator';
import { DaysBetweenCalculator } from './calculators/DaysBetweenCalculator';
import { CalorieDeficitCalculator } from './calculators/CalorieDeficitCalculator';
import { CareerPathCalculator } from './calculators/CareerPathCalculator';
import { WrongfulDismissalCalculator } from './calculators/WrongfulDismissalCalculator';
import { SeveranceEICalculator } from './calculators/SeveranceEICalculator';
import { Modal } from './ui/Controls';
import { cn } from '../lib/utils';

const REGISTRY = [
    { id: 'salary',            label: 'Salary & Taxes',    icon: Wallet,      component: SalaryCalculator           },
    { id: 'mortgage',          label: 'Mortgage Equity',   icon: Home,        component: MortgageCalculator         },
    { id: 'investing',         label: 'Wealth Growth',     icon: BarChart3,   component: InvestmentCalculator       },
    { id: 'goals',             label: 'Goals Tracking',    icon: Target,      component: GoalsCalculator            },
    { id: 'time',              label: 'Time Allocation',   icon: Clock,       component: TimeCalculator             },
    { id: 'bardal',            label: 'Bardal Factor',     icon: Scale,       component: BardalCalculator           },
    { id: 'debt',              label: 'Debt Repayment',    icon: CreditCard,  component: DebtCalculator             },
    { id: 'daysbetween',       label: 'Days Between',      icon: CalendarDays,component: DaysBetweenCalculator      },
    { id: 'weightloss',        label: 'Weight Loss',       icon: Flame,       component: WeightLossCalculator       },
    { id: 'protein',           label: 'Protein Intake',    icon: Dumbbell,    component: ProteinCalculator          },
    { id: 'calorie',           label: 'Calorie Deficit',   icon: Utensils,    component: CalorieDeficitCalculator   },
    { id: 'careerpath',        label: 'Career Path',       icon: TrendingUp,  component: CareerPathCalculator       },
    { id: 'wrongfuldismissal', label: 'Wrongful Dismissal',icon: ShieldAlert, component: WrongfulDismissalCalculator},
    { id: 'severanceei',       label: 'Severance & EI',    icon: Banknote,    component: SeveranceEICalculator      },
] as const;

type CalcId = typeof REGISTRY[number]['id'];
type Layout = 'full' | 'split' | 'split-33-66' | 'split-66-33' | 'split-33-33-33' | 'masonry';

interface Dashboard {
    id: string;
    name: string;
    layout: Layout;
    calculators: CalcId[];
    compact: boolean;
    stretch: boolean;
    selectorHidden: boolean;
}

const LAYOUTS: { id: Layout; label: string; title: string }[] = [
    { id: 'full',           label: 'Full',    title: 'Full width'       },
    { id: 'split',          label: '50/50',   title: '2-column split'   },
    { id: 'split-33-66',    label: '33/66',   title: '1/3 + 2/3 split'  },
    { id: 'split-66-33',    label: '66/33',   title: '2/3 + 1/3 split'  },
    { id: 'split-33-33-33', label: '33/33',   title: '3-column equal'   },
    { id: 'masonry',        label: 'Masonry', title: 'Masonry columns'  },
];

const DASHBOARDS_KEY = 'multi_dashboards';
const ACTIVE_KEY     = 'multi_active_id';
const LEGACY_SEL_KEY = 'multi_option_selection';
const LEGACY_CMP_KEY = 'multi_option_compact';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const makeDashboard = (name = 'My Dashboard'): Dashboard => ({
    id: genId(), name, layout: 'full', calculators: [], compact: false, stretch: false, selectorHidden: false,
});

const loadDashboards = (): Dashboard[] => {
    try {
        const raw = localStorage.getItem(DASHBOARDS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {}
    // Migrate from legacy single-dashboard storage
    try {
        const legacySel = localStorage.getItem(LEGACY_SEL_KEY);
        const legacyCmp = localStorage.getItem(LEGACY_CMP_KEY);
        const d = makeDashboard();
        if (legacySel) d.calculators = JSON.parse(legacySel);
        if (legacyCmp) d.compact = legacyCmp === 'true';
        return [d];
    } catch {}
    return [makeDashboard()];
};

const saveDashboards = (dashboards: Dashboard[]) => {
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
};

const loadActiveId = (dashboards: Dashboard[]): string => {
    const stored = localStorage.getItem(ACTIVE_KEY);
    if (stored && dashboards.find(d => d.id === stored)) return stored;
    return dashboards[0].id;
};

export const MultiOptionPage = () => {
    const [dashboards, setDashboards] = React.useState<Dashboard[]>(loadDashboards);
    const [activeId, setActiveId]     = React.useState<string>(() => loadActiveId(loadDashboards()));
    const [renaming, setRenaming]     = React.useState<string | null>(null);
    const [renameVal, setRenameVal]   = React.useState('');
    const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);
    const renameRef = React.useRef<HTMLInputElement>(null);

    const dashboard = dashboards.find(d => d.id === activeId) ?? dashboards[0];

    React.useEffect(() => { saveDashboards(dashboards); }, [dashboards]);
    React.useEffect(() => { localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId]);

    React.useEffect(() => {
        if (renaming && renameRef.current) renameRef.current.focus();
    }, [renaming]);

    const updateDashboard = (id: string, patch: Partial<Dashboard>) => {
        setDashboards(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
    };

    const createDashboard = () => {
        const d = makeDashboard(`Dashboard ${dashboards.length + 1}`);
        setDashboards(prev => [...prev, d]);
        setActiveId(d.id);
    };

    const confirmDelete = (id: string) => setPendingDelete(id);

    const deleteDashboard = (id: string) => {
        if (dashboards.length <= 1) return;
        const next = dashboards.find(d => d.id !== id);
        setDashboards(prev => prev.filter(d => d.id !== id));
        if (activeId === id && next) setActiveId(next.id);
        setPendingDelete(null);
    };

    const startRename = (d: Dashboard) => {
        setRenaming(d.id);
        setRenameVal(d.name);
    };

    const commitRename = () => {
        if (renaming) {
            const trimmed = renameVal.trim();
            if (trimmed) updateDashboard(renaming, { name: trimmed });
        }
        setRenaming(null);
    };

    const toggleCalc = (id: CalcId) => {
        updateDashboard(dashboard.id, {
            calculators: dashboard.calculators.includes(id)
                ? dashboard.calculators.filter(x => x !== id)
                : [...dashboard.calculators, id],
        });
    };

    const activeCalcs = dashboard.calculators
        .map(id => REGISTRY.find(r => r.id === id))
        .filter((r): r is typeof REGISTRY[number] => r !== undefined);

    const gridWrapperClass = {
        full:             'flex flex-col',
        split:            'grid grid-cols-1 sm:grid-cols-2 gap-8 items-start',
        'split-33-66':    'grid grid-cols-3 gap-8 items-start',
        'split-66-33':    'grid grid-cols-3 gap-8 items-start',
        'split-33-33-33': 'grid grid-cols-1 sm:grid-cols-3 gap-8 items-start',
        masonry:          'columns-1 sm:columns-2 gap-8',
    }[dashboard.layout];

    const itemColClass = (index: number): string => {
        if (dashboard.layout === 'split-33-66') {
            return index % 2 === 0 ? 'col-span-1' : 'col-span-2';
        }
        if (dashboard.layout === 'split-66-33') {
            return index % 2 === 0 ? 'col-span-2' : 'col-span-1';
        }
        return '';
    };

    return (
        <div className="space-y-8">

            {/* ── Dashboard tabs ── */}
            <div className="flex items-stretch gap-0 border-b border-slate-200 dark:border-white/8 overflow-x-auto">
                {dashboards.map(d => {
                    const isActive = d.id === activeId;
                    return (
                        <div key={d.id} className="relative flex-shrink-0">
                            {renaming === d.id ? (
                                <input
                                    ref={renameRef}
                                    value={renameVal}
                                    onChange={e => setRenameVal(e.target.value)}
                                    onBlur={commitRename}
                                    onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null); }}
                                    className="px-4 py-2.5 text-xs font-normal bg-transparent border-b-2 border-[#387E67] dark:border-[#52B788] text-slate-900 dark:text-white outline-none min-w-0 w-28"
                                    aria-label="Rename dashboard"
                                />
                            ) : (
                                <button
                                    onClick={() => setActiveId(d.id)}
                                    onDoubleClick={() => startRename(d)}
                                    className={cn(
                                        'px-4 py-2.5 text-xs font-normal whitespace-nowrap transition-colors cursor-pointer',
                                        isActive
                                            ? 'text-slate-900 dark:text-white border-b-2 border-[#387E67] dark:border-[#52B788] -mb-px'
                                            : 'text-slate-400 dark:text-white/35 hover:text-slate-700 dark:hover:text-white/60 border-b-2 border-transparent -mb-px'
                                    )}
                                >
                                    {d.name}
                                </button>
                            )}
                        </div>
                    );
                })}
                <button
                    onClick={createDashboard}
                    aria-label="New dashboard"
                    className="flex items-center px-3 py-2.5 text-slate-400 dark:text-white/25 hover:text-[#387E67] dark:hover:text-[#52B788] transition-colors cursor-pointer flex-shrink-0"
                >
                    <Plus size={13} />
                </button>
            </div>

            {/* ── Active dashboard header ── */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800 dark:text-white">{dashboard.name}</span>
                <button
                    onClick={() => startRename(dashboard)}
                    aria-label="Rename dashboard"
                    className="text-slate-300 hover:text-slate-500 dark:text-white/20 dark:hover:text-white/50 transition-colors cursor-pointer"
                >
                    <Pencil size={11} />
                </button>
                <button
                    onClick={() => updateDashboard(dashboard.id, { selectorHidden: !dashboard.selectorHidden })}
                    aria-pressed={dashboard.selectorHidden}
                    aria-label={dashboard.selectorHidden ? 'Show selections' : 'Hide selections'}
                    className={cn(
                        'text-[10px] uppercase tracking-widest font-normal px-2.5 py-1 border transition-colors cursor-pointer ml-1',
                        dashboard.selectorHidden
                            ? 'border-[#387E67] dark:border-[#52B788] text-[#387E67] dark:text-[#52B788]'
                            : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/25 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-600 dark:hover:text-white/50'
                    )}
                >
                    {dashboard.selectorHidden ? 'Show Selections' : 'Hide Selections'}
                </button>
                {dashboards.length > 1 && (
                    <button
                        onClick={() => confirmDelete(dashboard.id)}
                        aria-label="Delete dashboard"
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-normal border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/25 hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer ml-2"
                    >
                        <Trash2 size={10} />
                        Delete
                    </button>
                )}
            </div>

            {/* ── Calculator selector + Options (hideable) ── */}
            {!dashboard.selectorHidden && <div className="space-y-8">
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Select calculators to display
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {[...REGISTRY].sort((a, b) => a.label.localeCompare(b.label)).map(calc => {
                        const Icon = calc.icon;
                        const active = dashboard.calculators.includes(calc.id);
                        return (
                            <button
                                key={calc.id}
                                onClick={() => toggleCalc(calc.id)}
                                aria-pressed={active}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 text-xs font-normal border transition-all duration-150 cursor-pointer w-full sm:w-auto',
                                    active
                                        ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-400 dark:hover:border-white/30'
                                )}
                            >
                                <Icon size={13} />
                                {calc.label}
                                <Check size={11} className={cn('ml-1 transition-opacity', active ? 'opacity-80' : 'opacity-0')} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Options ── */}
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Options
                </p>
                <div className="flex flex-wrap gap-2">
                    {LAYOUTS.map(l => (
                        <button
                            key={l.id}
                            onClick={() => updateDashboard(dashboard.id, {
                                layout: l.id,
                                ...(l.id === 'full' ? { stretch: false } : {}),
                            })}
                            title={l.title}
                            aria-pressed={dashboard.layout === l.id}
                            className={cn(
                                'px-3 py-1.5 text-[10px] uppercase tracking-widest font-normal border transition-all cursor-pointer',
                                dashboard.layout === l.id
                                    ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30'
                            )}
                        >
                            {l.label}
                        </button>
                    ))}
                    {dashboard.layout !== 'full' && (
                        <button
                            onClick={() => updateDashboard(dashboard.id, { stretch: !dashboard.stretch })}
                            aria-pressed={dashboard.stretch}
                            className={cn(
                                'px-3 py-1.5 text-[10px] uppercase tracking-widest font-normal border transition-all cursor-pointer',
                                dashboard.stretch
                                    ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30'
                            )}
                        >
                            Stretch
                        </button>
                    )}
                    <button
                        onClick={() => updateDashboard(dashboard.id, { compact: !dashboard.compact })}
                        aria-pressed={dashboard.compact}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest font-normal border transition-all cursor-pointer',
                            dashboard.compact
                                ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30'
                        )}
                    >
                        Compact
                    </button>
                </div>
            </div>
            </div>}

            {/* ── Empty state ── */}
            {dashboard.calculators.length === 0 && (
                <div className="py-24 text-center border border-dashed border-slate-200 dark:border-white/8">
                    <p className="text-sm text-slate-400 dark:text-white/25">
                        Select one or more calculators above to build your dashboard.
                    </p>
                </div>
            )}

            {/* ── Rendered calculators ── */}
            <div
                className={dashboard.stretch ? 'relative' : undefined}
                style={dashboard.stretch ? {
                    width: '100vw',
                    left: '50%',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                    paddingLeft: '3rem',
                    paddingRight: '3rem',
                } : undefined}
            >
            <div className={gridWrapperClass}>
                <AnimatePresence mode="popLayout">
                    {activeCalcs.map((calc, i) => {
                        const Component = calc.component as React.ComponentType<{ compact?: boolean }>;
                        const Icon = calc.icon;
                        const isMasonry = dashboard.layout === 'masonry';
                        const isFull = dashboard.layout === 'full';
                        return (
                            <motion.div
                                key={calc.id}
                                layout={!isMasonry}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                                className={cn(
                                    itemColClass(i),
                                    isMasonry && 'break-inside-avoid mb-8',
                                    isFull && i < activeCalcs.length - 1 && 'mb-16',
                                )}
                            >
                                {/* Section header */}
                                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-5 mb-8">
                                    <Icon size={16} className="text-[#387E67] dark:text-[#52B788]" />
                                    <h2 className="text-lg font-medium tracking-tight text-slate-900 dark:text-white">
                                        {calc.label}
                                    </h2>
                                    <button
                                        onClick={() => toggleCalc(calc.id)}
                                        className="ml-auto text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 dark:text-white/25 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                        aria-label={`Remove ${calc.label}`}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <Component compact={dashboard.compact} />

                                {isFull && i < activeCalcs.length - 1 && (
                                    <div className="mt-16 border-t border-slate-100 dark:border-white/5" />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            </div>

            {/* ── Delete confirmation modal ── */}
            <Modal
                isOpen={pendingDelete !== null}
                onClose={() => setPendingDelete(null)}
                title="Delete Dashboard"
            >
                <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
                    Delete <span className="font-medium text-slate-900 dark:text-white">
                        {dashboards.find(d => d.id === pendingDelete)?.name ?? 'this dashboard'}
                    </span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setPendingDelete(null)}
                        className="px-4 py-2 text-xs font-normal border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50 hover:border-slate-400 dark:hover:border-white/30 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => pendingDelete && deleteDashboard(pendingDelete)}
                        className="px-4 py-2 text-xs font-normal border border-rose-500 bg-rose-500 text-white hover:bg-rose-600 hover:border-rose-600 transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
};
