import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface RrspTfsaData {
    currentAge: number;
    retirementAge: number;
    annualContribution: number;
    currentTaxRate: number;
    retirementTaxRate: number;
    currentRrspBalance: number;
    currentTfsaBalance: number;
    expectedReturn: number;
}

interface RrspTfsaProfile {
    id: string;
    name: string;
    data: RrspTfsaData;
}

const DEFAULT_DATA: RrspTfsaData = {
    currentAge: 35,
    retirementAge: 65,
    annualContribution: 10000,
    currentTaxRate: 33,
    retirementTaxRate: 20,
    currentRrspBalance: 25000,
    currentTfsaBalance: 10000,
    expectedReturn: 6,
};

const fv = (balance: number, annualContrib: number, r: number, n: number): number => {
    if (n <= 0) return balance;
    const growth = Math.pow(1 + r, n);
    return balance * growth + (r === 0 ? annualContrib * n : annualContrib * (growth - 1) / r);
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');

const RrspTfsaPersonView = ({
    profile, onUpdate, onRemove, isOnly,
}: {
    profile: RrspTfsaProfile;
    onUpdate: (data: RrspTfsaData) => void;
    onRemove: () => void;
    isOnly: boolean;
}) => {
    const d = profile.data;

    const results = useMemo(() => {
        const years = Math.max(d.retirementAge - d.currentAge, 0);
        const r = d.expectedReturn / 100;
        const tCurr = d.currentTaxRate / 100;
        const tRet = d.retirementTaxRate / 100;
        const annualRefund = d.annualContribution * tCurr;

        // Existing balances are identical in both strategies — only new-contribution
        // after-tax value differs. RRSP path = contrib*(1-tRet)*fvF + refund*fvF.
        // TFSA path = contrib*fvF. Advantage = contrib*fvF*(tCurr-tRet).
        const contribFvFactor = years > 0
            ? (r === 0 ? years : (Math.pow(1 + r, years) - 1) / r)
            : 0;
        const rrspNewAfterTax = d.annualContribution * contribFvFactor * (1 - tRet) + annualRefund * contribFvFactor;
        const tfsaNewAfterTax = d.annualContribution * contribFvFactor;
        const rawAdvantage = rrspNewAfterTax - tfsaNewAfterTax; // positive → RRSP better

        const recommended = d.currentTaxRate > d.retirementTaxRate ? 'RRSP'
            : d.currentTaxRate < d.retirementTaxRate ? 'TFSA'
            : 'TFSA';

        // Full projected totals (for display): existing balances + new contributions
        const existingRrspFV = fv(d.currentRrspBalance, 0, r, years);
        const existingTfsaFV = fv(d.currentTfsaBalance, 0, r, years);
        const rrspStrategyTotal = existingRrspFV * (1 - tRet) + existingTfsaFV
            + d.annualContribution * contribFvFactor * (1 - tRet)
            + annualRefund * contribFvFactor;
        const tfsaStrategyTotal = existingRrspFV * (1 - tRet) + existingTfsaFV
            + d.annualContribution * contribFvFactor;

        const chartData = [];
        for (let y = 0; y <= years; y++) {
            const g = y === 0 ? 1 : Math.pow(1 + r, y);
            const cf = r === 0 ? y : (g - 1) / r;
            const exRrsp = d.currentRrspBalance * g;
            const exTfsa = d.currentTfsaBalance * g;
            const rrspStrat = exRrsp * (1 - tRet) + exTfsa
                + d.annualContribution * cf * (1 - tRet)
                + annualRefund * cf;
            const tfsaStrat = exRrsp * (1 - tRet) + exTfsa
                + d.annualContribution * cf;
            chartData.push({
                age: d.currentAge + y,
                rrsp: Math.round(rrspStrat),
                tfsa: Math.round(tfsaStrat),
            });
        }

        return {
            rrspStrategyTotal,
            tfsaStrategyTotal,
            advantage: Math.abs(rawAdvantage),
            recommended,
            annualRefund,
            chartData,
        };
    }, [d]);

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
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Profile & Contributions</h3>
                    </CardHeader>
                    <CardContent>
                        <Slider
                            label="Current Age"
                            value={d.currentAge}
                            min={18}
                            max={70}
                            step={1}
                            suffix="yrs"
                            onChange={(v) => onUpdate({ ...d, currentAge: v })}
                        />
                        <Slider
                            label="Retirement Age"
                            value={d.retirementAge}
                            min={40}
                            max={80}
                            step={1}
                            suffix="yrs"
                            onChange={(v) => onUpdate({ ...d, retirementAge: v })}
                        />
                        <Slider
                            label="Annual Contribution"
                            value={d.annualContribution}
                            min={500}
                            max={30000}
                            step={500}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...d, annualContribution: v })}
                        />
                        <Slider
                            label="Expected Annual Return"
                            value={d.expectedReturn}
                            min={1}
                            max={12}
                            step={0.5}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...d, expectedReturn: v })}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Tax Rates & Balances</h3>
                    </CardHeader>
                    <CardContent>
                        <Slider
                            label="Current Marginal Tax Rate"
                            value={d.currentTaxRate}
                            min={10}
                            max={55}
                            step={1}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...d, currentTaxRate: v })}
                        />
                        <Slider
                            label="Expected Tax Rate in Retirement"
                            value={d.retirementTaxRate}
                            min={0}
                            max={55}
                            step={1}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...d, retirementTaxRate: v })}
                        />
                        <Slider
                            label="Current RRSP Balance"
                            value={d.currentRrspBalance}
                            min={0}
                            max={500000}
                            step={1000}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...d, currentRrspBalance: v })}
                        />
                        <Slider
                            label="Current TFSA Balance"
                            value={d.currentTfsaBalance}
                            min={0}
                            max={200000}
                            step={1000}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...d, currentTfsaBalance: v })}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">After-Tax Value at Retirement</h3>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="age"
                                    tick={{ fontSize: 10, fill: 'currentColor' }}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 10 }}
                                />
                                <YAxis
                                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                    tick={{ fontSize: 10, fill: 'currentColor' }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={55}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0F172A' }}
                                    formatter={(value: number, name: string) => [
                                        fmt(value),
                                        name === 'rrsp' ? 'RRSP Strategy' : 'TFSA Strategy',
                                    ]}
                                    labelFormatter={(age) => `Age ${age}`}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={28}
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => value === 'rrsp' ? 'RRSP Strategy' : 'TFSA Strategy'}
                                    wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Line type="monotone" dataKey="rrsp" stroke="var(--chart-primary, #387E67)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="tfsa" stroke="var(--chart-secondary, #6366f1)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Strategy Comparison</h3>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">RRSP-First (after-tax)</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{fmt(results.rrspStrategyTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">TFSA-First (after-tax)</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{fmt(results.tfsaStrategyTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">Annual RRSP Tax Refund</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{fmt(results.annualRefund)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">Years to Retirement</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{Math.max(d.retirementAge - d.currentAge, 0)} yrs</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Recommended</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">{results.recommended}</p>
                                    <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-normal mt-1">
                                        {d.currentTaxRate > d.retirementTaxRate
                                            ? 'Tax rate drops in retirement'
                                            : d.currentTaxRate < d.retirementTaxRate
                                            ? 'Tax rate rises in retirement'
                                            : 'Rates equal — TFSA simpler'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Advantage</p>
                                    <p className="text-xl font-light tracking-tighter text-white/80">{fmt(results.advantage)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const RrspTfsaCalculator = () => {
    const [profiles, setProfiles] = React.useState<RrspTfsaProfile[]>(() => {
        const saved = localStorage.getItem('rrsp_tfsa_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [personToDelete, setPersonToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [newPersonName, setNewPersonName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('rrsp_tfsa_profiles', JSON.stringify(profiles));
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

    const updateProfileData = (id: string, newData: RrspTfsaData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <RrspTfsaPersonView
                            profile={profile}
                            isOnly={profiles.length === 1}
                            onUpdate={(data) => updateProfileData(profile.id, data)}
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
                        <label htmlFor="rrsp-new-person-name" className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
                        <Input
                            id="rrsp-new-person-name"
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
