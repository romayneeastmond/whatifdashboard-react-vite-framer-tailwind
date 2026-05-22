
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Home, BarChart3, Target, Clock, Scale, CreditCard, Check, Dumbbell, Flame, CalendarDays, Utensils, TrendingUp, ShieldAlert } from 'lucide-react';
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
import { cn } from '../lib/utils';

const REGISTRY = [
    { id: 'salary',             label: 'Salary & Taxes',      icon: Wallet,      component: SalaryCalculator           },
    { id: 'mortgage',           label: 'Mortgage Equity',      icon: Home,        component: MortgageCalculator         },
    { id: 'investing',          label: 'Wealth Growth',        icon: BarChart3,   component: InvestmentCalculator       },
    { id: 'goals',              label: 'Goals Tracking',       icon: Target,      component: GoalsCalculator            },
    { id: 'time',               label: 'Time Allocation',      icon: Clock,       component: TimeCalculator             },
    { id: 'bardal',             label: 'Bardal Factor',        icon: Scale,       component: BardalCalculator           },
    { id: 'debt',               label: 'Debt Repayment',       icon: CreditCard,  component: DebtCalculator             },
    { id: 'daysbetween',        label: 'Days Between',         icon: CalendarDays,component: DaysBetweenCalculator      },
    { id: 'weightloss',         label: 'Weight Loss',          icon: Flame,       component: WeightLossCalculator       },
    { id: 'protein',            label: 'Protein Intake',       icon: Dumbbell,    component: ProteinCalculator          },
    { id: 'calorie',            label: 'Calorie Deficit',      icon: Utensils,    component: CalorieDeficitCalculator   },
    { id: 'careerpath',         label: 'Career Path',          icon: TrendingUp,  component: CareerPathCalculator       },
    { id: 'wrongfuldismissal',  label: 'Wrongful Dismissal',   icon: ShieldAlert, component: WrongfulDismissalCalculator},
] as const;

type CalcId = typeof REGISTRY[number]['id'];

const STORAGE_KEY = 'multi_option_selection';
const COMPACT_KEY = 'multi_option_compact';

const loadSelection = (): CalcId[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const MultiOptionPage = () => {
    const [selected, setSelected] = React.useState<CalcId[]>(loadSelection);
    const [compact, setCompact] = React.useState(() => localStorage.getItem(COMPACT_KEY) === 'true');

    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    }, [selected]);

    React.useEffect(() => {
        localStorage.setItem(COMPACT_KEY, String(compact));
    }, [compact]);

    const toggle = (id: CalcId) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const activeCalcs = REGISTRY.filter(r => selected.includes(r.id));

    return (
        <div className="space-y-10">
            {/* Selector */}
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Select calculators to display
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {[...REGISTRY].sort((a, b) => a.label.localeCompare(b.label)).map(calc => {
                        const Icon = calc.icon;
                        const active = selected.includes(calc.id);
                        return (
                            <button
                                key={calc.id}
                                onClick={() => toggle(calc.id)}
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

            {/* Options */}
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 font-normal mb-4">
                    Options
                </p>
                <button
                    onClick={() => setCompact(c => !c)}
                    className={cn(
                        'flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest font-normal border transition-all cursor-pointer',
                        compact
                            ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30'
                    )}
                    aria-pressed={compact}
                >
                    Compact
                </button>
            </div>

            {selected.length === 0 && (
                <div className="py-24 text-center border border-dashed border-slate-200 dark:border-white/8">
                    <p className="text-sm text-slate-400 dark:text-white/25">
                        Select one or more calculators above to build your dashboard.
                    </p>
                </div>
            )}

            {/* Rendered calculators */}
            <AnimatePresence mode="popLayout">
                {activeCalcs.map((calc, i) => {
                    const Component = calc.component as React.ComponentType<{ compact?: boolean }>;
                    const Icon = calc.icon;
                    return (
                        <motion.div
                            key={calc.id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                        >
                            {/* Section header */}
                            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-5 mb-8">
                                <Icon size={16} className="text-[#387E67] dark:text-[#52B788]" />
                                <h2 className="text-lg font-medium tracking-tight text-slate-900 dark:text-white">
                                    {calc.label}
                                </h2>
                                <button
                                    onClick={() => toggle(calc.id)}
                                    className="ml-auto text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 dark:text-white/25 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                    aria-label={`Remove ${calc.label}`}
                                >
                                    Remove
                                </button>
                            </div>

                            <Component compact={compact} />

                            {i < activeCalcs.length - 1 && (
                                <div className="mt-16 border-t border-slate-100 dark:border-white/5" />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
