
import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STORAGE_KEY = 'careerpath_data';

interface CareerData {
    currentSalary: number;
    annualRaise: number;
    yearsToModel: number;
    promotionEveryYears: number;
    promotionBump: number;
    jobHopEveryYears: number;
    jobHopBump: number;
}

const DEFAULT_DATA: CareerData = {
    currentSalary: 75000,
    annualRaise: 3,
    yearsToModel: 20,
    promotionEveryYears: 4,
    promotionBump: 15,
    jobHopEveryYears: 3,
    jobHopBump: 15,
};

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtShort = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
};

const project = (salary: number, years: number, annualRaise: number, eventEvery: number, eventBump: number) => {
    const points: { year: number; salary: number; lifetime: number }[] = [];
    let s = salary;
    let lifetime = 0;
    for (let y = 0; y <= years; y++) {
        if (y > 0) {
            s = s * (1 + annualRaise / 100);
            if (eventEvery > 0 && y % eventEvery === 0) s = s * (1 + eventBump / 100);
        }
        lifetime += s;
        points.push({ year: y, salary: Math.round(s), lifetime: Math.round(lifetime) });
    }
    return points;
};

export const CareerPathCalculator = ({ compact }: { compact?: boolean }) => {
    const [data, setData] = React.useState<CareerData>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_DATA;
        } catch { return DEFAULT_DATA; }
    });

    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const results = useMemo(() => {
        const stayPoints   = project(data.currentSalary, data.yearsToModel, data.annualRaise, data.promotionEveryYears, data.promotionBump);
        const hopPoints    = project(data.currentSalary, data.yearsToModel, data.annualRaise, data.jobHopEveryYears, data.jobHopBump);
        const noGrowthPts  = project(data.currentSalary, data.yearsToModel, 0, 0, 0);

        const chart = stayPoints.map((s, i) => ({
            year:       s.year,
            'Stay & Promote': s.salary,
            'Job Hop':        hopPoints[i].salary,
            'No Growth':      noGrowthPts[i].salary,
        }));

        const milestones = [5, 10, 15, 20].filter(y => y <= data.yearsToModel);

        return { stayPoints, hopPoints, noGrowthPts, chart, milestones };
    }, [data]);

    const update = (patch: Partial<CareerData>) => setData(d => ({ ...d, ...patch }));

    const last = results.stayPoints[results.stayPoints.length - 1];
    const lastHop = results.hopPoints[results.hopPoints.length - 1];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Current Position</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Current Annual Salary" value={data.currentSalary} min={30000} max={500000} step={1000} suffix="$" onChange={v => update({ currentSalary: v })} />
                            <Slider label="Annual Raise %" value={data.annualRaise} min={0} max={15} step={0.5} suffix="%" onChange={v => update({ annualRaise: v })} />
                            <Slider label="Years to Model" value={data.yearsToModel} min={5} max={40} suffix=" yrs" onChange={v => update({ yearsToModel: v })} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Scenario A — Stay & Promote</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Promotion Every" value={data.promotionEveryYears} min={1} max={10} suffix=" yrs" onChange={v => update({ promotionEveryYears: v })} />
                            <Slider label="Promotion Salary Bump" value={data.promotionBump} min={5} max={50} suffix="%" onChange={v => update({ promotionBump: v })} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Scenario B — Job Hop</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Change Companies Every" value={data.jobHopEveryYears} min={1} max={10} suffix=" yrs" onChange={v => update({ jobHopEveryYears: v })} />
                            <Slider label="Salary Bump per Move" value={data.jobHopBump} min={5} max={50} suffix="%" onChange={v => update({ jobHopBump: v })} />
                        </CardContent>
                    </Card>
                </div>

                {/* Chart + summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Salary Projection</h3>
                        </CardHeader>
                        <CardContent className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.chart} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                                    <defs>
                                        <linearGradient id="gradStay" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="var(--chart-primary)"   stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--chart-primary)"   stopOpacity={0}    />
                                        </linearGradient>
                                        <linearGradient id="gradHop" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="var(--chart-secondary)"  stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--chart-secondary)"  stopOpacity={0}    />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `Y${v}`} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmtShort(v)} width={52} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        formatter={(v: number, name: string) => [fmt(v), name]}
                                        labelFormatter={l => `Year ${l}`}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Area type="monotone" dataKey="No Growth"      stroke="#94a3b8" strokeWidth={1.5} fill="none"           strokeDasharray="4 2" dot={false} />
                                    <Area type="monotone" dataKey="Stay & Promote" stroke="var(--chart-primary)"   strokeWidth={2} fill="url(#gradStay)" dot={false} />
                                    <Area type="monotone" dataKey="Job Hop"        stroke="var(--chart-secondary)" strokeWidth={2} fill="url(#gradHop)"  dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Stay & Promote — Year {data.yearsToModel}</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">
                                        {fmtShort(last.salary)}
                                        <span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">/ yr</span>
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">Lifetime earnings: {fmtShort(last.lifetime)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Job Hop — Year {data.yearsToModel}</p>
                                    <p className="text-xl font-light tracking-tighter text-white/90">{fmtShort(lastHop.salary)}</p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">Lifetime: {fmtShort(lastHop.lifetime)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Milestone table */}
            {!compact && (
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Milestone Comparison</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/5">
                                        <th className="text-left py-2 pr-6 text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-normal">Year</th>
                                        <th className="text-right py-2 pr-6 text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 font-normal">No Growth</th>
                                        <th className="text-right py-2 pr-6 text-[10px] uppercase tracking-widest text-[#387E67] dark:text-[#52B788] font-normal">Stay & Promote</th>
                                        <th className="text-right py-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-normal">Job Hop</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {results.milestones.map(y => {
                                        const stay = results.stayPoints[y];
                                        const hop  = results.hopPoints[y];
                                        const none = results.noGrowthPts[y];
                                        return (
                                            <tr key={y}>
                                                <td className="py-3 pr-6 font-medium text-slate-700 dark:text-white/70">Year {y}</td>
                                                <td className="py-3 pr-6 text-right font-mono text-slate-400 dark:text-white/30">{fmt(none.salary)}</td>
                                                <td className="py-3 pr-6 text-right font-mono text-[#387E67] dark:text-[#52B788] font-medium">{fmt(stay.salary)}</td>
                                                <td className="py-3 text-right font-mono text-slate-600 dark:text-white/50">{fmt(hop.salary)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!compact && (
                <p className="text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
                    <strong className="text-slate-500 dark:text-white/40">Note:</strong> Projections assume consistent annual raises and events occurring on schedule. Real career trajectories vary based on
                    industry conditions, negotiation skill, company performance, and economic factors. Lifetime earnings are cumulative salary only and do not account for inflation, taxes, or investment growth.
                </p>
            )}
        </div>
    );
};
