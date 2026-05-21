/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { cn } from '../../lib/utils';

const ACTIVITY_LEVELS = [
	{ id: 'sedentary',  label: 'Sedentary',  description: 'Little or no exercise',            multiplier: 1.2   },
	{ id: 'light',      label: 'Light',      description: 'Light exercise 1–3 days/week',     multiplier: 1.375 },
	{ id: 'moderate',   label: 'Moderate',   description: 'Moderate exercise 3–5 days/week',  multiplier: 1.55  },
	{ id: 'active',     label: 'Active',     description: 'Hard exercise 6–7 days/week',      multiplier: 1.725 },
	{ id: 'very',       label: 'Very Active',description: 'Physical job + hard exercise',     multiplier: 1.9   },
] as const;

const BIOLOGICAL_SEX = [
	{ id: 'male',   label: 'Male'   },
	{ id: 'female', label: 'Female' },
] as const;

type ActivityId = typeof ACTIVITY_LEVELS[number]['id'];
type SexId = typeof BIOLOGICAL_SEX[number]['id'];
type WeightUnit = 'lbs' | 'kg';

interface WeightLossData {
	currentWeight: number;
	targetWeight: number;
	weightUnit: WeightUnit;
	height: number;
	heightUnit: 'cm' | 'in';
	age: number;
	sex: SexId;
	activityLevel: ActivityId;
}

const DEFAULT_DATA: WeightLossData = {
	currentWeight: 200,
	targetWeight: 175,
	weightUnit: 'lbs',
	height: 70,
	heightUnit: 'in',
	age: 35,
	sex: 'male',
	activityLevel: 'moderate',
};

const CALORIES_PER_KG = 7700;
const SAFE_DEFICIT_MIN = 250;
const SAFE_DEFICIT_MAX = 1000;

function toKg(w: number, unit: WeightUnit) {
	return unit === 'lbs' ? w / 2.2046 : w;
}

function toCm(h: number, unit: 'cm' | 'in') {
	return unit === 'in' ? h * 2.54 : h;
}

