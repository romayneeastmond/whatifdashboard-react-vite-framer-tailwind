
import React, { useMemo } from 'react';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DebtData } from '../../types';

interface DebtScenario {
	id: string;
	name: string;
	data: DebtData;
}

const DEFAULT_DATA: DebtData = {
	balance:        15000,
	annualRate:     18,
	monthlyPayment: 400,
};

function fmt(n: number) {
	return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function calcResults(data: DebtData) {
	const monthlyRate = data.annualRate / 100 / 12;
	const minPayment  = data.balance * monthlyRate;

	if (data.monthlyPayment <= minPayment) {
		return { impossible: true, minPayment } as const;
	}

	const chartPoints: { month: number; balance: number }[] = [];
	let balance     = data.balance;
	let totalPaid   = 0;
	let month       = 0;
	const MAX_MONTHS = 360;

	while (balance > 0.01 && month <= MAX_MONTHS) {
		if (month % 3 === 0) chartPoints.push({ month, balance: Math.round(balance) });
		const interest  = balance * monthlyRate;
		const principal = Math.min(data.monthlyPayment - interest, balance);
		balance        -= principal;
		totalPaid      += data.monthlyPayment;
		month++;
	}
	chartPoints.push({ month, balance: 0 });

	const totalInterest = totalPaid - data.balance;
	const years  = Math.floor(month / 12);
	const months = month % 12;

	return { impossible: false, chartPoints, totalPaid, totalInterest, month, years, months, minPayment } as const;
}

const DebtScenarioView = ({
	scenario,
	onUpdate,
	onRemove,
	isOnly,
}: {
	scenario: DebtScenario;
	onUpdate: (data: DebtData) => void;
	onRemove: () => void;
	isOnly: boolean;
}) => {
	const data    = scenario.data;
	const results = useMemo(() => calcResults(data), [data]);

	return (
		<div className="space-y-6 pb-24 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#387E67] dark:text-[#52B788]">
						<CreditCard size={16} />
					</div>
					<h3 className="text-lg font-medium text-slate-900 dark:text-white">{scenario.name}</h3>
				</div>
				{!isOnly && (
					<button
						onClick={onRemove}
						className="p-2 text-slate-400 hover:text-red-500 transition-colors"
						title="Remove Scenario"
					>
						<Trash2 size={18} />
					</button>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
							Debt Details
						</h3>
					</CardHeader>
					<CardContent>
						<Slider
							label="Total Debt Balance"
							value={data.balance}
							min={500}
							max={500000}
							step={500}
							suffix="$"
							onChange={v => onUpdate({ ...data, balance: v })}
						/>
						<Slider
							label="Annual Interest Rate"
							value={data.annualRate}
							min={0}
							max={36}
							step={0.1}
							suffix="%"
							onChange={v => onUpdate({ ...data, annualRate: v })}
						/>
						<Slider
							label="Monthly Payment"
							value={data.monthlyPayment}
							min={10}
							max={10000}
							step={10}
							suffix="$"
							onChange={v => onUpdate({ ...data, monthlyPayment: v })}
						/>

						{results.impossible && (
							<p className="mt-2 text-[11px] text-rose-500 dark:text-rose-400 leading-relaxed">
								Monthly payment must exceed {fmt(results.minPayment)} to cover interest. Increase your payment.
							</p>
						)}
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
								Balance Over Time
							</h3>
						</CardHeader>
						<CardContent className="h-[240px]">
							{results.impossible ? (
								<div className="h-full flex items-center justify-center text-slate-300 dark:text-white/20 text-sm">
									Increase payment to see projection
								</div>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={results.chartPoints} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
										<defs>
											<linearGradient id={`debtGrad-${scenario.id}`} x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%"  stopColor="var(--chart-primary)" stopOpacity={0.2} />
												<stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0}   />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
										<XAxis
											dataKey="month"
											tick={{ fontSize: 10 }}
											tickLine={false}
											axisLine={false}
											tickFormatter={v => `Mo ${v}`}
										/>
										<YAxis
											tick={{ fontSize: 10 }}
											tickLine={false}
											axisLine={false}
											tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
										/>
										<Tooltip
											contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
											formatter={(v: number) => [fmt(v), 'Remaining']}
											labelFormatter={l => `Month ${l}`}
										/>
										<Area
											type="monotone"
											dataKey="balance"
											stroke="var(--chart-primary)"
											strokeWidth={2}
											fill={`url(#debtGrad-${scenario.id})`}
										/>
									</AreaChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>

					{!results.impossible && (
						<Card variant="summary">
							<CardContent>
								<div className="flex justify-between items-end">
									<div>
										<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Payoff Time</p>
										<p className="text-4xl font-light tracking-tighter font-sans">
											{results.years > 0 ? `${results.years}y ` : ''}{results.months}
											<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">mos</span>
										</p>
									</div>
									<div className="text-right">
										<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Total Interest</p>
										<p className="text-xl font-light tracking-tighter text-white/90">{fmt(results.totalInterest)}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			{!results.impossible && (
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
							Summary
						</h3>
					</CardHeader>
					<CardContent>
						<div className="divide-y divide-slate-100 dark:divide-white/5">
							{[
								{ label: 'Original Balance',      value: fmt(data.balance) },
								{ label: 'Monthly Payment',       value: fmt(data.monthlyPayment) },
								{ label: 'Months to Pay Off',     value: `${results.month} months` },
								{ label: 'Total Paid',            value: fmt(results.totalPaid) },
								{ label: 'Total Interest',        value: fmt(results.totalInterest) },
								{ label: 'Interest as % of Debt', value: `${((results.totalInterest / data.balance) * 100).toFixed(1)}%` },
							].map(({ label, value }) => (
								<div key={label} className="flex justify-between items-center py-3">
									<span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
									<span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export const DebtCalculator = () => {
	const [scenarios, setScenarios] = React.useState<DebtScenario[]>(() => {
		const saved = localStorage.getItem('debt_scenarios');
		if (saved) return JSON.parse(saved);
		// Migrate legacy single-scenario data
		const legacy = localStorage.getItem('debt_data');
		const data   = legacy ? JSON.parse(legacy) : DEFAULT_DATA;
		return [{ id: '1', name: 'Scenario 1', data }];
	});

	const [isModalOpen,     setIsModalOpen]     = React.useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [scenarioToDelete, setScenarioToDelete] = React.useState<{ id: string; name: string } | null>(null);
	const [newScenarioName, setNewScenarioName] = React.useState('');

	React.useEffect(() => {
		localStorage.setItem('debt_scenarios', JSON.stringify(scenarios));
	}, [scenarios]);

	const handleModalSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newScenarioName.trim()) return;
		setScenarios(prev => [...prev, { id: Date.now().toString(), name: newScenarioName.trim(), data: DEFAULT_DATA }]);
		setIsModalOpen(false);
		setNewScenarioName('');
	};

	const removeScenario = (id: string, name: string) => {
		if (scenarios.length === 1) return;
		setScenarioToDelete({ id, name });
		setDeleteModalOpen(true);
	};

	const confirmDelete = () => {
		if (scenarioToDelete) {
			setScenarios(prev => prev.filter(s => s.id !== scenarioToDelete.id));
			setDeleteModalOpen(false);
			setScenarioToDelete(null);
		}
	};

	const updateScenarioData = (id: string, newData: DebtData) => {
		setScenarios(prev => prev.map(s => s.id === id ? { ...s, data: newData } : s));
	};

	return (
		<div className="space-y-24">
			<div className="space-y-32">
				{scenarios.map(scenario => (
					<React.Fragment key={scenario.id}>
						<DebtScenarioView
							scenario={scenario}
							isOnly={scenarios.length === 1}
							onUpdate={data => updateScenarioData(scenario.id, data)}
							onRemove={() => removeScenario(scenario.id, scenario.name)}
						/>
					</React.Fragment>
				))}
			</div>

			<div className="flex justify-center pt-12 border-t border-slate-100 dark:border-white/5">
				<button
					onClick={() => { setNewScenarioName(''); setIsModalOpen(true); }}
					className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group"
				>
					<Plus size={18} className="text-[#387E67] dark:text-[#52B788] group-hover:scale-110 transition-transform" />
					<span>Add Another Scenario</span>
				</button>
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Scenario">
				<form onSubmit={handleModalSubmit} className="space-y-6">
					<div>
						<label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
						<Input
							autoFocus
							value={newScenarioName}
							onChange={e => setNewScenarioName(e.target.value)}
							placeholder="e.g. Aggressive Payoff"
						/>
					</div>
					<button
						type="submit"
						disabled={!newScenarioName.trim()}
						className="w-full py-3 bg-[#387E67] dark:bg-[#52B788] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					>
						Add Scenario
					</button>
				</form>
			</Modal>

			<Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
				<div className="space-y-6">
					<p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
						Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">"{scenarioToDelete?.name}"</span>? This action cannot be undone and all data for this scenario will be lost.
					</p>
					<div className="flex gap-3">
						<button
							onClick={() => setDeleteModalOpen(false)}
							className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={confirmDelete}
							className="flex-1 py-3 bg-[#A4161A] text-white rounded-xl text-sm font-medium hover:bg-[#8B1215] transition-colors shadow-lg shadow-red-500/20"
						>
							Delete
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};
