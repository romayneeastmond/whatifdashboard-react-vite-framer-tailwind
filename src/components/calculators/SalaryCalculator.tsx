import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { SalaryData } from '@/src/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const SalaryCalculator = () => {
	const [data, setData] = React.useState<SalaryData>(() => {
		const saved = localStorage.getItem('salary_data');
		return saved ? JSON.parse(saved) : {
			annualGross: 100000,
			taxRate: 25,
			contribution401k: 10,
			monthlyExpenses: 3000,
		};
	});

	React.useEffect(() => {
		localStorage.setItem('salary_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const annual401k = (data.annualGross * data.contribution401k) / 100;
		const taxableIncome = data.annualGross - annual401k;
		const annualTax = (taxableIncome * data.taxRate) / 100;
		const takeHomeAnnual = taxableIncome - annualTax;
		const takeHomeMonthly = takeHomeAnnual / 12;
		const monthlySavings = takeHomeMonthly - data.monthlyExpenses;

		return {
			takeHomeMonthly,
			annualTax,
			annual401k,
			monthlySavings,
			chartData: [
				{ name: 'Take Home', value: takeHomeMonthly, color: 'var(--chart-primary)' },
				{ name: 'Retirement Contribution', value: annual401k / 12, color: 'var(--chart-secondary)' },
				{ name: 'Taxes', value: annualTax / 12, color: 'var(--chart-tertiary)' },
			]
		};
	}, [data]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card>
				<CardHeader>
					<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Input Parameters</h3>
				</CardHeader>
				<CardContent>
					<Slider
						label="Annual Gross Salary"
						value={data.annualGross}
						min={30000}
						max={500000}
						step={1000}
						suffix="$"
						onChange={(v) => setData({ ...data, annualGross: v })}
					/>
					<Slider
						label="Estimate Tax Rate"
						value={data.taxRate}
						min={0}
						max={50}
						suffix="%"
						onChange={(v) => setData({ ...data, taxRate: v })}
					/>
					<Slider
						label="Retirement Contribution"
						value={data.contribution401k}
						min={0}
						max={30}
						suffix="%"
						onChange={(v) => setData({ ...data, contribution401k: v })}
					/>
					<Slider
						label="Essential Expenses"
						value={data.monthlyExpenses}
						min={500}
						max={10000}
						step={100}
						suffix="$"
						onChange={(v) => setData({ ...data, monthlyExpenses: v })}
					/>
				</CardContent>
			</Card>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Monthly Breakdown</h3>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={results.chartData}
									innerRadius={60}
									outerRadius={80}
									paddingAngle={5}
									dataKey="value"
								>
									{results.chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0F172A' }}
									formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
								/>
								<Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card variant="summary">
					<CardContent>
						<div className="flex justify-between items-end">
							<div>
								<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Monthly Surplus</p>
								<p className="text-4xl font-light tracking-tighter font-sans">${Math.max(0, results.monthlySavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">/mo</span></p>
							</div>
							<div className="text-right">
								<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Annual Result</p>
								<p className="text-xl font-light tracking-tighter text-white/80">${Math.max(0, results.monthlySavings * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
