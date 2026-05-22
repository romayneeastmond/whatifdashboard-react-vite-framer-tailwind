
import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { cn } from '../../lib/utils';

const BIOLOGICAL_SEX = [
	{ id: 'male',   label: 'Male'   },
	{ id: 'female', label: 'Female' },
] as const;

const ACTIVITY_LEVELS = [
	{ id: 'sedentary', label: 'Sedentary',    description: 'Little or no exercise',           multiplier: 1.2   },
	{ id: 'light',     label: 'Light',        description: 'Light exercise 1–3 days/week',    multiplier: 1.375 },
	{ id: 'moderate',  label: 'Moderate',     description: 'Moderate exercise 3–5 days/week', multiplier: 1.55  },
	{ id: 'active',    label: 'Active',       description: 'Hard exercise 6–7 days/week',     multiplier: 1.725 },
	{ id: 'very',      label: 'Very Active',  description: 'Physical job + hard exercise',    multiplier: 1.9   },
] as const;

const WEEKLY_GOALS = [
	{ id: '0.5', label: '0.5 lbs/wk', deficit: 250,  description: 'Conservative — easier to sustain' },
	{ id: '1.0', label: '1 lb/wk',    deficit: 500,  description: 'Standard — recommended starting point' },
	{ id: '1.5', label: '1.5 lbs/wk', deficit: 750,  description: 'Moderate — requires discipline' },
	{ id: '2.0', label: '2 lbs/wk',   deficit: 1000, description: 'Aggressive — hard to maintain long-term' },
] as const;

type SexId      = typeof BIOLOGICAL_SEX[number]['id'];
type ActivityId = typeof ACTIVITY_LEVELS[number]['id'];
type GoalId     = typeof WEEKLY_GOALS[number]['id'];
type WeightUnit = 'lbs' | 'kg';

interface CalorieData {
	sex: SexId;
	age: number;
	currentWeight: number;
	weightUnit: WeightUnit;
	height: number;
	heightUnit: 'cm' | 'in';
	activityLevel: ActivityId;
	weeklyGoal: GoalId;
	exerciseCalories: number;
}

const DEFAULT_DATA: CalorieData = {
	sex: 'male',
	age: 35,
	currentWeight: 200,
	weightUnit: 'lbs',
	height: 70,
	heightUnit: 'in',
	activityLevel: 'moderate',
	weeklyGoal: '1.0',
	exerciseCalories: 0,
};

function toKg(w: number, unit: WeightUnit) { return unit === 'lbs' ? w / 2.2046 : w; }
function toCm(h: number, unit: 'cm' | 'in') { return unit === 'in' ? h * 2.54 : h; }
function fmt(n: number, d = 0) { return n.toLocaleString(undefined, { maximumFractionDigits: d }); }

