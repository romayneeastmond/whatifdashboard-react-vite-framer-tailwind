
import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { cn } from '../../lib/utils';

const ACTIVITY_LEVELS = [
    { id: 'sedentary',  label: 'Sedentary',      description: 'Little or no exercise',           rate: 0.8  },
    { id: 'light',      label: 'Light',           description: 'Light exercise 1–3 days/week',    rate: 1.1  },
    { id: 'moderate',   label: 'Moderate',        description: 'Moderate exercise 3–5 days/week', rate: 1.4  },
    { id: 'active',     label: 'Active',          description: 'Hard exercise 6–7 days/week',     rate: 1.7  },
    { id: 'athlete',    label: 'Athlete',         description: 'Intense training / competition',  rate: 2.1  },
] as const;

type ActivityId = typeof ACTIVITY_LEVELS[number]['id'];
type WeightUnit = 'lbs' | 'kg';

interface ProteinData {
    weight: number;
    weightUnit: WeightUnit;
    age: number;
    activityLevel: ActivityId;
}

const DEFAULT_DATA: ProteinData = {
    weight: 170,
    weightUnit: 'lbs',
    age: 35,
    activityLevel: 'moderate',
};

const SCOOP_GRAMS = 25;

const calcAgeFactor = (age: number): number => {
    if (age >= 65) return 0.2;
    if (age >= 50) return 0.1;
    return 0;
};

const toKg = (weight: number, unit: WeightUnit) =>
    unit === 'lbs' ? weight / 2.2046 : weight;

const ButtonGroup = <T extends string>({
    options,
    value,
    onChange,
    label,
}: {
    options: readonly { id: T; label: string; description?: string }[];
    value: T;
    onChange: (v: T) => void;
    label: string;
}) => {
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
};

export const ProteinCalculator = () => {
    const [data, setData] = React.useState<ProteinData>(() => {
        try {
            const saved = localStorage.getItem('protein_data');
            return saved ? JSON.parse(saved) : DEFAULT_DATA;
        } catch {
            return DEFAULT_DATA;
        }
    });

    React.useEffect(() => {
        localStorage.setItem('protein_data', JSON.stringify(data));
    }, [data]);

    const results = useMemo(() => {
        const activity = ACTIVITY_LEVELS.find((a) => a.id === data.activityLevel) ?? ACTIVITY_LEVELS[2];
        const weightKg = toKg(data.weight, data.weightUnit);
        const ageFactor = calcAgeFactor(data.age);
        const rateGPerKg = activity.rate + ageFactor;

        const proteinG = Math.round(weightKg * rateGPerKg);
        const proteinLow = Math.round(weightKg * (rateGPerKg - 0.15));
        const proteinHigh = Math.round(weightKg * (rateGPerKg + 0.15));

        const scoops = (proteinG / SCOOP_GRAMS).toFixed(1);
        const scoopsLow = (proteinLow / SCOOP_GRAMS).toFixed(1);
        const scoopsHigh = (proteinHigh / SCOOP_GRAMS).toFixed(1);

        const weightKgRounded = Math.round(weightKg * 10) / 10;

        return { proteinG, proteinLow, proteinHigh, scoops, scoopsLow, scoopsHigh, rateGPerKg, weightKgRounded };
    }, [data]);

    const update = (patch: Partial<ProteinData>) => setData((d) => ({ ...d, ...patch }));

    const weightMin = data.weightUnit === 'lbs' ? 66 : 30;
    const weightMax = data.weightUnit === 'lbs' ? 440 : 200;
    const weightStep = data.weightUnit === 'lbs' ? 1 : 0.5;

    const switchUnit = (unit: WeightUnit) => {
        if (unit === data.weightUnit) return;
        const converted =
            unit === 'kg'
                ? Math.round((data.weight / 2.2046) * 10) / 10
                : Math.round(data.weight * 2.2046);
        setData((d) => ({ ...d, weightUnit: unit, weight: converted }));
    };

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
                        {/* Weight with unit toggle */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60">
                                    Body Weight
                                </span>
                                <div className="flex gap-1">
                                    {(['lbs', 'kg'] as WeightUnit[]).map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => switchUnit(u)}
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
                                value={data.weight}
                                min={weightMin}
                                max={weightMax}
                                step={weightStep}
                                suffix={` ${data.weightUnit}`}
                                onChange={(v) => update({ weight: v })}
                            />
                        </div>

                        <Slider
                            label="Age"
                            value={data.age}
                            min={16}
                            max={90}
                            suffix=" yrs"
                            onChange={(v) => update({ age: v })}
                        />

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
                    {/* Primary result */}
                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">
                                        Daily Protein
                                    </p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">
                                        {results.proteinG}
                                        <span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">g</span>
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">
                                        Range: {results.proteinLow}–{results.proteinHigh} g/day
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">
                                        Protein Scoops
                                    </p>
                                    <p className="text-xl font-light tracking-tighter text-white/90">
                                        {results.scoops}
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">
                                        {results.scoopsLow} – {results.scoopsHigh} scoops
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rate card */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">
                                Rate Applied
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#387E67] dark:bg-[#52B788] rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((results.rateGPerKg / 2.5) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-sm font-mono text-slate-700 dark:text-white/80 whitespace-nowrap">
                                    {results.rateGPerKg.toFixed(2)} g / kg
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-white/30 mt-2">
                                Based on activity level{data.age >= 50 ? ' + age bonus (+0.1–0.2 g/kg for 50+)' : ''}
                            </p>
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
                            { label: 'Body Weight', value: `${results.weightKgRounded} kg` },
                            { label: 'Protein Rate', value: `${results.rateGPerKg.toFixed(2)} g per kg` },
                            { label: 'Daily Protein (target)', value: `${results.proteinG} g` },
                            { label: 'Daily Protein (range)', value: `${results.proteinLow} – ${results.proteinHigh} g` },
                            { label: 'Protein Scoops (target)', value: `${results.scoops} scoops` },
                            { label: 'Protein Scoops (range)', value: `${results.scoopsLow} – ${results.scoopsHigh} scoops` },
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
                <strong className="text-slate-500 dark:text-white/40">Note:</strong> Protein targets are estimates based on general
                sports nutrition and dietary guidelines (0.8–2.1 g/kg). A "scoop" is assumed to be {SCOOP_GRAMS} g of protein powder.
                Older adults (50+) receive an upward adjustment to offset age-related muscle loss. Consult a registered dietitian
                for personalized guidance.
            </p>
        </div>
    );
};
