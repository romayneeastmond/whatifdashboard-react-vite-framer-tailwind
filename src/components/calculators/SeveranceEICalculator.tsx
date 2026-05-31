
import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { cn } from '../../lib/utils';

const STORAGE_KEY = 'severanceei_data';

const PROVINCES = [
    { id: 'on', label: 'Ontario',        termMax: 8,  sevWeekPerYear: 1, sevMax: 26, sevMinYears: 5, sevLargeEmployer: true  },
    { id: 'bc', label: 'BC',             termMax: 8,  sevWeekPerYear: 0, sevMax: 0,  sevMinYears: 0, sevLargeEmployer: false },
    { id: 'ab', label: 'Alberta',        termMax: 8,  sevWeekPerYear: 0, sevMax: 0,  sevMinYears: 0, sevLargeEmployer: false },
    { id: 'qc', label: 'Quebec',         termMax: 8,  sevWeekPerYear: 1, sevMax: 8,  sevMinYears: 0, sevLargeEmployer: false },
    { id: 'other', label: 'Other / Federal', termMax: 8, sevWeekPerYear: 0, sevMax: 0, sevMinYears: 0, sevLargeEmployer: false },
] as const;

const EI_REGIONS = [
    { id: 'low',    label: 'Low (<6%)',      rate: 5,  minHours: 700, maxWeeks: 35 },
    { id: 'mod',    label: 'Moderate (6–9%)',rate: 7.5, minHours: 595, maxWeeks: 40 },
    { id: 'high',   label: 'High (9–13%)',   rate: 11, minHours: 490, maxWeeks: 43 },
    { id: 'vhigh',  label: 'Very High (>13%)',rate: 14, minHours: 420, maxWeeks: 45 },
] as const;

type ProvinceId = typeof PROVINCES[number]['id'];
type EIRegionId = typeof EI_REGIONS[number]['id'];

const EI_MAX_INSURABLE = 63200;
const EI_BENEFIT_RATE   = 0.55;
const EI_MAX_WEEKLY     = Math.round((EI_MAX_INSURABLE / 52) * EI_BENEFIT_RATE);

interface SeveranceData {
    annualSalary: number;
    yearsOfService: number;
    province: ProvinceId;
    largeEmployer: boolean;
    hoursPerWeek: number;
    weeksWorked: number;
    eiRegion: EIRegionId;
    receivingSeveranceInLieu: boolean;
}

