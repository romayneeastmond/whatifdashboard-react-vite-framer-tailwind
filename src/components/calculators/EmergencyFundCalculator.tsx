
import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface EmergencyFundData {
    currentSavings: number;
    monthlyExpenses: number;
    targetMonths: number;
    monthlyContribution: number;
    interestRate: number;
    sideIncome: number;
}

const DEFAULT_DATA: EmergencyFundData = {
    currentSavings: 3000,
    monthlyExpenses: 3000,
    targetMonths: 6,
    monthlyContribution: 400,
    interestRate: 3.5,
    sideIncome: 0,
};

const fmt = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString()}`;

const buildSavingsTimeline = (data: EmergencyFundData, aggressive: boolean) => {
    const contribution = aggressive
        ? data.monthlyContribution * 1.5 + data.sideIncome
        : data.monthlyContribution + data.sideIncome;
    const target = data.monthlyExpenses * data.targetMonths;
    const monthlyRate = data.interestRate / 100 / 12;
    const points: { month: number; balance: number }[] = [];
    let balance = data.currentSavings;

    for (let m = 0; m <= 120; m++) {
        points.push({ month: m, balance: Math.round(balance) });
        if (balance >= target && m > 0) break;
        balance = balance * (1 + monthlyRate) + contribution;
    }
    return points;
};

const computeMonthsToGoal = (timeline: { month: number; balance: number }[], target: number) => {
    const reached = timeline.find(p => p.balance >= target);
    return reached ? reached.month : null;
};

export const EmergencyFundCalculator = () => {
    const [data, setData] = React.useState<EmergencyFundData>(() => {
        const saved = localStorage.getItem('emergency_fund_data');
        if (saved) return JSON.parse(saved);
        return DEFAULT_DATA;
    });

    React.useEffect(() => {
        localStorage.setItem('emergency_fund_data', JSON.stringify(data));
    }, [data]);

    const upd = (key: keyof EmergencyFundData) => (v: number) =>
        setData(prev => ({ ...prev, [key]: v }));

    const stats = useMemo(() => {
        const target = data.monthlyExpenses * data.targetMonths;
        const gap = Math.max(target - data.currentSavings, 0);
        const normalTimeline = buildSavingsTimeline(data, false);
        const aggressiveTimeline = buildSavingsTimeline(data, true);
        const monthsToGoal = computeMonthsToGoal(normalTimeline, target);
        const aggressiveMonthsToGoal = computeMonthsToGoal(aggressiveTimeline, target);
        const currentRunway = data.monthlyExpenses > 0
            ? Math.floor(data.currentSavings / data.monthlyExpenses)
            : 99;

        const maxMonth = Math.max(normalTimeline.length, aggressiveTimeline.length, 2);
        const chartData: { month: string; current: number; aggressive: number; target: number }[] = [];
        for (let m = 0; m < maxMonth; m++) {
            const cur = normalTimeline[m];
            const agg = aggressiveTimeline[m];
            chartData.push({
                month: `Mo ${m}`,
                current: cur ? cur.balance : normalTimeline[normalTimeline.length - 1].balance,
                aggressive: agg ? agg.balance : aggressiveTimeline[aggressiveTimeline.length - 1].balance,
                target,
            });
        }

        return {
            target,
            gap,
            currentRunway,
            monthsToGoal,
            aggressiveMonthsToGoal,
            chartData,
        };
    }, [data]);

    const fundStatus = stats.currentRunway >= data.targetMonths
        ? 'funded'
        : stats.currentRunway >= Math.floor(data.targetMonths / 2)
            ? 'partial'
            : 'underfunded';

    const coveragePercent = Math.min(
        Math.round((data.currentSavings / Math.max(stats.target, 1)) * 100),
        100
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Current Position</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                label="Current Emergency Savings"
                                value={data.currentSavings}
                                min={0}
                                max={100000}
                                step={500}
                                prefix="$"
                                onChange={upd('currentSavings')}
                            />
                            <Slider
                                label="Monthly Expenses"
                                value={data.monthlyExpenses}
                                min={500}
                                max={15000}
                                step={100}
                                prefix="$"
                                onChange={upd('monthlyExpenses')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Target</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                label="Target Coverage (months)"
                                value={data.targetMonths}
                                min={1}
                                max={12}
                                step={1}
                                suffix=" mo"
                                onChange={upd('targetMonths')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Building the Fund</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                label="Monthly Contribution"
                                value={data.monthlyContribution}
                                min={0}
                                max={5000}
                                step={50}
                                prefix="$"
                                onChange={upd('monthlyContribution')}
                            />
                            <Slider
                                label="Side Income (monthly)"
                                value={data.sideIncome}
                                min={0}
                                max={5000}
                                step={100}
                                prefix="$"
                                onChange={upd('sideIncome')}
                            />
                            <Slider
                                label="Savings Interest Rate"
                                value={data.interestRate}
                                min={0}
                                max={10}
                                step={0.1}
                                suffix="%"
                                onChange={upd('interestRate')}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <Card variant="summary">
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Current Runway</p>
                                        <p className={cn(
                                            'text-4xl font-light tracking-tighter font-sans',
                                            fundStatus === 'funded' && 'text-[#52B788]',
                                            fundStatus === 'partial' && 'text-amber-300',
                                            fundStatus === 'underfunded' && 'text-red-400',
                                        )}>
                                            {stats.currentRunway} <span className="text-xl text-white/60">months</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Coverage</p>
                                        <p className={cn(
                                            'text-xl font-light tracking-tighter',
                                            coveragePercent >= 100 ? 'text-[#52B788]' : coveragePercent >= 50 ? 'text-amber-300' : 'text-red-400'
                                        )}>{coveragePercent}%</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 mb-2 font-normal">
                                        <span>Current</span>
                                        <span>Target ({data.targetMonths} mo)</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                coveragePercent >= 100 ? 'bg-[#52B788]' : coveragePercent >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                            )}
                                            style={{ width: `${coveragePercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1.5">
                                        <span className="text-[10px] text-white/50 font-sans">{fmt(data.currentSavings)}</span>
                                        <span className="text-[10px] text-white/50 font-sans">{fmt(stats.target)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Gap to Fill</p>
                                        <p className="text-lg font-medium font-sans text-white/90">{fmt(stats.gap)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Months to Goal</p>
                                        <p className="text-lg font-medium font-sans text-white/90">
                                            {stats.monthsToGoal !== null ? `${stats.monthsToGoal} mo` : 'Already met'}
                                        </p>
                                    </div>
                                </div>

                                {stats.aggressiveMonthsToGoal !== null && stats.monthsToGoal !== null && stats.aggressiveMonthsToGoal < stats.monthsToGoal && (
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Aggressive Mode (×1.5 contributions + side income)</p>
                                        <p className="text-lg font-medium font-sans text-[#52B788]">{stats.aggressiveMonthsToGoal} mo</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className={cn(
                        'flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold py-3 px-4 rounded-xl justify-center border',
                        fundStatus === 'funded'
                            ? 'text-[#387E67] dark:text-[#52B788] bg-emerald-50 dark:bg-white/5 border-emerald-200 dark:border-white/10'
                            : fundStatus === 'partial'
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-white/5 border-amber-200 dark:border-white/10'
                                : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-white/5 border-red-200 dark:border-white/10 animate-pulse'
                    )}>
                        {fundStatus === 'funded'
                            ? <><CheckCircle2 size={13} /> Emergency fund fully covered</>
                            : fundStatus === 'partial'
                                ? <><AlertTriangle size={13} /> Partially funded — keep building</>
                                : <><AlertTriangle size={13} /> Underfunded — vulnerable to a crisis</>
                        }
                    </div>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Savings Projection</h2>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={48}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        }}
                                        formatter={(value: number) => `$${value.toLocaleString()}`}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={28}
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="target"
                                        name="Target"
                                        stroke="rgba(148,163,184,0.4)"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        fill="none"
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="current"
                                        name="Current pace"
                                        stroke="var(--chart-secondary)"
                                        strokeWidth={2}
                                        fill="url(#colorCurrent)"
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="aggressive"
                                        name="Aggressive (×1.5 contributions)"
                                        stroke="var(--chart-primary)"
                                        strokeWidth={2}
                                        fill="url(#colorAggressive)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">What If Scenarios</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { label: 'Add $200/mo contribution', months: computeMonthsToGoal(buildSavingsTimeline({ ...data, monthlyContribution: data.monthlyContribution + 200 }, false), data.monthlyExpenses * data.targetMonths) },
                                    { label: 'Add $500/mo contribution', months: computeMonthsToGoal(buildSavingsTimeline({ ...data, monthlyContribution: data.monthlyContribution + 500 }, false), data.monthlyExpenses * data.targetMonths) },
                                    { label: 'Add $1,000/mo contribution', months: computeMonthsToGoal(buildSavingsTimeline({ ...data, monthlyContribution: data.monthlyContribution + 1000 }, false), data.monthlyExpenses * data.targetMonths) },
                                    { label: 'Cut expenses 10%', months: computeMonthsToGoal(buildSavingsTimeline({ ...data, monthlyExpenses: data.monthlyExpenses * 0.9 }, false), data.monthlyExpenses * 0.9 * data.targetMonths) },
                                    { label: 'Reduce target to 3 months', months: computeMonthsToGoal(buildSavingsTimeline({ ...data, targetMonths: 3 }, false), data.monthlyExpenses * 3) },
                                ].map(({ label, months }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                                        <span className="text-sm text-slate-600 dark:text-white/60">{label}</span>
                                        <span className={cn(
                                            'text-sm font-medium tabular-nums',
                                            months === null ? 'text-[#387E67] dark:text-[#52B788]' : months <= 6 ? 'text-[#387E67] dark:text-[#52B788]' : months <= 18 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                                        )}>
                                            {months === null ? 'Already met' : `${months} mo`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
