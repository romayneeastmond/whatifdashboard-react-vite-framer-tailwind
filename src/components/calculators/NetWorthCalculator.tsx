import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import {
    AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid,
} from 'recharts';
import { cn } from '../../lib/utils';

interface NetWorthData {
    cashSavings: number;
    investments: number;
    realEstate: number;
    vehicles: number;
    otherAssets: number;
    mortgageBalance: number;
    carLoans: number;
    studentLoans: number;
    creditCardDebt: number;
    otherDebt: number;
    monthlyNetSavings: number;
    annualGrowthRate: number;
    projectionYears: number;
}

interface NetWorthProfile {
    id: string;
    name: string;
    data: NetWorthData;
}

const DEFAULT_DATA: NetWorthData = {
    cashSavings: 15000,
    investments: 30000,
    realEstate: 0,
    vehicles: 15000,
    otherAssets: 5000,
    mortgageBalance: 0,
    carLoans: 8000,
    studentLoans: 12000,
    creditCardDebt: 3000,
    otherDebt: 0,
    monthlyNetSavings: 800,
    annualGrowthRate: 6,
    projectionYears: 20,
};

const fmt = (n: number) => {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
    return `${sign}$${Math.round(abs).toLocaleString()}`;
};

const fmtFull = (n: number) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();

const calcNetWorth = (data: NetWorthData) => {
    const totalAssets = data.cashSavings + data.investments + data.realEstate + data.vehicles + data.otherAssets;
    const totalLiabilities = data.mortgageBalance + data.carLoans + data.studentLoans + data.creditCardDebt + data.otherDebt;
    const netWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    const r = data.annualGrowthRate / 100;
    const annualSavings = data.monthlyNetSavings * 12;

    const projectYear = (y: number) => {
        if (r === 0) return netWorth + annualSavings * y;
        return netWorth * Math.pow(1 + r, y) + annualSavings * (Math.pow(1 + r, y) - 1) / r;
    };

    const chartData = Array.from({ length: data.projectionYears + 1 }, (_, y) => ({
        year: y === 0 ? 'Now' : `Yr ${y}`,
        netWorth: Math.round(projectYear(y)),
    }));

    const projectedNetWorth = projectYear(data.projectionYears);

    let yearPositive: number | null = null;
    if (netWorth < 0) {
        for (let y = 1; y <= data.projectionYears; y++) {
            if (projectYear(y) >= 0) { yearPositive = y; break; }
        }
    }

    return { totalAssets, totalLiabilities, netWorth, debtToAssetRatio, chartData, projectedNetWorth, yearPositive };
};

