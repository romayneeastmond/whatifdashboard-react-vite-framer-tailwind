/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DebtData } from '../../types';

const DEFAULT_DATA: DebtData = {
	balance:        15000,
	annualRate:     18,
	monthlyPayment: 400,
};

function fmt(n: number) {
	return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export const DebtCalculator = () => {
	const [data, setData] = React.useState<DebtData>(() => {
		const saved = localStorage.getItem('debt_data');
		return saved ? JSON.parse(saved) : DEFAULT_DATA;
	});

	React.useEffect(() => {
		localStorage.setItem('debt_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const monthlyRate = data.annualRate / 100 / 12;
		const minPayment  = data.balance * monthlyRate;

		if (data.monthlyPayment <= minPayment) {
			return { impossible: true, minPayment };
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

		return { impossible: false, chartPoints, totalPaid, totalInterest, month, years, months, minPayment };
	}, [data]);

	const update = (patch: Partial<DebtData>) => setData(d => ({ ...d, ...patch }));

	return (
		<div className="space-y-8">
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
							onChange={v => update({ balance: v })}
						/>
						<Slider
							label="Annual Interest Rate"
							value={data.annualRate}
							min={0}
							max={36}
							step={0.1}
							suffix="%"
							onChange={v => update({ annualRate: v })}
						/>
						<Slider
							label="Monthly Payment"
							value={data.monthlyPayment}
							min={10}
							max={10000}
							step={10}
							suffix="$"
							onChange={v => update({ monthlyPayment: v })}
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
											<linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
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
											fill="url(#debtGrad)"
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
								{ label: 'Original Balance',  value: fmt(data.balance) },
								{ label: 'Monthly Payment',   value: fmt(data.monthlyPayment) },
								{ label: 'Months to Pay Off', value: `${results.month} months` },
								{ label: 'Total Paid',        value: fmt(results.totalPaid) },
								{ label: 'Total Interest',    value: fmt(results.totalInterest) },
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
