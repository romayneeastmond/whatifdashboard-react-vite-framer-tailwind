/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Home, BarChart3, Target, Clock, Scale, CreditCard, Check } from 'lucide-react';
import { SalaryCalculator } from './calculators/SalaryCalculator';
import { MortgageCalculator } from './calculators/MortgageCalculator';
import { InvestmentCalculator } from './calculators/InvestmentCalculator';
import { GoalsCalculator } from './calculators/GoalsCalculator';
import { TimeCalculator } from './calculators/TimeCalculator';
import { BardalCalculator } from './calculators/BardalCalculator';
import { DebtCalculator } from './calculators/DebtCalculator';
import { cn } from '../lib/utils';

const REGISTRY = [
	{ id: 'salary',   label: 'Salary & Taxes',    icon: Wallet,     component: SalaryCalculator    },
	{ id: 'mortgage', label: 'Mortgage Equity',    icon: Home,       component: MortgageCalculator  },
	{ id: 'investing',label: 'Wealth Growth',      icon: BarChart3,  component: InvestmentCalculator},
	{ id: 'goals',    label: 'Goals Tracking',     icon: Target,     component: GoalsCalculator     },
	{ id: 'time',     label: 'Time Allocation',    icon: Clock,      component: TimeCalculator      },
	{ id: 'bardal',   label: 'Bardal Factor',      icon: Scale,      component: BardalCalculator    },
	{ id: 'debt',     label: 'Debt Repayment',     icon: CreditCard, component: DebtCalculator      },
] as const;

type CalcId = typeof REGISTRY[number]['id'];

const STORAGE_KEY = 'multi_option_selection';

function loadSelection(): CalcId[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function MultiOptionPage() {
	const [selected, setSelected] = React.useState<CalcId[]>(loadSelection);

	React.useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
	}, [selected]);

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
				<p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 mb-4 font-normal">
					Select calculators to display
				</p>
				<div className="flex flex-wrap gap-2">
					{REGISTRY.map(calc => {
						const Icon = calc.icon;
						const active = selected.includes(calc.id);
						return (
							<button
								key={calc.id}
								onClick={() => toggle(calc.id)}
								aria-pressed={active}
								className={cn(
									'flex items-center gap-2 px-4 py-2 text-xs font-normal border transition-all duration-150 cursor-pointer',
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
					const Component = calc.component;
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

							<Component />

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
