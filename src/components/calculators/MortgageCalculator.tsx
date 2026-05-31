import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import { MortgageData } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface MortgageProfile {
    id: string;
    name: string;
    data: MortgageData;
}

const DEFAULT_DATA: MortgageData = {
    homePrice: 400000,
    downPayment: 80000,
    interestRate: 6.5,
    termYears: 30,
    annualTaxes: 4800,
};

const MortgagePersonView = ({ profile, onUpdate, onRemove, isOnly }: { 
    profile: MortgageProfile, 
    onUpdate: (data: MortgageData) => void,
    onRemove: () => void,
    isOnly: boolean
}) => {
    const data = profile.data;

    const results = useMemo(() => {
        const principal = data.homePrice - data.downPayment;
        const monthlyRate = data.interestRate / 100 / 12;
        const numPayments = data.termYears * 12;

        const monthlyPI =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);

        const monthlyTaxes = data.annualTaxes / 12;
        const totalMonthly = monthlyPI + monthlyTaxes;

        const schedule = [];
        let remainingBalance = principal;
        for (let i = 0; i <= data.termYears; i++) {
            schedule.push({
                year: i,
                balance: Math.max(0, Math.round(remainingBalance))
            });

            const yearlyInterest = remainingBalance * (data.interestRate / 100);
            const yearlyPrincipal = (monthlyPI * 12) - yearlyInterest;
            remainingBalance -= yearlyPrincipal;
        }

        return {
            monthlyPI,
            totalMonthly,
            totalInterest: (monthlyPI * numPayments) - principal,
            schedule
        };
    }, [data]);

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
                        aria-label="Remove Profile"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Loan Parameters</h3>
                    </CardHeader>
                    <CardContent>
                        <Slider
                            label="Home Price"
                            value={data.homePrice}
                            min={100000}
                            max={2000000}
                            step={5000}
                            prefix="$"
                            onChange={(v) => onUpdate({ ...data, homePrice: v })}
                        />
                        <Slider
                            label="Down Payment"
                            value={data.downPayment}
                            min={0}
                            max={data.homePrice}
                            step={1000}
                            prefix="$"
                            onChange={(v) => onUpdate({ ...data, downPayment: v })}
                        />
                        <Slider
                            label="Interest Rate"
                            value={data.interestRate}
                            min={1}
                            max={15}
                            step={0.1}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...data, interestRate: v })}
                        />
                        <Slider
                            label="Term (Years)"
                            value={data.termYears}
                            min={5}
                            max={40}
                            step={5}
                            suffix=" yrs"
                            onChange={(v) => onUpdate({ ...data, termYears: v })}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Amortization View</h3>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.schedule}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                    <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                        itemStyle={{ color: '#0F172A' }}
                                        formatter={(v: number) => `$${v.toLocaleString()}`}
                                        labelFormatter={(l) => `Year ${l}`}
                                    />
                                    <Area type="monotone" dataKey="balance" stroke="var(--chart-primary)" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Monthly Payment</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">${Math.round(results.totalMonthly).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Total Interest</p>
                                    <p className="text-xl font-light tracking-tighter text-white/80">${Math.round(results.totalInterest).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const MortgageCalculator = () => {
    const [profiles, setProfiles] = React.useState<MortgageProfile[]>(() => {
        const saved = localStorage.getItem('mortgage_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [scenarioToDelete, setScenarioToDelete] = React.useState<{ id: string, name: string } | null>(null);
    const [newScenarioName, setNewScenarioName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('mortgage_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const addPerson = () => {
        setNewScenarioName('');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newScenarioName.trim()) return;

        const newId = Date.now().toString();
        setProfiles(prev => [...prev, { id: newId, name: newScenarioName.trim(), data: DEFAULT_DATA }]);
        setIsModalOpen(false);
        setNewScenarioName('');
    };

    const removePerson = (id: string, name: string) => {
        if (profiles.length === 1) return;
        setScenarioToDelete({ id, name });
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (scenarioToDelete) {
            setProfiles(prev => prev.filter(p => p.id !== scenarioToDelete.id));
            setDeleteModalOpen(false);
            setScenarioToDelete(null);
        }
    };

    const updateProfileData = (id: string, newData: MortgageData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <MortgagePersonView 
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
                    <span>Add Another Scenario</span>
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Add New Scenario"
            >
                <form onSubmit={handleModalSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="mortgage-new-scenario-name" className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Scenario Name</label>
                        <Input
                            id="mortgage-new-scenario-name"
                            autoFocus
                            value={newScenarioName}
                            onChange={(e) => setNewScenarioName(e.target.value)}
                            placeholder="e.g. 15-year Fixed"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!newScenarioName.trim()}
                        className="w-full py-3 bg-[#387E67] dark:bg-[#52B788] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Add Scenario
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                        Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">"{scenarioToDelete?.name}"</span>? This action cannot be undone and all data for this scenario will be lost.
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
