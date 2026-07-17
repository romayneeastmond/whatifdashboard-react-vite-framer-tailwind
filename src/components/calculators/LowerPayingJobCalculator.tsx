import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link2, Link2Off, ArrowLeftRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface JobData {
    annualSalary: number;
    annualBonusPct: number;
    taxRate: number;
    retirementPct: number;
    monthlyExpenses: number;
    monthlyBenefitsValue: number;
}

interface LowerPayingJobData {
    currentJob: JobData;
    newJob: JobData;
    investmentReturn: number;
}

const DEFAULT_DATA: LowerPayingJobData = {
    currentJob: {
        annualSalary: 100000,
        annualBonusPct: 0,
        taxRate: 28,
        retirementPct: 8,
        monthlyExpenses: 3500,
        monthlyBenefitsValue: 0,
    },
    newJob: {
        annualSalary: 78000,
        annualBonusPct: 0,
        taxRate: 25,
        retirementPct: 6,
        monthlyExpenses: 3500,
        monthlyBenefitsValue: 400,
    },
    investmentReturn: 7,
};

const calcJob = (d: JobData) => {
    const monthlyRetirement = (d.annualSalary * d.retirementPct) / 100 / 12;
    const annualTaxable = d.annualSalary - monthlyRetirement * 12;
    const monthlyTax = (annualTaxable * d.taxRate) / 100 / 12;
    const takeHomeMonthly = annualTaxable / 12 - monthlyTax;
    const monthlySurplus = takeHomeMonthly + d.monthlyBenefitsValue - d.monthlyExpenses;
    const annualBonusNet = d.annualSalary * (d.annualBonusPct / 100) * (1 - d.taxRate / 100);
    return { monthlyRetirement, monthlyTax, takeHomeMonthly, monthlySurplus, annualBonusNet };
};

const projectWealth = (monthlyContrib: number, annualReturn: number, years: number): number => {
    const r = annualReturn / 100 / 12;
    if (r === 0) return monthlyContrib * years * 12;
    return monthlyContrib * ((Math.pow(1 + r, years * 12) - 1) / r);
};

const fmt = (n: number) =>
    '$' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

const fmtSigned = (n: number) => (n >= 0 ? '+' : '-') + fmt(n);

