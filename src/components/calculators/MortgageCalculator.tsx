import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { MortgageData } from '@/src/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MortgageCalculator = () => {
	const [data, setData] = React.useState<MortgageData>(() => {
		const saved = localStorage.getItem('mortgage_data');
		return saved ? JSON.parse(saved) : {
			homePrice: 400000,
			downPayment: 80000,
			interestRate: 6.5,
			termYears: 30,
			annualTaxes: 4800,
		};
	});

	React.useEffect(() => {
		localStorage.setItem('mortgage_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const principal = data.homePrice - data.downPayment;
		const monthlyRate = data.interestRate / 100 / 12;
		const numPayments = data.termYears * 12;

		const monthlyPI =
			(principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
			(Math.pow(1 + monthlyRate, numPayments) - 1);

		const monthlyTaxes = data.annualTaxes / 12;
		const totalMonthly = monthlyPI + monthlyTaxes;

		const schedule = [];
		let remainingBalance = principal;
		for (let i = 0; i <= data.termYears; i++) {
			schedule.push({
				year: i,
				balance: Math.max(0, Math.round(remainingBalance))
			});

			const yearlyInterest = remainingBalance * (data.interestRate / 100);
			const yearlyPrincipal = (monthlyPI * 12) - yearlyInterest;
			remainingBalance -= yearlyPrincipal;
		}

		return {
			monthlyPI,
			totalMonthly,
			totalInterest: (monthlyPI * numPayments) - principal,
			schedule
		};
	}, [data]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card>
				<CardHeader>
					<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Loan Parameters</h3>
				</CardHeader>
				<CardContent>
					<Slider
						label="Home Price"
						value={data.homePrice}
						min={100000}
						max={2000000}
						step={5000}
						suffix="$"
						onChange={(v) => setData({ ...data, homePrice: v })}
					/>
					<Slider
						label="Down Payment"
						value={data.downPayment}
						min={0}
						max={data.homePrice}
						step={1000}
						suffix="$"
						onChange={(v) => setData({ ...data, downPayment: v })}
					/>
					<Slider
						label="Interest Rate"
						value={data.interestRate}
						min={1}
						max={15}
						step={0.1}
						suffix="%"
						onChange={(v) => setData({ ...data, interestRate: v })}
					/>
					<Slider
						label="Term (Years)"
						value={data.termYears}
						min={5}
						max={40}
						step={5}
						suffix=" yrs"
						onChange={(v) => setData({ ...data, termYears: v })}
					/>
				</CardContent>
			</Card>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Amortization View</h3>
					</CardHeader>
					<CardContent className="h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={results.schedule}>
								<defs>
									<linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.1} />
										<stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
								<XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} />
								<YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} tickFormatter={(v) => `$${v / 1000}k`} />
								<Tooltip
									contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
									itemStyle={{ color: '#0F172A' }}
									formatter={(v: number) => `$${v.toLocaleString()}`}
									labelFormatter={(l) => `Year ${l}`}
								/>
								<Area type="monotone" dataKey="balance" stroke="var(--chart-primary)" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card variant="summary">
					<CardContent>
						<div className="grid grid-cols-2 gap-4 items-end">
							<div>
								<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Monthly Payment</p>
								<p className="text-4xl font-light tracking-tighter font-sans">${Math.round(results.totalMonthly).toLocaleString()}</p>
							</div>
							<div className="text-right">
								<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Total Interest</p>
								<p className="text-xl font-light tracking-tighter text-white/80">${Math.round(results.totalInterest).toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