const DEFAULT_DATA: SeveranceData = {
    annualSalary: 70000,
    yearsOfService: 6,
    province: 'on',
    largeEmployer: true,
    hoursPerWeek: 40,
    weeksWorked: 52,
    eiRegion: 'mod',
    receivingSeveranceInLieu: true,
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString();
const fmtWk = (n: number) => `${n} wk${n !== 1 ? 's' : ''}`;

const ButtonGroup = <T extends string>({
    options, value, onChange, label,
}: {
    options: readonly { id: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
    label: string;
}) => (
    <div className="mb-6">
        <span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-3 block">{label}</span>
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
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

const Toggle = ({ label, description, value, onChange }: {
    label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) => (
    <div className="mb-5 flex items-start justify-between gap-4">
        <div>
            <span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 block">{label}</span>
            {description && <span className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5 block">{description}</span>}
        </div>
        <button
            onClick={() => onChange(!value)}
            className={cn(
                'shrink-0 w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                value ? 'bg-[#387E67] dark:bg-[#52B788]' : 'bg-slate-200 dark:bg-white/20'
            )}
            aria-pressed={value}
            aria-label={label}
        >
            <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', value ? 'left-5' : 'left-0.5')} />
        </button>
    </div>
);

export const SeveranceEICalculator = ({ compact }: { compact?: boolean }) => {
    const [data, setData] = React.useState<SeveranceData>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA;
        } catch { return DEFAULT_DATA; }
    });

    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const results = useMemo(() => {
        const province = PROVINCES.find(p => p.id === data.province) ?? PROVINCES[0];
        const region   = EI_REGIONS.find(r => r.id === data.eiRegion) ?? EI_REGIONS[1];
        const weekly   = data.annualSalary / 52;

        // ESA termination pay: 1 week/year, max termMax weeks
        const termWeeks = Math.min(Math.max(data.yearsOfService, 0), province.termMax);
        const termPay   = weekly * termWeeks;

        // ESA severance pay (Ontario: must have >5 yrs AND large employer if required)
        let sevWeeks = 0;
        if (province.sevWeekPerYear > 0) {
            const qualifies = data.yearsOfService >= province.sevMinYears &&
                (!province.sevLargeEmployer || data.largeEmployer);
            if (qualifies) {
                sevWeeks = Math.min(data.yearsOfService * province.sevWeekPerYear, province.sevMax);
            }
        }
        const sevPay = weekly * sevWeeks;
        const totalESA = termPay + sevPay;

        // EI: insurable hours in last 52 weeks
        const insurableHours  = data.hoursPerWeek * data.weeksWorked;
        const qualifies       = insurableHours >= region.minHours;

        // Weekly insurable earnings capped at EI_MAX_INSURABLE / 52
        const weeklyInsurable = Math.min(weekly, EI_MAX_INSURABLE / 52);
        const weeklyBenefit   = Math.min(weeklyInsurable * EI_BENEFIT_RATE, EI_MAX_WEEKLY);

        // Duration: linear interpolation between minHours → 14 weeks and maxHours(1820) → maxWeeks
        const clampedHours = Math.min(Math.max(insurableHours, region.minHours), 1820);
        const durationWeeks = qualifies
            ? Math.round(14 + ((clampedHours - region.minHours) / (1820 - region.minHours)) * (region.maxWeeks - 14))
            : 0;

        // If receiving severance in lieu, EI starts after severance period
        const waitWeeks  = data.receivingSeveranceInLieu ? termWeeks : 0;
        const eiTotal    = weeklyBenefit * durationWeeks;

        // Runway
        const totalIncome = totalESA + eiTotal;
        const monthlyExpenseProxy = data.annualSalary / 12;
        const runwayMonths = totalIncome / monthlyExpenseProxy;

        return {
            termWeeks, termPay, sevWeeks, sevPay, totalESA,
            insurableHours, qualifies, weeklyBenefit, durationWeeks,
            eiTotal, waitWeeks, totalIncome, runwayMonths,
            weekly, region,
        };
    }, [data]);

    const update = (patch: Partial<SeveranceData>) => setData(d => ({ ...d, ...patch }));

    const province = PROVINCES.find(p => p.id === data.province) ?? PROVINCES[0];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Employment Details</h2>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Annual Salary" value={data.annualSalary} min={25000} max={300000} step={1000} prefix="$" onChange={v => update({ annualSalary: v })} />
                            <Slider label="Years of Service" value={data.yearsOfService} min={0} max={40} suffix=" yrs" onChange={v => update({ yearsOfService: v })} />
                            <ButtonGroup label="Province" options={PROVINCES} value={data.province} onChange={v => update({ province: v })} />
                            {province.sevLargeEmployer && (
                                <Toggle
                                    label="Large Employer"
                                    description="Employer payroll exceeds $2.5M/yr — required for Ontario ESA severance pay"
                                    value={data.largeEmployer}
                                    onChange={v => update({ largeEmployer: v })}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">EI Eligibility</h2>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Hours Worked per Week" value={data.hoursPerWeek} min={1} max={60} suffix=" hrs" onChange={v => update({ hoursPerWeek: v })} />
                            <Slider label="Weeks Worked (Last 52 Weeks)" value={data.weeksWorked} min={1} max={52} suffix=" wks" onChange={v => update({ weeksWorked: v })} />
                            <ButtonGroup label="Regional Unemployment Rate" options={EI_REGIONS} value={data.eiRegion} onChange={v => update({ eiRegion: v })} />
                            <Toggle
                                label="Receiving Pay in Lieu of Notice"
                                description="EI cannot start until after your notice period ends — delays EI access"
                                value={data.receivingSeveranceInLieu}
                                onChange={v => update({ receivingSeveranceInLieu: v })}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Employment Standards Act (ESA) Minimums</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                                {[
                                    { label: 'Termination Pay', sub: `${results.termWeeks} wks × ${fmt(results.weekly)}/wk`, value: fmt(results.termPay) },
                                    { label: 'Severance Pay',   sub: results.sevWeeks > 0 ? `${results.sevWeeks} wks × ${fmt(results.weekly)}/wk` : 'Not applicable', value: results.sevWeeks > 0 ? fmt(results.sevPay) : '—' },
                                    { label: 'Total ESA Minimum', sub: '', value: fmt(results.totalESA) },
                                ].map(({ label, sub, value }) => (
                                    <div key={label} className="flex justify-between items-center py-3">
                                        <div>
                                            <span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider block">{label}</span>
                                            {sub && <span className="text-[10px] text-slate-400 dark:text-white/25">{sub}</span>}
                                        </div>
                                        <span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Employment Insurance</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                                {[
                                    { label: 'Insurable Hours',      value: `${results.insurableHours.toLocaleString()} hrs` },
                                    { label: 'Minimum to Qualify',   value: `${results.region.minHours.toLocaleString()} hrs` },
                                    { label: 'EI Eligible',          value: results.qualifies ? 'Yes' : 'No — Insufficient hours' },
                                    { label: 'Weekly Benefit',       value: results.qualifies ? fmt(results.weeklyBenefit) : '—' },
                                    { label: 'Duration',             value: results.qualifies ? fmtWk(results.durationWeeks) : '—' },
                                    ...(results.waitWeeks > 0 ? [{ label: 'EI Starts After', value: `${results.waitWeeks}-week notice period` }] : []),
                                    { label: 'Total EI Income',      value: results.qualifies ? fmt(results.eiTotal) : '—' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-3">
                                        <span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
                                        <span className={cn('font-mono text-sm', label === 'EI Eligible' ? (results.qualifies ? 'text-[#387E67] dark:text-[#52B788]' : 'text-red-500 dark:text-red-400') : 'text-slate-900 dark:text-white')}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Total Estimated Income</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">
                                        {fmt(results.totalIncome)}
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">
                                        Severance {fmt(results.totalESA)} + EI {results.qualifies ? fmt(results.eiTotal) : '$0'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Income Runway</p>
                                    <p className="text-xl font-light tracking-tighter text-white/90">
                                        {results.runwayMonths.toFixed(1)} months
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">vs current salary</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!results.qualifies && (
                        <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                <strong>EI not available.</strong> You need {results.region.minHours.toLocaleString()} insurable hours in your region but recorded {results.insurableHours.toLocaleString()}. Adjust hours or weeks worked if your records differ.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {!compact && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Full Breakdown</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                            {[
                                { label: 'Weekly Salary',              value: fmt(results.weekly) },
                                { label: 'Termination Pay',            value: `${fmt(results.termPay)} (${results.termWeeks} wks)` },
                                ...(results.sevWeeks > 0 ? [{ label: 'Severance Pay', value: `${fmt(results.sevPay)} (${results.sevWeeks} wks)` }] : []),
                                { label: 'Total Statutory Minimums',   value: fmt(results.totalESA) },
                                { label: 'EI Weekly Benefit',          value: results.qualifies ? fmt(results.weeklyBenefit) : 'N/A' },
                                { label: 'EI Benefit Duration',        value: results.qualifies ? fmtWk(results.durationWeeks) : 'N/A' },
                                { label: 'Total EI Income',            value: results.qualifies ? fmt(results.eiTotal) : 'N/A' },
                                { label: 'Combined Severance + EI',    value: fmt(results.totalIncome) },
                                { label: 'Income Runway',              value: `${results.runwayMonths.toFixed(1)} months` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-3">
                                    <span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
                                    <span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
                            Employment Standards Act (ESA) amounts shown are statutory minimums only. Common law notice (Bardal) may significantly exceed these figures. EI duration uses a simplified interpolation model based on ESDC tables. Max insurable earnings: {fmt(EI_MAX_INSURABLE)}/yr. Max weekly EI: {fmt(EI_MAX_WEEKLY)}.
                        </p>
                    </CardContent>
                </Card>
            )}

            {!compact && (
                <p className="text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
                    <strong className="text-slate-500 dark:text-white/40">Legal notice:</strong> This calculator provides general estimates for Canadian severance and EI entitlements.
                    Results are for informational purposes only and do not constitute legal or financial advice. ESA rules vary by province.
                    Consult a qualified employment lawyer and visit Canada.ca for official EI rates, tables, and qualifying conditions.
                </p>
            )}
        </div>
    );
};