const NetWorthPersonView = ({ profile, onUpdate, onRemove, isOnly }: {
    profile: NetWorthProfile;
    onUpdate: (data: NetWorthData) => void;
    onRemove: () => void;
    isOnly: boolean;
}) => {
    const data = profile.data;
    const results = useMemo(() => calcNetWorth(data), [data]);

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
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Assets</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Cash & Savings" value={data.cashSavings} min={0} max={500000} step={500} prefix="$" onChange={(v) => onUpdate({ ...data, cashSavings: v })} />
                            <Slider label="Investments" value={data.investments} min={0} max={1000000} step={1000} prefix="$" onChange={(v) => onUpdate({ ...data, investments: v })} />
                            <Slider label="Real Estate Value" value={data.realEstate} min={0} max={2000000} step={5000} prefix="$" onChange={(v) => onUpdate({ ...data, realEstate: v })} />
                            <Slider label="Vehicles" value={data.vehicles} min={0} max={200000} step={500} prefix="$" onChange={(v) => onUpdate({ ...data, vehicles: v })} />
                            <Slider label="Other Assets" value={data.otherAssets} min={0} max={500000} step={500} prefix="$" onChange={(v) => onUpdate({ ...data, otherAssets: v })} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Liabilities</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Mortgage Balance" value={data.mortgageBalance} min={0} max={1500000} step={5000} prefix="$" onChange={(v) => onUpdate({ ...data, mortgageBalance: v })} />
                            <Slider label="Car Loans" value={data.carLoans} min={0} max={100000} step={500} prefix="$" onChange={(v) => onUpdate({ ...data, carLoans: v })} />
                            <Slider label="Student Loans" value={data.studentLoans} min={0} max={200000} step={500} prefix="$" onChange={(v) => onUpdate({ ...data, studentLoans: v })} />
                            <Slider label="Credit Card Debt" value={data.creditCardDebt} min={0} max={50000} step={100} prefix="$" onChange={(v) => onUpdate({ ...data, creditCardDebt: v })} />
                            <Slider label="Other Debt" value={data.otherDebt} min={0} max={200000} step={500} prefix="$" onChange={(v) => onUpdate({ ...data, otherDebt: v })} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Projection</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Monthly Net Savings" value={data.monthlyNetSavings} min={0} max={10000} step={50} prefix="$" onChange={(v) => onUpdate({ ...data, monthlyNetSavings: v })} />
                            <Slider label="Annual Growth Rate" value={data.annualGrowthRate} min={0} max={15} step={0.5} suffix="%" onChange={(v) => onUpdate({ ...data, annualGrowthRate: v })} />
                            <Slider label="Projection Years" value={data.projectionYears} min={1} max={40} step={1} suffix=" yr" onChange={(v) => onUpdate({ ...data, projectionYears: v })} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-1">Total Assets</p>
                                <p className="text-xl font-light text-[#387E67] dark:text-[#52B788]">{fmt(results.totalAssets)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-1">Total Debt</p>
                                <p className="text-xl font-light text-red-500 dark:text-red-400">{results.totalLiabilities > 0 ? fmt(results.totalLiabilities) : '—'}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Net Worth Projection</h3>
                        </CardHeader>
                        <CardContent className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`nwGrad-${profile.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                    <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={60} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'normal', color: '#0F172A' }}
                                        formatter={(value: number) => [fmtFull(value), 'Net Worth']}
                                    />
                                    <ReferenceLine y={0} stroke="var(--chart-tertiary)" strokeDasharray="4 4" />
                                    <Area type="monotone" dataKey="netWorth" stroke="var(--chart-primary)" strokeWidth={2} fill={`url(#nwGrad-${profile.id})`} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Net Worth Today</p>
                                    <p className={cn('text-4xl font-light tracking-tighter font-sans', results.netWorth >= 0 ? 'text-white' : 'text-red-300')}>
                                        {fmtFull(results.netWorth)}
                                    </p>
                                    {results.yearPositive !== null && (
                                        <p className="text-white/40 text-[10px] mt-1">Positive in {results.yearPositive} yr{results.yearPositive !== 1 ? 's' : ''}</p>
                                    )}
                                </div>
                                <div className="text-right space-y-2">
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-0.5">In {data.projectionYears} Years</p>
                                        <p className="text-xl font-light tracking-tighter text-white/80">{fmt(results.projectedNetWorth)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-0.5">Debt-to-Asset</p>
                                        <p className="text-sm font-light text-white/60">{results.debtToAssetRatio.toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const NetWorthCalculator = () => {
    const [profiles, setProfiles] = React.useState<NetWorthProfile[]>(() => {
        const saved = localStorage.getItem('networth_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [personToDelete, setPersonToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [newPersonName, setNewPersonName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('networth_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const addPerson = () => {
        setNewPersonName('');
        setIsModalOpen(true);
    };

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

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <NetWorthPersonView
                            profile={profile}
                            isOnly={profiles.length === 1}
                            onUpdate={(data) => setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, data } : p))}
                            onRemove={() => removePerson(profile.id, profile.name)}
                        />
                    </React.Fragment>
                ))}
            </div>

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
                        <label htmlFor="networth-new-person-name" className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
                        <Input
                            id="networth-new-person-name"
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
