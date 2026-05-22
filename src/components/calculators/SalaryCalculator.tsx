import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import { SalaryData } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '../../lib/utils';

interface SalaryProfile {
    id: string;
    name: string;
    data: SalaryData;
}

const DEFAULT_DATA: SalaryData = {
    annualGross: 100000,
    taxRate: 25,
    contribution401k: 10,
    monthlyExpenses: 3000,
};

const SalaryPersonView = ({ profile, onUpdate, onRemove, isOnly }: { 
    profile: SalaryProfile, 
    onUpdate: (data: SalaryData) => void,
    onRemove: () => void,
    isOnly: boolean
}) => {
    const data = profile.data;

    const results = useMemo(() => {
        const annual401k = (data.annualGross * data.contribution401k) / 100;
        const taxableIncome = data.annualGross - annual401k;
        const annualTax = (taxableIncome * data.taxRate) / 100;
        const takeHomeAnnual = taxableIncome - annualTax;
        const takeHomeMonthly = takeHomeAnnual / 12;
        const monthlySavings = takeHomeMonthly - data.monthlyExpenses;

        return {
            takeHomeMonthly,
            annualTax,
            annual401k,
            monthlySavings,
            chartData: [
                { name: 'Take Home', value: takeHomeMonthly, color: 'var(--chart-primary)' },
                { name: 'Retirement Contribution', value: annual401k / 12, color: 'var(--chart-secondary)' },
                { name: 'Taxes', value: annualTax / 12, color: 'var(--chart-tertiary)' },
            ]
        };
    }, [data]);

    return (
        <div className="space-y-6 pb-24 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#387E67] dark:text-[#52B788]">
                        <User size={16} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{profile.name}</h3>
                </div>
                {!isOnly && (
                    <button 
                        onClick={onRemove}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove Person"
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
                        <Slider
                            label="Annual Gross Salary"
                            value={data.annualGross}
                            min={30000}
                            max={500000}
                            step={1000}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...data, annualGross: v })}
                        />
                        <Slider
                            label="Estimate Tax Rate"
                            value={data.taxRate}
                            min={0}
                            max={50}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...data, taxRate: v })}
                        />
                        <Slider
                            label="Retirement Contribution"
                            value={data.contribution401k}
                            min={0}
                            max={30}
                            suffix="%"
                            onChange={(v) => onUpdate({ ...data, contribution401k: v })}
                        />
                        <Slider
                            label="Essential Expenses"
                            value={data.monthlyExpenses}
                            min={500}
                            max={10000}
                            step={100}
                            suffix="$"
                            onChange={(v) => onUpdate({ ...data, monthlyExpenses: v })}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Monthly Breakdown</h3>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={results.chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {results.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0F172A' }}
                                        formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Monthly Surplus</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">${Math.max(0, results.monthlySavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">/mo</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Annual Result</p>
                                    <p className="text-xl font-light tracking-tighter text-white/80">${Math.max(0, results.monthlySavings * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const SalaryCalculator = () => {
    const [profiles, setProfiles] = React.useState<SalaryProfile[]>(() => {
        const saved = localStorage.getItem('salary_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [personToDelete, setPersonToDelete] = React.useState<{ id: string, name: string } | null>(null);
    const [newPersonName, setNewPersonName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('salary_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const addPerson = () => {
        setNewPersonName('');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPersonName.trim()) return;
        
        const newId = Date.now().toString();
        setProfiles(prev => [...prev, { id: newId, name: newPersonName.trim(), data: DEFAULT_DATA }]);
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

    const updateProfileData = (id: string, newData: SalaryData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <SalaryPersonView 
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

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Add New Person"
            >
                <form onSubmit={handleModalSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
                        <Input 
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

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
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
