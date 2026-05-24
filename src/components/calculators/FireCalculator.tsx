import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import {
    AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid,
} from 'recharts';
import { cn } from '../../lib/utils';

interface FireData {
    currentAge: number;
    retirementAge: number;
    currentPortfolio: number;
    monthlyContribution: number;
    annualRetirementExpenses: number;
    annualReturn: number;
    inflationRate: number;
    withdrawalRate: number;
}

interface FireProfile {
    id: string;
    name: string;
    data: FireData;
}

const DEFAULT_DATA: FireData = {
    currentAge: 32,
    retirementAge: 55,
    currentPortfolio: 50000,
    monthlyContribution: 1500,
    annualRetirementExpenses: 48000,
    annualReturn: 7,
    inflationRate: 2.5,
    withdrawalRate: 4,
};

const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${Math.round(n).toLocaleString()}`;
};

const fmtFull = (n: number) => '$' + Math.round(n).toLocaleString();

const calcFire = (data: FireData) => {
    const fireNumber = data.annualRetirementExpenses / (data.withdrawalRate / 100);
    const yearsToRetirement = Math.max(data.retirementAge - data.currentAge, 0);
    const monthlyRate = data.annualReturn / 100 / 12;

    const fv = (months: number) => {
        if (monthlyRate === 0) return data.currentPortfolio + data.monthlyContribution * months;
        const grow = Math.pow(1 + monthlyRate, months);
        return data.currentPortfolio * grow + data.monthlyContribution * (grow - 1) / monthlyRate;
    };

    const projectedPortfolio = fv(yearsToRetirement * 12);
    const onTrack = projectedPortfolio >= fireNumber;

    let yearsNeeded = yearsToRetirement;
    if (!onTrack) {
        for (let y = yearsToRetirement + 1; y <= 80; y++) {
            if (fv(y * 12) >= fireNumber) { yearsNeeded = y; break; }
        }
    }

    let monthlyNeeded = data.monthlyContribution;
    if (!onTrack && yearsToRetirement > 0 && monthlyRate > 0) {
        const grow = Math.pow(1 + monthlyRate, yearsToRetirement * 12);
        const gap = fireNumber - data.currentPortfolio * grow;
        monthlyNeeded = gap > 0 ? gap * monthlyRate / (grow - 1) : 0;
    }

    const realReturn = ((1 + data.annualReturn / 100) / (1 + data.inflationRate / 100) - 1) * 100;

    const chartYears = Math.min(Math.max(yearsNeeded + 5, yearsToRetirement + 10), 55);
    const chartData = Array.from({ length: chartYears + 1 }, (_, y) => ({
        age: data.currentAge + y,
        portfolio: Math.round(fv(y * 12)),
    }));

    return { fireNumber, projectedPortfolio, onTrack, yearsNeeded, monthlyNeeded, realReturn, chartData, yearsToRetirement };
};

const FirePersonView = ({
    profile, onUpdate, onRemove, isOnly,
}: {
    profile: FireProfile;
    onUpdate: (data: FireData) => void;
    onRemove: () => void;
    isOnly: boolean;
}) => {
    const data = profile.data;
    const results = useMemo(() => calcFire(data), [data]);

    const up = (patch: Partial<FireData>) => onUpdate({ ...data, ...patch });

    const gradId = `fireGrad-${profile.id}`;

    return (
        <div className="space-y-6 pb-24 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#387E67] dark:text-[#52B788]">
                        <User size={16} />
                    </div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">{profile.name}</h2>
                </div>
                {!isOnly && (
                    <button
                        onClick={onRemove}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Remove Person"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Input Parameters</h3>
                    </CardHeader>
                    <CardContent>
                        <Slider label="Current Age" value={data.currentAge} min={18} max={69} step={1}
                            onChange={(v) => up({ currentAge: v, retirementAge: Math.max(data.retirementAge, v + 1) })} />
                        <Slider label="Target Retirement Age" value={data.retirementAge} min={data.currentAge + 1} max={80} step={1}
                            onChange={(v) => up({ retirementAge: v })} />
                        <Slider label="Current Portfolio" value={data.currentPortfolio} min={0} max={2000000} step={5000} suffix="$"
                            onChange={(v) => up({ currentPortfolio: v })} />
                        <Slider label="Monthly Contribution" value={data.monthlyContribution} min={0} max={10000} step={100} suffix="$"
                            onChange={(v) => up({ monthlyContribution: v })} />
                        <Slider label="Annual Retirement Expenses" value={data.annualRetirementExpenses} min={12000} max={200000} step={1000} suffix="$"
                            onChange={(v) => up({ annualRetirementExpenses: v })} />
                        <Slider label="Expected Annual Return" value={data.annualReturn} min={1} max={12} step={0.5} suffix="%"
                            onChange={(v) => up({ annualReturn: v })} />
                        <Slider label="Inflation Rate" value={data.inflationRate} min={0} max={8} step={0.5} suffix="%"
                            onChange={(v) => up({ inflationRate: v })} />
                        <Slider label="Safe Withdrawal Rate" value={data.withdrawalRate} min={2} max={6} step={0.1} suffix="%"
                            onChange={(v) => up({ withdrawalRate: v })} />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Portfolio Projection</h3>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                                    <XAxis dataKey="age" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                                        tickFormatter={(v) => `${v}`} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 9, fill: 'currentColor', opacity: 0.4 }} />
                                    <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={52} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0F172A' }}
                                        formatter={(v: number) => [fmtFull(v), 'Portfolio']}
                                        labelFormatter={(l) => `Age ${l}`}
                                    />
                                    <ReferenceLine
                                        y={results.fireNumber}
                                        stroke="var(--chart-tertiary)"
                                        strokeDasharray="5 3"
                                        label={{ value: 'FIRE Target', position: 'insideTopRight', fontSize: 9, fill: 'var(--chart-tertiary)' }}
                                    />
                                    {results.yearsToRetirement > 0 && (
                                        <ReferenceLine
                                            x={data.retirementAge}
                                            stroke="var(--chart-secondary)"
                                            strokeDasharray="5 3"
                                            label={{ value: 'Target', position: 'insideTopLeft', fontSize: 9, fill: 'var(--chart-secondary)' }}
                                        />
                                    )}
                                    <Area dataKey="portfolio" stroke="var(--chart-primary)" strokeWidth={2}
                                        fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">FIRE Number</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">
                                        {fmtFull(results.fireNumber)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Real Return</p>
                                    <p className="text-xl font-light tracking-tighter text-white/80">{results.realReturn.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">At Retirement</p>
                                    <p className="text-base font-light tracking-tight text-white/80">{fmtFull(results.projectedPortfolio)}</p>
                                </div>
                                <div className="text-right">
                                    <p className={cn('text-[10px] uppercase tracking-widest font-normal mb-1', results.onTrack ? 'text-white/40' : 'text-amber-300/60')}>
                                        {results.onTrack ? 'Status' : 'Retire At'}
                                    </p>
                                    <p className={cn('text-base font-light tracking-tight', results.onTrack ? 'text-white/80' : 'text-amber-300/80')}>
                                        {results.onTrack
                                            ? `On Track ✓`
                                            : `Age ${data.currentAge + results.yearsNeeded}`
                                        }
                                    </p>
                                </div>
                            </div>
                            {!results.onTrack && (
                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Monthly Needed to Retire at {data.retirementAge}</p>
                                    <p className="text-base font-light tracking-tight text-white/80">{fmtFull(results.monthlyNeeded)}/mo</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const CombinedSummary = ({ profiles }: { profiles: FireProfile[] }) => {
    const summaries = useMemo(() => profiles.map(p => ({ name: p.name, ...calcFire(p.data), data: p.data })), [profiles]);

    const latest = summaries.reduce((a, b) =>
        (a.data.currentAge + a.yearsNeeded) >= (b.data.currentAge + b.yearsNeeded) ? a : b
    );

    return (
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] mb-6">Combined Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summaries.map(s => (
                    <Card key={s.name} variant="summary">
                        <CardContent>
                            <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">{s.name}</p>
                            <p className="text-2xl font-light tracking-tighter mb-3">{fmtFull(s.fireNumber)}</p>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-white/40">Projected</span>
                                <span className={cn('font-medium', s.onTrack ? 'text-white/80' : 'text-amber-300/80')}>
                                    {fmtFull(s.projectedPortfolio)} {s.onTrack ? '✓' : `→ age ${s.data.currentAge + s.yearsNeeded}`}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 mb-1">Both Retired By</p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                    Age {latest.data.currentAge + latest.yearsNeeded} ({latest.name})
                    <span className="text-sm font-normal text-slate-500 dark:text-white/40 ml-2">
                        · {latest.yearsNeeded} years from now
                    </span>
                </p>
            </div>
        </div>
    );
};

export const FireCalculator = () => {
    const [profiles, setProfiles] = React.useState<FireProfile[]>(() => {
        const saved = localStorage.getItem('fire_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [personToDelete, setPersonToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [newPersonName, setNewPersonName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('fire_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const addPerson = () => { setNewPersonName(''); setIsModalOpen(true); };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPersonName.trim()) return;
        setProfiles(prev => [...prev, { id: Date.now().toString(), name: newPersonName.trim(), data: DEFAULT_DATA }]);
        setIsModalOpen(false);
        setNewPersonName('');
    };

    const removePerson = (id: string, name: string) => {
        if (profiles.length === 1) return;
        setPersonToDelete({ id, name });
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (personToDelete) {
            setProfiles(prev => prev.filter(p => p.id !== personToDelete.id));
            setDeleteModalOpen(false);
            setPersonToDelete(null);
        }
    };

    const updateProfileData = (id: string, newData: FireData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <FirePersonView
                            profile={profile}
                            isOnly={profiles.length === 1}
                            onUpdate={(data) => updateProfileData(profile.id, data)}
                            onRemove={() => removePerson(profile.id, profile.name)}
                        />
                    </React.Fragment>
                ))}
            </div>

            {profiles.length > 1 && <CombinedSummary profiles={profiles} />}

            <div className="flex justify-center pt-12 border-t border-slate-100 dark:border-white/5">
                <button
                    onClick={addPerson}
                    className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group"
                >
                    <Plus size={18} className="text-[#387E67] dark:text-[#52B788] group-hover:scale-110 transition-transform" />
                    <span>Add Another Person</span>
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Person">
                <form onSubmit={handleModalSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="fire-new-person-name" className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
                        <Input
                            id="fire-new-person-name"
                            autoFocus
                            value={newPersonName}
                            onChange={(e) => setNewPersonName(e.target.value)}
                            placeholder="Enter person's name"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newPersonName.trim()}
                        className="w-full py-3 bg-[#387E67] dark:bg-[#52B788] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Add Person
                    </button>
                </form>
            </Modal>

            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                        Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">"{personToDelete?.name}"</span>? This action cannot be undone and all data for this person will be lost.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="flex-1 py-3 bg-[#A4161A] text-white rounded-xl text-sm font-medium hover:bg-[#8B1215] transition-colors shadow-lg shadow-red-500/20"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
