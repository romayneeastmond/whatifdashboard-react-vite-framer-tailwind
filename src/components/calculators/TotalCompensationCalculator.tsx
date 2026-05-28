import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { cn } from '../../lib/utils';

interface BenefitConfig {
	key: keyof BenefitsState;
	label: string;
	valueKey: keyof BenefitValues;
	min: number;
	max: number;
	step: number;
	defaultValue: number;
	isPercent?: boolean;
	hint?: string;
}

interface BenefitValues {
	dentalValue: number;
	medicalValue: number;
	visionValue: number;
	lifeInsuranceValue: number;
	disabilityValue: number;
	retirementMatchPct: number;
	miscValue: number;
}

interface BenefitsState {
	dental: boolean;
	medical: boolean;
	vision: boolean;
	lifeInsurance: boolean;
	disability: boolean;
	retirementMatch: boolean;
	misc: boolean;
}

interface TotalCompData {
	grossSalary: number;
	benefits: BenefitsState;
	values: BenefitValues;
}

const DEFAULT_DATA: TotalCompData = {
	grossSalary: 80000,
	benefits: {
		dental: true,
		medical: true,
		vision: false,
		lifeInsurance: false,
		disability: false,
		retirementMatch: false,
		misc: false,
	},
	values: {
		dentalValue: 1000,
		medicalValue: 6000,
		visionValue: 300,
		lifeInsuranceValue: 500,
		disabilityValue: 750,
		retirementMatchPct: 4,
		miscValue: 1500,
	},
};

const BENEFIT_CONFIGS: BenefitConfig[] = [
	{ key: 'dental', label: 'Dental', valueKey: 'dentalValue', min: 0, max: 3000, step: 50, defaultValue: 1000 },
	{ key: 'medical', label: 'Medical / Health', valueKey: 'medicalValue', min: 0, max: 20000, step: 100, defaultValue: 6000 },
	{ key: 'vision', label: 'Vision', valueKey: 'visionValue', min: 0, max: 1000, step: 25, defaultValue: 300 },
	{ key: 'lifeInsurance', label: 'Life Insurance', valueKey: 'lifeInsuranceValue', min: 0, max: 3000, step: 50, defaultValue: 500 },
	{ key: 'disability', label: 'Disability Insurance', valueKey: 'disabilityValue', min: 0, max: 5000, step: 50, defaultValue: 750 },
	{ key: 'retirementMatch', label: 'RRSP / 401k Match', valueKey: 'retirementMatchPct', min: 0, max: 15, step: 0.5, defaultValue: 4, isPercent: true },
	{ key: 'misc', label: 'Other Benefits', valueKey: 'miscValue', min: 0, max: 15000, step: 100, defaultValue: 1500, hint: 'e.g. home office stipend, education budget, wellness allowance, transit pass, stock options' },
];

const fmt = (n: number) =>
	'$' + Math.round(n).toLocaleString('en-CA');

const calcResults = (data: TotalCompData) => {
	const { grossSalary, benefits, values } = data;

	const retirementMatchValue = benefits.retirementMatch
		? grossSalary * (values.retirementMatchPct / 100)
		: 0;

	const breakdown: { label: string; value: number }[] = [
		{ label: 'Dental', value: benefits.dental ? values.dentalValue : 0 },
		{ label: 'Medical / Health', value: benefits.medical ? values.medicalValue : 0 },
		{ label: 'Vision', value: benefits.vision ? values.visionValue : 0 },
		{ label: 'Life Insurance', value: benefits.lifeInsurance ? values.lifeInsuranceValue : 0 },
		{ label: 'Disability Insurance', value: benefits.disability ? values.disabilityValue : 0 },
		{ label: 'RRSP / 401k Match', value: retirementMatchValue },
		{ label: 'Other Benefits', value: benefits.misc ? values.miscValue : 0 },
	].filter(b => b.value > 0);

	const totalBenefits = breakdown.reduce((s, b) => s + b.value, 0);
	const totalComp = grossSalary + totalBenefits;
	const benefitsPct = grossSalary > 0 ? (totalBenefits / grossSalary) * 100 : 0;

	return { breakdown, totalBenefits, totalComp, benefitsPct };
};