function ButtonGroup<T extends string>({
	options, value, onChange, label,
}: {
	options: readonly { id: T; label: string; description?: string }[];
	value: T;
	onChange: (v: T) => void;
	label: string;
}) {
	return (
		<div className="mb-6">
			<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-3 block">{label}</span>
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

export const CalorieDeficitCalculator = () => {
	const [data, setData] = React.useState<CalorieData>(() => {
		try {
			const saved = localStorage.getItem('caloriedeficit_data');
			return saved ? JSON.parse(saved) : DEFAULT_DATA;
		} catch { return DEFAULT_DATA; }
	});

	React.useEffect(() => {
		localStorage.setItem('caloriedeficit_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const weightKg  = toKg(data.currentWeight, data.weightUnit);
		const heightCm  = toCm(data.height, data.heightUnit);
		const activity  = ACTIVITY_LEVELS.find(a => a.id === data.activityLevel) ?? ACTIVITY_LEVELS[2];
		const goal      = WEEKLY_GOALS.find(g => g.id === data.weeklyGoal) ?? WEEKLY_GOALS[1];

		const bmr = data.sex === 'male'
			? 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5
			: 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;

		const tdee = Math.round(bmr * activity.multiplier);

		const totalDeficit = goal.deficit;
		const exercisePortion = Math.min(data.exerciseCalories, totalDeficit);
		const dietPortion = totalDeficit - exercisePortion;
		const dailyFoodTarget = tdee - dietPortion;

		const safe = dailyFoodTarget >= 1200;
		const safeDietPortion = safe ? dietPortion : Math.max(tdee - 1200, 0);
		const safeFoodTarget  = tdee - safeDietPortion;
		const effectiveDeficit = safeDietPortion + exercisePortion;

		const comparison = WEEKLY_GOALS.map(g => {
			const dp = Math.max(g.deficit - exercisePortion, 0);
			const ft = tdee - dp;
			const s  = ft >= 1200;
			return {
				id: g.id,
				label: g.label,
				deficit: g.deficit,
				foodTarget: s ? ft : Math.max(tdee - 1200, 0),
				safe: s,
			};
		});

		return { bmr: Math.round(bmr), tdee, totalDeficit, exercisePortion, dietPortion: safeDietPortion, dailyFoodTarget: safeFoodTarget, effectiveDeficit, safe, comparison };
	}, [data]);

	const update = (patch: Partial<CalorieData>) => setData(d => ({ ...d, ...patch }));

	const switchWeightUnit = (unit: WeightUnit) => {
		if (unit === data.weightUnit) return;
		const factor = unit === 'kg' ? 1 / 2.2046 : 2.2046;
		setData(d => ({ ...d, weightUnit: unit, currentWeight: Math.round(d.currentWeight * factor * 10) / 10 }));
	};

	const switchHeightUnit = (unit: 'cm' | 'in') => {
		if (unit === data.heightUnit) return;
		const converted = unit === 'in' ? Math.round((data.height / 2.54) * 10) / 10 : Math.round(data.height * 2.54);
		setData(d => ({ ...d, heightUnit: unit, height: converted }));
	};

	const wMin = data.weightUnit === 'lbs' ? 66 : 30;
	const wMax = data.weightUnit === 'lbs' ? 500 : 230;
	const hMin = data.heightUnit === 'in' ? 48 : 122;
	const hMax = data.heightUnit === 'in' ? 84 : 213;

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Inputs */}
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Your Details</h3>
					</CardHeader>
					<CardContent>
						<ButtonGroup label="Biological Sex" options={BIOLOGICAL_SEX} value={data.sex} onChange={v => update({ sex: v })} />

						<Slider label="Age" value={data.age} min={16} max={90} suffix=" yrs" onChange={v => update({ age: v })} />

						<div className="mb-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60">Height</span>
								<div className="flex gap-1">
									{(['in', 'cm'] as const).map(u => (
										<button key={u} onClick={() => switchHeightUnit(u)} className={cn('px-2.5 py-0.5 text-[10px] font-normal border transition-all cursor-pointer', data.heightUnit === u ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-slate-400 dark:hover:border-white/30')}>{u}</button>
									))}
								</div>
							</div>
							<Slider label="" value={data.height} min={hMin} max={hMax} suffix={` ${data.heightUnit}`} onChange={v => update({ height: v })} />
						</div>

						<div className="mb-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60">Current Weight</span>
								<div className="flex gap-1">
									{(['lbs', 'kg'] as WeightUnit[]).map(u => (
										<button key={u} onClick={() => switchWeightUnit(u)} className={cn('px-2.5 py-0.5 text-[10px] font-normal border transition-all cursor-pointer', data.weightUnit === u ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-slate-400 dark:hover:border-white/30')}>{u}</button>
									))}
								</div>
							</div>
							<Slider label="" value={data.currentWeight} min={wMin} max={wMax} step={0.5} suffix={` ${data.weightUnit}`} onChange={v => update({ currentWeight: v })} />
						</div>

						<ButtonGroup label="Activity Level (baseline)" options={ACTIVITY_LEVELS} value={data.activityLevel} onChange={v => update({ activityLevel: v })} />

						<Slider
							label="Additional Exercise Calories Burned / Day"
							value={data.exerciseCalories}
							min={0}
							max={800}
							step={25}
							suffix=" kcal"
							onChange={v => update({ exerciseCalories: v })}
						/>
					</CardContent>
				</Card>

				{/* Results */}
				<div className="space-y-6">
					<Card variant="summary">
						<CardContent>
							<div className="flex justify-between items-end">
								<div>
									<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Daily Food Target</p>
									<p className="text-4xl font-light tracking-tighter font-sans">
										{fmt(results.dailyFoodTarget)}
										<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">kcal</span>
									</p>
									<p className="text-white/40 text-[10px] mt-1 font-normal">
										{fmt(results.dietPortion)} kcal less than your TDEE of {fmt(results.tdee)}
									</p>
								</div>
								{results.exercisePortion > 0 && (
									<div className="text-right">
										<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Exercise Contribution</p>
										<p className="text-xl font-light tracking-tighter text-white/90">{fmt(results.exercisePortion)} kcal</p>
										<p className="text-white/40 text-[10px] mt-1 font-normal">Total deficit: {fmt(results.effectiveDeficit)} kcal/day</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Goal selector */}
					<Card>
						<CardHeader>
							<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Weekly Loss Goal</h3>
						</CardHeader>
						<CardContent>
							<ButtonGroup label="" options={WEEKLY_GOALS} value={data.weeklyGoal} onChange={v => update({ weeklyGoal: v })} />
							{!results.safe && (
								<p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
									This goal would bring your food intake below 1,200 kcal/day. Target has been adjusted to the safe minimum.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Strategy comparison table */}
			<Card>
				<CardHeader>
					<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Strategy Comparison</h3>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-xs">
							<thead>
								<tr className="border-b border-slate-100 dark:border-white/5">
									<th className="text-left py-2 pr-4 text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-normal">Goal</th>
									<th className="text-right py-2 pr-4 text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-normal">Total Deficit</th>
									<th className="text-right py-2 pr-4 text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-normal">Food Target</th>
									<th className="text-right py-2 text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-normal">10 lb Loss In</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 dark:divide-white/5">
								{results.comparison.map(row => {
									const isSelected = row.id === data.weeklyGoal;
									const weeksTo10 = Math.ceil(10 / parseFloat(row.id));
									return (
										<tr
											key={row.id}
											onClick={() => update({ weeklyGoal: row.id as GoalId })}
											className={cn('cursor-pointer transition-colors', isSelected ? 'bg-[#387E67]/5 dark:bg-[#52B788]/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]')}
										>
											<td className={cn('py-3 pr-4 font-medium', isSelected ? 'text-[#387E67] dark:text-[#52B788]' : 'text-slate-700 dark:text-white/70')}>{row.label}</td>
											<td className="py-3 pr-4 text-right font-mono text-slate-600 dark:text-white/50">{fmt(row.deficit)} kcal/day</td>
											<td className={cn('py-3 pr-4 text-right font-mono', row.safe ? 'text-slate-600 dark:text-white/50' : 'text-amber-600 dark:text-amber-400')}>
												{fmt(row.foodTarget)} kcal{!row.safe && ' ⚠'}
											</td>
											<td className="py-3 text-right font-mono text-slate-600 dark:text-white/50">{weeksTo10} weeks</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					{data.exerciseCalories > 0 && (
						<p className="mt-3 text-[10px] text-slate-400 dark:text-white/30">
							Exercise contribution of {fmt(data.exerciseCalories)} kcal/day applied to all strategies.
						</p>
					)}
				</CardContent>
			</Card>

			{/* Detail */}
			<Card>
				<CardHeader>
					<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Calculation Detail</h3>
				</CardHeader>
				<CardContent>
					<div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
						{[
							{ label: 'Basal Metabolic Rate (BMR)',             value: `${fmt(results.bmr)} kcal/day` },
							{ label: 'Total Daily Energy Expenditure (TDEE)',  value: `${fmt(results.tdee)} kcal/day` },
							{ label: 'Exercise Calories (your input)',          value: `${fmt(results.exercisePortion)} kcal/day` },
							{ label: 'Diet Reduction Required',                value: `${fmt(results.dietPortion)} kcal/day` },
							{ label: 'Daily Food Calorie Target',              value: `${fmt(results.dailyFoodTarget)} kcal/day` },
							{ label: 'Total Effective Deficit',                value: `${fmt(results.effectiveDeficit)} kcal/day` },
						].map(({ label, value }) => (
							<div key={label} className="flex justify-between items-center py-3">
								<span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
								<span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<p className="text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
				<strong className="text-slate-500 dark:text-white/40">Note:</strong> BMR is calculated using the Mifflin-St Jeor equation. Daily food intake is never recommended below 1,200 kcal.
				Exercise calories are subtracted from the required food reduction — increasing exercise lets you eat more while maintaining the same deficit.
				These are estimates; individual metabolism varies. Consult a healthcare professional before starting any significant caloric restriction.
			</p>
		</div>
	);
};
