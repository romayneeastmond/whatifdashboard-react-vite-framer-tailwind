import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import { InvestmentData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../../lib/utils';

interface InvestmentProfile {
    id: string;
    name: string;
    data: InvestmentData;
}

const DEFAULT_DATA: InvestmentData = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    years: 20,
};

const InvestmentPersonView = ({ profile, onUpdate, onRemove, isOnly }: { 
    profile: InvestmentProfile, 
    onUpdate: (data: InvestmentData) => void,
    onRemove: () => void,
    isOnly: boolean
}) => {
    const data = profile.data;

    const results = useMemo(() => {
        const schedule = [];
        let currentBalance = data.initialAmount;
        let totalInvested = data.initialAmount;
        const monthlyRate = data.annualReturn / 100 / 12;

        for (let i = 0; i <= data.years; i++) {
            schedule.push({
                year: i,
                invested: Math.round(totalInvested),
                earnings: Math.round(currentBalance - totalInvested),
            });

            for (let m = 0; m < 12; m++) {
                currentBalance = (currentBalance + data.monthlyContribution) * (1 + monthlyRate);
                totalInvested += data.monthlyContribution;
            }
        }

        return {
            finalBalance: currentBalance,
            totalInvested,
            totalEarnings: currentBalance - totalInvested,
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
                        title="Remove Profile"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Strategy Parameters</h3>
                    </CardHeader>
                    <CardContent>
                        <Slider
                            label="Initial Investment"
                            value={data.initialAmount}
                            min={0}
                            max={1000000}
                            step={5000}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...data, initialAmount: v })}
                        />
                        <Slider
                            label="Monthly Contribution"
                            value={data.monthlyContribution}
                            min={0}
                            max={10000}
                            step={100}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...data, monthlyContribution: v })}
                        />
                        <Slider
                            label="Return Estimate"
                            value={data.annualReturn}
                            min={1}
                            max={15}
                            step={0.5}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...data, annualReturn: v })}
                        />
                        <Slider
                            label="Horizon"
                            value={data.years}
                            min={1}
                            max={50}
                            step={1}
                            suffix=" yrs"
                            onChange={(v) => onUpdate({ ...data, years: v })}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Portfolio Projection</h3>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results.schedule}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                    <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                        itemStyle={{ color: '#0F172A' }}
                                        formatter={(v: number) => `$${v.toLocaleString()}`}
                                    />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                    <Bar dataKey="invested" stackId="a" fill="var(--chart-secondary)" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="earnings" stackId="a" fill="var(--chart-primary)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Final Balance</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">${Math.round(results.finalBalance).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Return Delta</p>
                                    <p className="text-xl font-light tracking-tighter text-white/80">+{Math.round((results.totalEarnings / results.totalInvested) * 100)}% ROI</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const InvestmentCalculator = () => {
    const [profiles, setProfiles] = React.useState<InvestmentProfile[]>(() => {
        const saved = localStorage.getItem('investment_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [strategyToDelete, setStrategyToDelete] = React.useState<{ id: string, name: string } | null>(null);
    const [newStrategyName, setNewStrategyName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('investment_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const addPerson = () => {
        setNewStrategyName('');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStrategyName.trim()) return;

        const newId = Date.now().toString();
        setProfiles(prev => [...prev, { id: newId, name: newStrategyName.trim(), data: DEFAULT_DATA }]);
        setIsModalOpen(false);
        setNewStrategyName('');
    };

    const removePerson = (id: string, name: string) => {
        if (profiles.length === 1) return;
        setStrategyToDelete({ id, name });
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (strategyToDelete) {
            setProfiles(prev => prev.filter(p => p.id !== strategyToDelete.id));
            setDeleteModalOpen(false);
            setStrategyToDelete(null);
        }
    };

    const updateProfileData = (id: string, newData: InvestmentData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <InvestmentPersonView 
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
                    <span>Add Another Strategy</span>
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Add New Strategy"
            >
                <form onSubmit={handleModalSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="investment-new-strategy-name" className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Strategy Name</label>
                        <Input
                            id="investment-new-strategy-name"
                            autoFocus
                            value={newStrategyName}
                            onChange={(e) => setNewStrategyName(e.target.value)}
                            placeholder="e.g. Aggressive Growth"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!newStrategyName.trim()}
                        className="w-full py-3 bg-[#387E67] dark:bg-[#52B788] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Add Strategy
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
                        Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">"{strategyToDelete?.name}"</span>? This action cannot be undone and all data for this strategy will be lost.
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