const JobPanel = ({
    title,
    data,
    onUpdate,
    accentClass,
    synced,
}: {
    title: string;
    data: JobData;
    onUpdate: (d: JobData) => void;
    accentClass: string;
    synced: boolean;
}) => {
    const res = useMemo(() => calcJob(data), [data]);
    return (
        <div className="space-y-6">
            <h2 className={cn('text-xs font-normal uppercase tracking-[0.2em] leading-none py-1', accentClass)}>{title}</h2>
            <Card>
                <CardHeader>
                    <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Income & Deductions</h3>
                </CardHeader>
                <CardContent>
                    <Slider
                        label="Annual Gross Salary"
                        value={data.annualSalary}
                        min={30000}
                        max={500000}
                        step={1000}
                        prefix="$"
                        onChange={(v) => onUpdate({ ...data, annualSalary: v })}
                    />
                    <Slider
                        label="Annual Bonus"
                        value={data.annualBonusPct}
                        min={0}
                        max={100}
                        step={1}
                        suffix="%"
                        onChange={(v) => onUpdate({ ...data, annualBonusPct: v })}
                    />
                    <Slider
                        label="Estimated Tax Rate"
                        value={data.taxRate}
                        min={0}
                        max={50}
                        suffix="%"
                        onChange={(v) => onUpdate({ ...data, taxRate: v })}
                    />
                    <Slider
                        label="Retirement Contribution"
                        value={data.retirementPct}
                        min={0}
                        max={30}
                        suffix="%"
                        onChange={(v) => onUpdate({ ...data, retirementPct: v })}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Monthly Budget</h3>
                </CardHeader>
                <CardContent>
                    <Slider
                        label="Monthly Expenses"
                        value={data.monthlyExpenses}
                        min={500}
                        max={12000}
                        step={100}
                        prefix="$"
                        onChange={(v) => onUpdate({ ...data, monthlyExpenses: v })}
                    />
                    <Slider
                        label="Benefits Value (health, perks, etc.)"
                        value={data.monthlyBenefitsValue}
                        min={0}
                        max={2000}
                        step={50}
                        prefix="$"
                        onChange={(v) => onUpdate({ ...data, monthlyBenefitsValue: v })}
                    />
                </CardContent>
            </Card>
            <Card variant="summary">
                <CardContent>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Monthly Take-Home</p>
                            <p className="text-4xl font-light tracking-tighter font-sans">
                                {fmt(res.takeHomeMonthly)}
                                <span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">/mo</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Monthly Surplus</p>
                            <p className={cn('text-xl font-light tracking-tighter', res.monthlySurplus >= 0 ? 'text-white/80' : 'text-red-300')}>
                                {res.monthlySurplus >= 0 ? fmt(res.monthlySurplus) : `-${fmt(res.monthlySurplus)}`}
                            </p>
                        </div>
                    </div>
                    {res.annualBonusNet > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal">Annual Bonus (after tax)</p>
                            <p className="text-sm font-light text-white/70">{fmt(res.annualBonusNet)}</p>
                        </div>
                    )}
                    {synced && (
                        <p className="mt-3 text-[10px] text-white/30 uppercase tracking-widest">Synced inputs active — salary edits independently</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export const LowerPayingJobCalculator = () => {
    const [data, setData] = React.useState<LowerPayingJobData>(() => {
        const saved = localStorage.getItem('lowerpayingjob_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_DATA,
                ...parsed,
                currentJob: { ...DEFAULT_DATA.currentJob, ...parsed.currentJob, annualBonusPct: parsed.currentJob?.annualBonusPct ?? 0 },
                newJob: { ...DEFAULT_DATA.newJob, ...parsed.newJob, annualBonusPct: parsed.newJob?.annualBonusPct ?? 0 },
            };
        }
        return DEFAULT_DATA;
    });

    const [syncEnabled, setSyncEnabled] = React.useState(false);

    React.useEffect(() => {
        localStorage.setItem('lowerpayingjob_data', JSON.stringify(data));
    }, [data]);

    const syncedFields = (patch: Partial<JobData>): void => {
        setData(prev => ({
            ...prev,
            currentJob: { ...prev.currentJob, ...patch },
            newJob: { ...prev.newJob, ...patch },
        }));
    };

    const updateCurrent = (d: JobData) => {
        if (syncEnabled) {
            const { annualSalary: _cur, ...rest } = d;
            syncedFields(rest);
            setData(prev => ({ ...prev, currentJob: { ...prev.currentJob, annualSalary: _cur } }));
        } else {
            setData(prev => ({ ...prev, currentJob: d }));
        }
    };

    const updateNew = (d: JobData) => {
        if (syncEnabled) {
            const { annualSalary: _new, ...rest } = d;
            syncedFields(rest);
            setData(prev => ({ ...prev, newJob: { ...prev.newJob, annualSalary: _new } }));
        } else {
            setData(prev => ({ ...prev, newJob: d }));
        }
    };

    const comparison = useMemo(() => {
        const cur = calcJob(data.currentJob);
        const nj = calcJob(data.newJob);

        const monthlyTakeHomeDiff = nj.takeHomeMonthly - cur.takeHomeMonthly;
        const monthlyBenefitsDiff = data.newJob.monthlyBenefitsValue - data.currentJob.monthlyBenefitsValue;
        const effectiveMonthlyDiff = monthlyTakeHomeDiff + monthlyBenefitsDiff;
        const annualTakeHomeDiff = monthlyTakeHomeDiff * 12;

        const surplusDiff = nj.monthlySurplus - cur.monthlySurplus;
        const surplusCurEffective = Math.max(0, cur.monthlySurplus) + cur.annualBonusNet / 12;
        const surplusNewEffective = Math.max(0, nj.monthlySurplus) + nj.annualBonusNet / 12;

        const wealth5Cur = projectWealth(surplusCurEffective, data.investmentReturn, 5);
        const wealth5New = projectWealth(surplusNewEffective, data.investmentReturn, 5);
        const wealth10Cur = projectWealth(surplusCurEffective, data.investmentReturn, 10);
        const wealth10New = projectWealth(surplusNewEffective, data.investmentReturn, 10);
        const wealth5Diff = wealth5New - wealth5Cur;
        const wealth10Diff = wealth10New - wealth10Cur;

        const chartData = [
            { name: '1 Year', Current: Math.round(surplusCurEffective * 12), 'Other Job': Math.round(surplusNewEffective * 12) },
            { name: '5 Years', Current: Math.round(wealth5Cur), 'Other Job': Math.round(wealth5New) },
            { name: '10 Years', Current: Math.round(wealth10Cur), 'Other Job': Math.round(wealth10New) },
        ];

        return {
            cur, nj,
            monthlyTakeHomeDiff, monthlyBenefitsDiff, effectiveMonthlyDiff,
            annualTakeHomeDiff, surplusDiff,
            wealth5Cur, wealth5New, wealth5Diff,
            wealth10Cur, wealth10New, wealth10Diff,
            chartData,
        };
    }, [data]);

    const DiffBadge = ({ value, label }: { value: number; label: string }) => (
        <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
            <span className="text-xs text-slate-500 dark:text-white/50">{label}</span>
            <span className={cn(
                'text-sm font-medium tabular-nums',
                value > 0 ? 'text-emerald-600 dark:text-emerald-400' : value < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-white/50'
            )}>
                {fmtSigned(value)}
            </span>
        </div>
    );

    return (
        <div className="space-y-16">
            <div className="space-y-4">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setData(prev => ({ ...prev, currentJob: prev.newJob, newJob: prev.currentJob }))}
                        aria-label="Flip job inputs"
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-colors border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:border-slate-400 dark:hover:border-white/30"
                    >
                        <ArrowLeftRight size={11} />
                        Flip
                    </button>
                    <button
                        onClick={() => setSyncEnabled(v => !v)}
                        aria-pressed={syncEnabled}
                        aria-label={syncEnabled ? 'Disable input sync' : 'Enable input sync'}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition-colors',
                            syncEnabled
                                ? 'border-[#387E67] text-[#387E67] dark:border-[#52B788] dark:text-[#52B788] bg-[#387E67]/5'
                                : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:border-slate-400 dark:hover:border-white/30'
                        )}
                    >
                        {syncEnabled ? <Link2 size={11} /> : <Link2Off size={11} />}
                        {syncEnabled ? 'Sync On' : 'Sync Off'}
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <JobPanel
                        title="Current Job"
                        data={data.currentJob}
                        onUpdate={updateCurrent}
                        accentClass="text-slate-500 dark:text-white/40"
                        synced={syncEnabled}
                    />
                    <JobPanel
                        title="Other Job"
                        data={data.newJob}
                        onUpdate={updateNew}
                        accentClass="text-emerald-600 dark:text-emerald-400"
                        synced={syncEnabled}
                    />
                </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Comparison & Projections</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Financial Impact</h3>
                        </CardHeader>
                        <CardContent>
                            <DiffBadge value={comparison.monthlyTakeHomeDiff} label="Monthly Take-Home Difference" />
                            <DiffBadge value={comparison.monthlyBenefitsDiff} label="Monthly Benefits Difference" />
                            <DiffBadge value={comparison.effectiveMonthlyDiff} label="Effective Monthly Difference" />
                            <DiffBadge value={comparison.annualTakeHomeDiff} label="Annual Take-Home Difference" />
                            <DiffBadge value={comparison.surplusDiff} label="Monthly Surplus Difference" />
                            <DiffBadge value={comparison.wealth5Diff} label="5-Year Projected Savings Difference" />
                            <DiffBadge value={comparison.wealth10Diff} label="10-Year Projected Savings Difference" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Projected Wealth Accumulation</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Slider
                                    label="Expected Annual Investment Return"
                                    value={data.investmentReturn}
                                    min={1}
                                    max={15}
                                    step={0.5}
                                    suffix="%"
                                    onChange={(v) => setData(prev => ({ ...prev, investmentReturn: v }))}
                                />
                            </div>
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparison.chartData} barCategoryGap="30%">
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-400 dark:text-white/40" />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: 'currentColor' }}
                                            className="text-slate-400 dark:text-white/40"
                                            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'normal', color: '#0F172A' }}
                                            formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                        <Bar dataKey="Current" fill="var(--chart-secondary)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Other Job" fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Current Take-Home', value: fmt(comparison.cur.takeHomeMonthly), sub: '/mo' },
                        { label: 'Other Job Take-Home', value: fmt(comparison.nj.takeHomeMonthly), sub: '/mo' },
                        { label: '10-Year Current Wealth', value: fmt(comparison.wealth10Cur), sub: 'projected' },
                        { label: '10-Year Other Job Wealth', value: fmt(comparison.wealth10New), sub: 'projected' },
                    ].map(({ label, value, sub }) => (
                        <Card key={label}>
                            <CardContent>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1">{label}</p>
                                <p className="text-xl font-light tracking-tight text-slate-900 dark:text-white">
                                    {value}
                                    <span className="text-xs text-slate-400 dark:text-white/30 ml-1">{sub}</span>
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
