/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { BardalData } from '../../types';

const POSITION_LEVELS = [
	{ id: 'entry',        label: 'Entry Level',             rate: 0.75 },
	{ id: 'skilled',      label: 'Skilled / Technical',     rate: 1.0  },
	{ id: 'professional', label: 'Professional',            rate: 1.25 },
	{ id: 'manager',      label: 'Manager',                 rate: 1.5  },
	{ id: 'senior',       label: 'Sr. Manager / Director',  rate: 1.75 },
	{ id: 'executive',    label: 'Executive / C-Suite',     rate: 2.0  },
] as const;

const AVAILABILITY = [
	{ id: 'high',     label: 'High',     description: 'Many similar roles available',  multiplier: 0.9  },
	{ id: 'moderate', label: 'Moderate', description: 'Some similar roles available',  multiplier: 1.0  },
	{ id: 'low',      label: 'Low',      description: 'Few similar roles available',   multiplier: 1.15 },
] as const;

const DEFAULT_DATA: BardalData = {
	annualSalary:      80000,
	age:               42,
	yearsOfService:    8,
	positionLevel:     'professional',
	fieldAvailability: 'moderate',
};

const MAX_NOTICE_MONTHS = 24;

function calcAgeFactor(age: number): number {
	if (age >= 60) return 4;
	if (age >= 55) return 3;
	if (age >= 50) return 2;
	if (age >= 45) return 1;
	return 0;
}

