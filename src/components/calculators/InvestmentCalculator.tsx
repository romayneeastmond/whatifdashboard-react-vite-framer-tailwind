import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { InvestmentData } from '@/src/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const InvestmentCalculator = () => {
	const [data, setData] = React.useState<InvestmentData>(() => {
		const saved = localStorage.getItem('investment_data');
		return saved ? JSON.parse(saved) : {
			initialAmount: 10000,
			monthlyContribution: 500,
			annualReturn: 7,
			years: 20,
		};
	});

	React.useEffect(() => {
		localStorage.setItem('investment_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const schedule = [];
		let currentBalance = data.initialAmount;
		let totalInvested = data.initialAmount;
		const monthlyRate = data.annualReturn / 100 / 12;

		for (let i = 0; i <= data.years; i++) {
			schedule.push({
				year: i,
				invested: Math.round(totalInvested),
				earnings: Math.round(currentBalance - totalInvested),
			});

			for (let m = 0; m < 12; m++) {
				currentBalance = (currentBalance + data.monthlyContribution) * (1 + monthlyRate);
				totalInvested += data.monthlyContribution;
			}
		}

		return {
			finalBalance: currentBalance,
			totalInvested,
			totalEarnings: currentBalance - totalInvested,
			schedule
		};
	}, [data]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card>
				<CardHeader>
					<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Strategy Profile</h3>
				</CardHeader>
				<CardContent>
					<Slider
						label="Initial Investment"
						value={data.initialAmount}
						min={0}
						max={1000000}
						step={5000}
						suffix="$"
						onChange={(v) => setData({ ...data, initialAmount: v })}
					/>
					<Slider
						label="Monthly Contribution"
						value={data.monthlyContribution}
						min={0}
						max={10000}
						step={100}
						suffix="$"
						onChange={(v) => setData({ ...data, monthlyContribution: v })}
					/>
					<Slider
						label="Return Estimate"
						value={data.annualReturn}
						min={1}
						max={15}
						step={0.5}
						suffix="%"
						onChange={(v) => setData({ ...data, annualReturn: v })}
					/>
					<Slider
						label="Horizon"
						value={data.years}
						min={1}
						max={50}
						step={1}
						suffix=" yrs"
						onChange={(v) => setData({ ...data, years: v })}
					/>
				</CardContent>
			</Card>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Portfolio Projection</h3>
					</CardHeader>
					<CardContent className="h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={results.schedule}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
								<XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} />
								<YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} tickFormatter={(v) => `$${v / 1000}k`} />
								<Tooltip
									contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
									itemStyle={{ color: '#0F172A' }}
									formatter={(v: number) => `$${v.toLocaleString()}`}
								/>
								<Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
								<Bar dataKey="invested" stackId="a" fill="var(--chart-secondary)" radius={[0, 0, 0, 0]} />
								<Bar dataKey="earnings" stackId="a" fill="var(--chart-primary)" radius={[2, 2, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card variant="summary">
					<CardContent>
						<div className="grid grid-cols-2 gap-4 items-end">
							<div>
								<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Final Balance</p>
								<p className="text-4xl font-light tracking-tighter font-sans">${Math.round(results.finalBalance).toLocaleString()}</p>
							</div>
							<div className="text-right">
								<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Return Delta</p>
								<p className="text-xl font-light tracking-tighter text-white/80">+{Math.round((results.totalEarnings / results.totalInvested) * 100)}% ROI</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
