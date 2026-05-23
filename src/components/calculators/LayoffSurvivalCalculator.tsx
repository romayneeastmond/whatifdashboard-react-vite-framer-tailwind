import React, { useMemo } from 'react';
import { LifeBuoy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface LayoffData {
    savings: number;
    severance: number;
    eiMonthly: number;
    eiDuration: number;
    sideIncome: number;
    fixedExpenses: number;
    variableExpenses: number;
    expectedJobSearchMonths: number;
}

const DEFAULT_DATA: LayoffData = {
    savings: 15000,
    severance: 8000,
    eiMonthly: 1800,
    eiDuration: 6,
    sideIncome: 500,
    fixedExpenses: 2200,
    variableExpenses: 800,
    expectedJobSearchMonths: 4,
};

const fmt = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString()}`;

const buildTimeline = (data: LayoffData, survivalMode: boolean) => {
    const variableExpenses = survivalMode
        ? data.variableExpenses * 0.7
        : data.variableExpenses;
    const monthlyExpenses = data.fixedExpenses + variableExpenses;
    const months: { month: number; balance: number }[] = [];
    let balance = data.savings + data.severance;
    const maxMonths = 360;

    for (let m = 0; m <= maxMonths; m++) {
        months.push({ month: m, balance: Math.round(balance) });
        if (balance <= 0 && m > 0) break;
        const income = (m < data.eiDuration ? data.eiMonthly : 0) + data.sideIncome;
        balance += income - monthlyExpenses;
    }
    return months;
};

const computeRunway = (timeline: { month: number; balance: number }[]) => {
    const depleted = timeline.find(p => p.balance <= 0);
    if (depleted) return depleted.month - 1;
    return timeline[timeline.length - 1].month;
};

export const LayoffSurvivalCalculator = () => {
    const [data, setData] = React.useState<LayoffData>(() => {
        const saved = localStorage.getItem('layoff_survival_data');
        if (saved) return JSON.parse(saved);
        return DEFAULT_DATA;
    });

    React.useEffect(() => {
        localStorage.setItem('layoff_survival_data', JSON.stringify(data));
    }, [data]);

    const upd = (key: keyof LayoffData) => (v: number) =>
        setData(prev => ({ ...prev, [key]: v }));

    const stats = useMemo(() => {
        const normalTimeline = buildTimeline(data, false);
        const survivalTimeline = buildTimeline(data, true);
        const runway = computeRunway(normalTimeline);
        const survivalRunway = computeRunway(survivalTimeline);
        const monthlyExpenses = data.fixedExpenses + data.variableExpenses;
        const avgIncome = data.eiMonthly * (data.eiDuration / Math.max(runway, 1)) + data.sideIncome;
        const burnRate = monthlyExpenses - avgIncome;
        const breakEvenIncome = monthlyExpenses - data.sideIncome;
        const totalStarting = data.savings + data.severance;
        const postEiIncome = data.sideIncome;
        const postEiBurnRate = monthlyExpenses - postEiIncome;

        const maxMonth = Math.max(normalTimeline.length, survivalTimeline.length, data.expectedJobSearchMonths + 2);
        const chartData: { month: string; current: number; survival: number }[] = [];
        for (let m = 0; m < maxMonth; m++) {
            const cur = normalTimeline[m];
            const sur = survivalTimeline[m];
            chartData.push({
                month: `Mo ${m}`,
                current: cur ? Math.max(cur.balance, 0) : 0,
                survival: sur ? Math.max(sur.balance, 0) : 0,
            });
        }

        return {
            runway,
            survivalRunway,
            burnRate,
            postEiBurnRate,
            breakEvenIncome,
            totalStarting,
            chartData,
            monthlyExpenses,
        };
    }, [data]);

    const runwayStatus = stats.runway >= 12
        ? 'safe'
        : stats.runway >= 6
            ? 'caution'
            : 'danger';

    const jobFoundBeforeRunout = data.expectedJobSearchMonths <= stats.runway;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Your Funds</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                label="Current Savings"
                                value={data.savings}
                                min={0}
                                max={200000}
                                step={1000}
                                suffix="$"
                                onChange={upd('savings')}
                            />
                            <Slider
                                label="Severance Received"
                                value={data.severance}
                                min={0}
                                max={500000}
                                step={500}
                                suffix="$"
                                onChange={upd('severance')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Income</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                label="EI / Unemployment Benefit (monthly)"
                                value={data.eiMonthly}
                                min={0}
                                max={5000}
                                step={50}
                                suffix="$"
                                onChange={upd('eiMonthly')}
                            />
                            <Slider
                                label="EI Duration"
                                value={data.eiDuration}
                                min={1}
                                max={45}
                                step={1}
                                suffix=" mo"
                                onChange={upd('eiDuration')}
                            />
                            <Slider
                                label="Side Income (monthly)"
                                value={data.sideIncome}
                                min={0}
                                max={5000}
                                step={100}
                                suffix="$"
                                onChange={upd('sideIncome')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Monthly Expenses</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                label="Fixed Expenses (rent, car, insurance)"
                                value={data.fixedExpenses}
                                min={0}
                                max={8000}
                                step={100}
                                suffix="$"
                                onChange={upd('fixedExpenses')}
                            />
                            <Slider
                                label="Variable Expenses (food, entertainment)"
                                value={data.variableExpenses}
                                min={0}
                                max={5000}
                                step={50}
                                suffix="$"
                                onChange={upd('variableExpenses')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Job Search</h2>
                        </CardHeader>
                        <CardContent>
                            <Slider
                                label="Expected Job Search Duration"
                                value={data.expectedJobSearchMonths}
                                min={1}
                                max={24}
                                step={1}
                                suffix=" mo"
                                onChange={upd('expectedJobSearchMonths')}
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
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Runway</p>
                                        <p className={cn(
                                            'text-4xl font-light tracking-tighter font-sans',
                                            runwayStatus === 'safe' && 'text-[#52B788]',
                                            runwayStatus === 'caution' && 'text-amber-300',
                                            runwayStatus === 'danger' && 'text-red-400',
                                        )}>
                                            {stats.runway} <span className="text-xl text-white/60">months</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Survival Mode</p>
                                        <p className="text-xl font-light tracking-tighter text-[#52B788]">{stats.survivalRunway} mo</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Starting Buffer</p>
                                        <p className="text-lg font-medium font-sans text-white/90">{fmt(stats.totalStarting)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Monthly Expenses</p>
                                        <p className="text-lg font-medium font-sans text-white/90">{fmt(stats.monthlyExpenses)}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Break-Even Income</p>
                                        <p className="text-lg font-medium font-sans text-white/90">{fmt(stats.breakEvenIncome)}<span className="text-xs text-white/40">/mo</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Post-EI Burn Rate</p>
                                        <p className="text-lg font-medium font-sans text-white/90">
                                            {stats.postEiBurnRate > 0 ? `-${fmt(stats.postEiBurnRate)}` : fmt(Math.abs(stats.postEiBurnRate))}<span className="text-xs text-white/40">/mo</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className={cn(
                        'flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold py-3 px-4 rounded-xl justify-center border',
                        jobFoundBeforeRunout
                            ? 'text-[#387E67] dark:text-[#52B788] bg-emerald-50 dark:bg-white/5 border-emerald-200 dark:border-white/10'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-white/5 border-red-200 dark:border-white/10 animate-pulse'
                    )}>
                        {jobFoundBeforeRunout
                            ? <><CheckCircle2 size={13} /> Job found before runway ends</>
                            : <><AlertTriangle size={13} /> Job search exceeds runway</>
                        }
                    </div>

                    <Card>
                        <CardHeader>
                            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Cash Flow Projection</h2>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSurvival" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="current"
                                        name="Current"
                                        stroke="var(--chart-secondary)"
                                        strokeWidth={2}
                                        fill="url(#colorCurrent)"
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="survival"
                                        name="Survival Mode (−30% variable)"
                                        stroke="var(--chart-primary)"
                                        strokeWidth={2}
                                        fill="url(#colorSurvival)"
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
                                    { label: 'Cut variable expenses 20%', runway: computeRunway(buildTimeline({ ...data, variableExpenses: data.variableExpenses * 0.8 }, false)) },
                                    { label: 'Cut variable expenses 30%', runway: computeRunway(buildTimeline({ ...data, variableExpenses: data.variableExpenses * 0.7 }, false)) },
                                    { label: 'Cut variable expenses 50%', runway: computeRunway(buildTimeline({ ...data, variableExpenses: data.variableExpenses * 0.5 }, false)) },
                                    { label: 'Add $500/mo side income', runway: computeRunway(buildTimeline({ ...data, sideIncome: data.sideIncome + 500 }, false)) },
                                    { label: 'Add $1,000/mo side income', runway: computeRunway(buildTimeline({ ...data, sideIncome: data.sideIncome + 1000 }, false)) },
                                ].map(({ label, runway }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                                        <span className="text-sm text-slate-600 dark:text-white/60">{label}</span>
                                        <span className={cn(
                                            'text-sm font-medium tabular-nums',
                                            runway >= 12 ? 'text-[#387E67] dark:text-[#52B788]' : runway >= 6 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                                        )}>
                                            {runway} mo
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
