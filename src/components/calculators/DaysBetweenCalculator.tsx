/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Controls';

interface DaysBetweenData {
	startDate: string;
	endDate: string;
}

function today() {
	return new Date().toISOString().split('T')[0];
}

function defaultData(): DaysBetweenData {
	const start = today();
	const end = new Date();
	end.setFullYear(end.getFullYear() + 1);
	return { startDate: start, endDate: end.toISOString().split('T')[0] };
}

function fmt(n: number) {
	return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export const DaysBetweenCalculator = () => {
	const [data, setData] = React.useState<DaysBetweenData>(() => {
		try {
			const saved = localStorage.getItem('daysbetween_data');
			return saved ? JSON.parse(saved) : defaultData();
		} catch {
			return defaultData();
		}
	});

	React.useEffect(() => {
		localStorage.setItem('daysbetween_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const start = new Date(data.startDate);
		const end = new Date(data.endDate);
		if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

		const msPerDay = 1000 * 60 * 60 * 24;
		const diffMs = end.getTime() - start.getTime();
		const days = Math.round(diffMs / msPerDay);
		const absDays = Math.abs(days);

		const weeks = absDays / 7;
		const wholeWeeks = Math.floor(weeks);
		const remainderDays = absDays % 7;

		const months = absDays / 30.4375;
		const wholeMonths = Math.floor(months);
		const remainderDaysFromMonths = Math.round((months - wholeMonths) * 30.4375);

		const years = Math.floor(absDays / 365.25);
		const remainderDaysFromYears = Math.round(absDays - years * 365.25);

		const direction = days === 0 ? 'same' : days > 0 ? 'future' : 'past';

		return { days, absDays, weeks, wholeWeeks, remainderDays, months, wholeMonths, remainderDaysFromMonths, years, remainderDaysFromYears, direction };
	}, [data]);

	const inputClass =
		'w-full px-3 py-2 text-sm font-mono bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#387E67] dark:focus:border-[#52B788] transition-colors';

	const swapDates = () => setData((d) => ({ startDate: d.endDate, endDate: d.startDate }));

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Inputs */}
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
							Date Range
						</h3>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<label className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-2 block">
									Start Date
								</label>
								<input
									type="date"
									value={data.startDate}
									onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
									className={inputClass}
								/>
							</div>

							<div className="flex justify-center">
								<button
									onClick={swapDates}
									className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 hover:text-[#387E67] dark:hover:text-[#52B788] transition-colors cursor-pointer border border-slate-200 dark:border-white/10 px-3 py-1.5"
								>
									⇅ Swap
								</button>
							</div>

							<div>
								<label className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-2 block">
									End Date
								</label>
								<input
									type="date"
									value={data.endDate}
									onChange={(e) => setData((d) => ({ ...d, endDate: e.target.value }))}
									className={inputClass}
								/>
							</div>

							<button
								onClick={() => setData((d) => ({ ...d, startDate: today() }))}
								className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 hover:text-[#387E67] dark:hover:text-[#52B788] transition-colors cursor-pointer"
							>
								Set start to today
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Results */}
				<div className="space-y-6">
					{results && results.days !== 0 ? (
						<>
							<Card variant="summary">
								<CardContent>
									<div className="flex justify-between items-end">
										<div>
											<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">
												{results.direction === 'future' ? 'Days Until' : 'Days Since'}
											</p>
											<p className="text-4xl font-light tracking-tighter font-sans">
												{fmt(results.absDays)}
												<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">days</span>
											</p>
											<p className="text-white/40 text-[10px] mt-1 font-normal">
												{results.direction === 'future' ? 'in the future' : 'in the past'}
											</p>
										</div>
										<div className="text-right">
											<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">
												Weeks
											</p>
											<p className="text-xl font-light tracking-tighter text-white/90">
												{fmt(Math.round(results.weeks * 10) / 10)}
											</p>
											<p className="text-white/40 text-[10px] mt-1 font-normal">
												{results.wholeWeeks}w {results.remainderDays}d
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
										Breakdown
									</h3>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										{[
											{ label: 'Days', value: fmt(results.absDays), unit: 'total' },
											{ label: 'Weeks', value: `${results.wholeWeeks}`, unit: `weeks + ${results.remainderDays} days` },
											{ label: 'Months', value: `${results.wholeMonths}`, unit: `months + ${results.remainderDaysFromMonths} days` },
											{ label: 'Years', value: `${results.years}`, unit: `years + ${results.remainderDaysFromYears} days` },
										].map(({ label, value, unit }) => (
											<div key={label} className="border border-slate-100 dark:border-white/5 p-4">
												<p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 mb-1">{label}</p>
												<p className="text-2xl font-light tracking-tight text-slate-900 dark:text-white">
													{value}
												</p>
												<p className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5">{unit}</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</>
					) : results?.days === 0 ? (
						<Card>
							<CardContent>
								<p className="text-sm text-slate-400 dark:text-white/30 py-4 text-center">
									Both dates are the same — difference is 0 days.
								</p>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent>
								<p className="text-sm text-slate-400 dark:text-white/30 py-4 text-center">
									Enter valid start and end dates to calculate the difference.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			{/* Detail table */}
			{results && results.absDays > 0 && (
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
							Calculation Detail
						</h3>
					</CardHeader>
					<CardContent>
						<div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
							{[
								{ label: 'Total Days', value: fmt(results.absDays) },
								{ label: 'Total Weeks', value: `${fmt(Math.round(results.weeks * 100) / 100)} (${results.wholeWeeks}w ${results.remainderDays}d)` },
								{ label: 'Total Months', value: `${fmt(Math.round(results.months * 10) / 10)} (${results.wholeMonths}mo ${results.remainderDaysFromMonths}d)` },
								{ label: 'Total Years', value: `${results.years}yr ${results.remainderDaysFromYears}d` },
								{ label: 'Direction', value: results.direction === 'future' ? 'End date is in the future' : 'End date is in the past' },
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