function fmt(n: number) {
	return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtCurrency(n: number) {
	return '$' + fmt(n);
}

function ButtonGroup<T extends string>({
	options,
	value,
	onChange,
	label,
}: {
	options: readonly { id: T; label: string; description?: string }[];
	value: T;
	onChange: (v: T) => void;
	label: string;
}) {
	return (
		<div className="mb-6">
			<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-3 block">
				{label}
			</span>
			<div className="flex flex-wrap gap-2">
				{options.map((opt) => (
					<button
						key={opt.id}
						onClick={() => onChange(opt.id)}
						title={opt.description}
						className={cn(
							'px-3 py-1.5 text-[11px] font-normal border transition-all cursor-pointer',
							value === opt.id
								? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
								: 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-400 dark:hover:border-white/30'
						)}
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}

export const BardalCalculator = () => {
	const [data, setData] = React.useState<BardalData>(() => {
		const saved = localStorage.getItem('bardal_data');
		return saved ? JSON.parse(saved) : DEFAULT_DATA;
	});

	React.useEffect(() => {
		localStorage.setItem('bardal_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const position = POSITION_LEVELS.find((p) => p.id === data.positionLevel) ?? POSITION_LEVELS[2];
		const availability = AVAILABILITY.find((a) => a.id === data.fieldAvailability) ?? AVAILABILITY[1];

		const serviceMonths = position.rate * data.yearsOfService;
		const ageBonus = calcAgeFactor(data.age);
		const rawMonths = serviceMonths + ageBonus;
		const adjustedMonths = rawMonths * availability.multiplier;
		const availabilityDelta = adjustedMonths - rawMonths;

		const noticeMonths = Math.min(Math.max(Math.round(adjustedMonths * 2) / 2, 1), MAX_NOTICE_MONTHS);
		const noticeLow  = Math.max(noticeMonths - 1.5, 1);
		const noticeHigh = Math.min(noticeMonths + 1.5, MAX_NOTICE_MONTHS);

		const monthlySalary = data.annualSalary / 12;
		const severance     = monthlySalary * noticeMonths;
		const severanceLow  = monthlySalary * noticeLow;
		const severanceHigh = monthlySalary * noticeHigh;

		const chartData = [
			{ factor: 'Service',      months: Math.round(serviceMonths * 10) / 10 },
			{ factor: 'Age',          months: ageBonus },
			{ factor: 'Availability', months: Math.round(availabilityDelta * 10) / 10 },
		];

		const cappedNote = adjustedMonths >= MAX_NOTICE_MONTHS;

		return { noticeMonths, noticeLow, noticeHigh, severance, severanceLow, severanceHigh, chartData, cappedNote, monthlySalary };
	}, [data]);

	const update = (patch: Partial<BardalData>) => setData((d) => ({ ...d, ...patch }));

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Inputs */}
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
							Employee Details
						</h3>
					</CardHeader>
					<CardContent>
						<Slider
							label="Annual Salary"
							value={data.annualSalary}
							min={30000}
							max={500000}
							step={1000}
							suffix="$"
							onChange={(v) => update({ annualSalary: v })}
						/>
						<Slider
							label="Age"
							value={data.age}
							min={18}
							max={75}
							suffix=" yrs"
							onChange={(v) => update({ age: v })}
						/>
						<Slider
							label="Years of Service"
							value={data.yearsOfService}
							min={0}
							max={40}
							suffix=" yrs"
							onChange={(v) => update({ yearsOfService: v })}
						/>
						<ButtonGroup
							label="Character of Employment"
							options={POSITION_LEVELS}
							value={data.positionLevel as typeof POSITION_LEVELS[number]['id']}
							onChange={(v) => update({ positionLevel: v })}
						/>
						<ButtonGroup
							label="Availability of Similar Employment"
							options={AVAILABILITY}
							value={data.fieldAvailability as typeof AVAILABILITY[number]['id']}
							onChange={(v) => update({ fieldAvailability: v })}
						/>
					</CardContent>
				</Card>

				{/* Results */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
								Factor Breakdown (Months)
							</h3>
						</CardHeader>
						<CardContent className="h-[220px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={results.chartData} layout="vertical" margin={{ left: 16, right: 24, top: 4, bottom: 4 }}>
									<XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
									<YAxis type="category" dataKey="factor" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
									<Tooltip
										cursor={{ fill: 'transparent' }}
										contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
										formatter={(v: number) => [`${v} months`, '']}
									/>
									<Bar dataKey="months" radius={[0, 4, 4, 0]} barSize={20}>
										{results.chartData.map((entry, i) => (
											<Cell
												key={i}
												fill={
													entry.months < 0
														? '#A4161A'
														: i === 0
														? 'var(--chart-primary)'
														: i === 1
														? 'var(--chart-secondary)'
														: 'var(--chart-tertiary)'
												}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Notice period summary */}
					<Card variant="summary">
						<CardContent>
							<div className="flex justify-between items-end">
								<div>
									<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">
										Notice Period
									</p>
									<p className="text-4xl font-light tracking-tighter font-sans">
										{results.noticeMonths}
										<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">mos</span>
									</p>
									<p className="text-white/40 text-[10px] mt-1 font-normal">
										Range: {results.noticeLow}–{results.noticeHigh} months
									</p>
								</div>
								<div className="text-right">
									<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">
										Estimated Severance
									</p>
									<p className="text-xl font-light tracking-tighter text-white/90">
										{fmtCurrency(results.severance)}
									</p>
									<p className="text-white/40 text-[10px] mt-1 font-normal">
										{fmtCurrency(results.severanceLow)} – {fmtCurrency(results.severanceHigh)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Detail table */}
			<Card>
				<CardHeader>
					<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
						Calculation Detail
					</h3>
				</CardHeader>
				<CardContent>
					<div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
						{[
							{ label: 'Monthly Salary', value: fmtCurrency(results.monthlySalary) },
							{ label: 'Notice Period (estimated)', value: `${results.noticeMonths} months` },
							{ label: 'Notice Period (range)', value: `${results.noticeLow} – ${results.noticeHigh} months` },
							{ label: 'Total Severance (estimated)', value: fmtCurrency(results.severance) },
							{ label: 'Total Severance (range)', value: `${fmtCurrency(results.severanceLow)} – ${fmtCurrency(results.severanceHigh)}` },
						].map(({ label, value }) => (
							<div key={label} className="flex justify-between items-center py-3">
								<span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
								<span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
							</div>
						))}
					</div>

					{results.cappedNote && (
						<p className="mt-4 text-[11px] text-amber-600 dark:text-amber-400">
							Notice period has been capped at {MAX_NOTICE_MONTHS} months. Courts rarely exceed this limit, though exceptional cases exist.
						</p>
					)}
				</CardContent>
			</Card>

			{/* Disclaimer */}
			<p className="text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
				<strong className="text-slate-500 dark:text-white/40">Legal notice:</strong> This calculator provides estimates based on the{' '}
				<em>Bardal v. Globe & Mail Ltd.</em> (1960) framework used in Canadian employment law. Results are for informational
				purposes only and do not constitute legal advice. Actual reasonable notice determinations depend on the specific
				facts of each case and judicial discretion. Consult a qualified employment lawyer for advice about your situation.
			</p>
		</div>
	);
};