function fmt(n: number, decimals = 0) {
	return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
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

export const WeightLossCalculator = () => {
	const [data, setData] = React.useState<WeightLossData>(() => {
		try {
			const saved = localStorage.getItem('weightloss_data');
			return saved ? JSON.parse(saved) : DEFAULT_DATA;
		} catch {
			return DEFAULT_DATA;
		}
	});

	React.useEffect(() => {
		localStorage.setItem('weightloss_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => {
		const weightKg = toKg(data.currentWeight, data.weightUnit);
		const targetKg = toKg(data.targetWeight, data.weightUnit);
		const heightCm = toCm(data.height, data.heightUnit);
		const activity = ACTIVITY_LEVELS.find((a) => a.id === data.activityLevel) ?? ACTIVITY_LEVELS[2];

		// Mifflin-St Jeor BMR
		const bmr =
			data.sex === 'male'
				? 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5
				: 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;

		const tdee = Math.round(bmr * activity.multiplier);

		const tolosKg = Math.max(weightKg - targetKg, 0);
		const totalCalories = tolosKg * CALORIES_PER_KG;

		// Deficit = 20% of TDEE, clamped to safe range and floored so intake stays above 1200 kcal
		const deficit = Math.round(Math.min(Math.max(tdee * 0.20, SAFE_DEFICIT_MIN), Math.min(tdee - 1200, SAFE_DEFICIT_MAX)));
		const dailyTarget = tdee - deficit;

		const weeklyLossKg = (deficit * 7) / CALORIES_PER_KG;
		const weeklyLossLbs = weeklyLossKg * 2.2046;

		const weeksToGoal = tolosKg > 0 ? Math.ceil(tolosKg / weeklyLossKg) : 0;
		const monthsToGoal = (weeksToGoal / 4.33).toFixed(1);

		const deficitSafe = deficit >= SAFE_DEFICIT_MIN && dailyTarget >= 1200;

		return {
			bmr: Math.round(bmr),
			tdee,
			deficit,
			dailyTarget,
			weeklyLossKg,
			weeklyLossLbs,
			weeksToGoal,
			monthsToGoal,
			totalCalories: Math.round(totalCalories),
			tolosKg,
			deficitSafe,
		};
	}, [data]);

	const update = (patch: Partial<WeightLossData>) => setData((d) => ({ ...d, ...patch }));

	const switchWeightUnit = (unit: WeightUnit) => {
		if (unit === data.weightUnit) return;
		const factor = unit === 'kg' ? 1 / 2.2046 : 2.2046;
		setData((d) => ({
			...d,
			weightUnit: unit,
			currentWeight: Math.round(d.currentWeight * factor * 10) / 10,
			targetWeight: Math.round(d.targetWeight * factor * 10) / 10,
		}));
	};

	const switchHeightUnit = (unit: 'cm' | 'in') => {
		if (unit === data.heightUnit) return;
		const converted = unit === 'in' ? Math.round((data.height / 2.54) * 10) / 10 : Math.round(data.height * 2.54);
		setData((d) => ({ ...d, heightUnit: unit, height: converted }));
	};

	const wMin = data.weightUnit === 'lbs' ? 66 : 30;
	const wMax = data.weightUnit === 'lbs' ? 500 : 230;
	const hMin = data.heightUnit === 'in' ? 48 : 122;
	const hMax = data.heightUnit === 'in' ? 84 : 213;
	const hStep = data.heightUnit === 'in' ? 0.5 : 1;

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Inputs */}
				<Card>
					<CardHeader>
						<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
							Your Details
						</h3>
					</CardHeader>
					<CardContent>
						<ButtonGroup
							label="Biological Sex"
							options={BIOLOGICAL_SEX}
							value={data.sex}
							onChange={(v) => update({ sex: v })}
						/>

						<Slider
							label="Age"
							value={data.age}
							min={16}
							max={90}
							suffix=" yrs"
							onChange={(v) => update({ age: v })}
						/>

						{/* Height */}
						<div className="mb-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60">
									Height
								</span>
								<div className="flex gap-1">
									{(['in', 'cm'] as const).map((u) => (
										<button
											key={u}
											onClick={() => switchHeightUnit(u)}
											className={cn(
												'px-2.5 py-0.5 text-[10px] font-normal border transition-all cursor-pointer',
												data.heightUnit === u
													? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
													: 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-slate-400 dark:hover:border-white/30'
											)}
										>
											{u}
										</button>
									))}
								</div>
							</div>
							<Slider
								label=""
								value={data.height}
								min={hMin}
								max={hMax}
								step={hStep}
								suffix={` ${data.heightUnit}`}
								onChange={(v) => update({ height: v })}
							/>
						</div>

						{/* Weight */}
						<div className="mb-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60">
									Current &amp; Target Weight
								</span>
								<div className="flex gap-1">
									{(['lbs', 'kg'] as WeightUnit[]).map((u) => (
										<button
											key={u}
											onClick={() => switchWeightUnit(u)}
											className={cn(
												'px-2.5 py-0.5 text-[10px] font-normal border transition-all cursor-pointer',
												data.weightUnit === u
													? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
													: 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-slate-400 dark:hover:border-white/30'
											)}
										>
											{u}
										</button>
									))}
								</div>
							</div>
							<Slider
								label=""
								value={data.currentWeight}
								min={wMin}
								max={wMax}
								step={0.5}
								suffix={` ${data.weightUnit} (current)`}
								onChange={(v) => update({ currentWeight: v })}
							/>
							<Slider
								label=""
								value={data.targetWeight}
								min={wMin}
								max={data.currentWeight}
								step={0.5}
								suffix={` ${data.weightUnit} (target)`}
								onChange={(v) => update({ targetWeight: v })}
							/>
						</div>

						<ButtonGroup
							label="Activity Level"
							options={ACTIVITY_LEVELS}
							value={data.activityLevel}
							onChange={(v) => update({ activityLevel: v })}
						/>
					</CardContent>
				</Card>

				{/* Results */}
				<div className="space-y-6">
					<Card variant="summary">
						<CardContent>
							<div className="flex justify-between items-end">
								<div>
									<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">
										Daily Calories
									</p>
									<p className="text-4xl font-light tracking-tighter font-sans">
										{fmt(results.dailyTarget)}
										<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">kcal</span>
									</p>
									<p className="text-white/40 text-[10px] mt-1 font-normal">
										{fmt(results.deficit)} kcal deficit from TDEE
									</p>
								</div>
								<div className="text-right">
									<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">
										Weekly Loss
									</p>
									<p className="text-xl font-light tracking-tighter text-white/90">
										{fmt(results.weeklyLossLbs, 1)} lbs
									</p>
									<p className="text-white/40 text-[10px] mt-1 font-normal">
										{fmt(results.weeklyLossKg, 2)} kg / week
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Goal timeline */}
					<Card>
						<CardHeader>
							<h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
								Goal Timeline
							</h3>
						</CardHeader>
						<CardContent>
							{results.tolosKg > 0 ? (
								<div className="grid grid-cols-2 gap-4">
									{[
										{ label: 'Time to Goal', value: `${results.weeksToGoal}`, unit: 'weeks' },
										{ label: 'Months', value: results.monthsToGoal, unit: 'mo' },
										{ label: 'Weight to Lose', value: `${fmt(results.tolosKg, 1)}`, unit: data.weightUnit === 'kg' ? 'kg' : `kg (${fmt(results.tolosKg * 2.2046, 1)} lbs)` },
										{ label: 'Total Deficit', value: fmt(results.totalCalories), unit: 'kcal' },
									].map(({ label, value, unit }) => (
										<div key={label} className="border border-slate-100 dark:border-white/5 p-4">
											<p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 mb-1">{label}</p>
											<p className="text-2xl font-light tracking-tight text-slate-900 dark:text-white">
												{value}
												<span className="text-xs text-slate-400 dark:text-white/30 ml-1.5">{unit}</span>
											</p>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-slate-400 dark:text-white/30">
									Set a target weight below your current weight to see your timeline.
								</p>
							)}
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
							{ label: 'Basal Metabolic Rate (BMR)', value: `${fmt(results.bmr)} kcal/day` },
							{ label: 'Total Daily Energy Expenditure (TDEE)', value: `${fmt(results.tdee)} kcal/day` },
							{ label: 'Recommended Deficit', value: `${fmt(results.deficit)} kcal/day` },
							{ label: 'Daily Calorie Target', value: `${fmt(results.dailyTarget)} kcal/day` },
							{ label: 'Estimated Weekly Loss', value: `${fmt(results.weeklyLossLbs, 2)} lbs  (${fmt(results.weeklyLossKg, 2)} kg)` },
							{ label: 'Weeks to Goal', value: results.tolosKg > 0 ? `${results.weeksToGoal} weeks (~${results.monthsToGoal} months)` : '—' },
						].map(({ label, value }) => (
							<div key={label} className="flex justify-between items-center py-3">
								<span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
								<span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
							</div>
						))}
					</div>

					{!results.deficitSafe && (
						<p className="mt-4 text-[11px] text-amber-600 dark:text-amber-400">
							Your calculated deficit brings daily calories below 1,200 kcal. The target has been raised to maintain a safe minimum intake.
						</p>
					)}
				</CardContent>
			</Card>

			<p className="text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
				<strong className="text-slate-500 dark:text-white/40">Note:</strong> BMR is calculated using the Mifflin-St Jeor equation.
				A deficit of 20% of TDEE is applied and clamped between 250–1,000 kcal for safety, so more active individuals sustain a proportionally larger deficit.
				Daily intake is never recommended below 1,200 kcal. These are estimates — individual metabolism varies.
				Consult a healthcare professional before starting any significant caloric restriction.
			</p>
		</div>
	);
};