export const TotalCompensationCalculator = () => {
	const [data, setData] = React.useState<TotalCompData>(() => {
		const saved = localStorage.getItem('total_comp_data');
		if (saved) {
			const parsed = JSON.parse(saved);
			return {
				...DEFAULT_DATA,
				...parsed,
				benefits: { ...DEFAULT_DATA.benefits, ...parsed.benefits },
				values: { ...DEFAULT_DATA.values, ...parsed.values },
			};
		}
		return DEFAULT_DATA;
	});

	React.useEffect(() => {
		localStorage.setItem('total_comp_data', JSON.stringify(data));
	}, [data]);

	const results = useMemo(() => calcResults(data), [data]);

	const toggleBenefit = (key: keyof BenefitsState) => {
		setData(prev => ({
			...prev,
			benefits: { ...prev.benefits, [key]: !prev.benefits[key] },
		}));
	};

	const setBenefitValue = (key: keyof BenefitValues, value: number) => {
		setData(prev => ({
			...prev,
			values: { ...prev.values, [key]: value },
		}));
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Inputs */}
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Salary</h2>
					</CardHeader>
					<CardContent>
						<Slider
							label="Gross Annual Salary"
							value={data.grossSalary}
							min={20000}
							max={500000}
							step={1000}
							suffix="$"
							onChange={(v) => setData(prev => ({ ...prev, grossSalary: v }))}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Benefits</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{BENEFIT_CONFIGS.map((cfg) => {
								const enabled = data.benefits[cfg.key];
								return (
									<div key={cfg.key} className="space-y-3">
										<label className="flex items-center gap-3 cursor-pointer group select-none">
											<input
												type="checkbox"
												checked={enabled}
												onChange={() => toggleBenefit(cfg.key)}
												aria-label={cfg.label}
												className="w-4 h-4 rounded accent-[#387E67] cursor-pointer"
											/>
											<span className={cn(
												'text-sm transition-colors',
												enabled
													? 'text-slate-900 dark:text-white'
													: 'text-slate-400 dark:text-white/30'
											)}>
												{cfg.label}
											</span>
										</label>
										{enabled && (
											<div className="pl-7">
												<Slider
													label={cfg.isPercent ? 'Employer match (% of salary)' : 'Estimated annual employer cost'}
													value={data.values[cfg.valueKey]}
													min={cfg.min}
													max={cfg.max}
													step={cfg.step}
													suffix={cfg.isPercent ? '%' : '$'}
													onChange={(v) => setBenefitValue(cfg.valueKey, v)}
												/>
												{cfg.isPercent && (
													<p className="text-[10px] text-slate-400 dark:text-white/30 -mt-1">
														= {fmt(data.grossSalary * (data.values[cfg.valueKey] / 100))} / yr
													</p>
												)}
												{cfg.hint && (
													<p className="text-[10px] text-slate-400 dark:text-white/30 -mt-1">
														{cfg.hint}
													</p>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Results */}
			<div className="space-y-6">
				<Card variant="summary">
					<CardContent>
						<div className="flex justify-between items-end">
							<div>
								<p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Total Compensation</p>
								<p className="text-4xl font-light tracking-tighter font-sans text-white">
									{fmt(results.totalComp)}
								</p>
								<p className="text-white/40 text-[10px] mt-1">per year</p>
							</div>
							<div className="text-right space-y-2">
								<div>
									<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-0.5">Base Salary</p>
									<p className="text-xl font-light tracking-tighter text-white/80">{fmt(data.grossSalary)}</p>
								</div>
								<div>
									<p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-0.5">Benefits Value</p>
									<p className="text-xl font-light tracking-tighter text-[#52B788]">{fmt(results.totalBenefits)}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{results.breakdown.length > 0 && (
					<Card>
						<CardHeader>
							<h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Benefits Breakdown</h2>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{results.breakdown.map((b) => (
									<div key={b.label} className="flex justify-between items-center">
										<span className="text-sm text-slate-600 dark:text-white/60">{b.label}</span>
										<span className="text-sm font-medium text-slate-900 dark:text-white">{fmt(b.value)}</span>
									</div>
								))}
								<div className="border-t border-slate-100 dark:border-white/10 pt-3 flex justify-between items-center">
									<span className="text-sm font-medium text-slate-900 dark:text-white">Total Benefits</span>
									<span className="text-sm font-medium text-[#387E67] dark:text-[#52B788]">{fmt(results.totalBenefits)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-2 gap-4">
					<Card>
						<CardContent>
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-1">Benefits vs Salary</p>
							<p className="text-xl font-light text-[#387E67] dark:text-[#52B788]">
								{results.benefitsPct.toFixed(1)}%
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-1">Monthly Take-Home Est.</p>
							<p className="text-xl font-light text-slate-700 dark:text-white/70">
								{fmt(results.totalComp / 12)}
							</p>
						</CardContent>
					</Card>
				</div>

				{results.breakdown.length === 0 && (
					<Card>
						<CardContent>
							<p className="text-sm text-slate-400 dark:text-white/30 text-center py-4">
								Select benefits above to see your total compensation breakdown.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};
