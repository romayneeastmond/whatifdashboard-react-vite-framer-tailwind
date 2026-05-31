import React, { useMemo } from 'react';
import { Plus, Trash2, User, Target, CheckCircle2 } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input, Label } from '../ui/Controls';
import { Goal, GoalsData } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '../../lib/utils';

interface GoalsProfile {
    id: string;
    name: string;
    data: GoalsData;
}

const DEFAULT_GOAL: Goal = {
    id: '1',
    name: 'Emergency Fund',
    target: 10000,
    current: 2500,
};

const CHART_COLORS = [
    '#387E67', // Primary Green
    '#52B788', // Light Green
    '#2D6A4F', // Dark Green
    '#74C69D', // Pale Green
    '#1B4332', // Deep Forest
    '#95D5B2', // Soft Mint
    '#40916C', // Mid Green
];

const GoalsPersonView = ({ profile, onUpdate, onRemove, isOnly }: {
    profile: GoalsProfile,
    onUpdate: (data: GoalsData) => void,
    onRemove: () => void,
    isOnly: boolean
}) => {
    const data = profile.data;
    const [goalDeleteModalOpen, setGoalDeleteModalOpen] = React.useState(false);
    const [goalToDelete, setGoalToDelete] = React.useState<Goal | null>(null);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = React.useState(false);
    const [newGoalName, setNewGoalName] = React.useState('');
    const [newGoalTarget, setNewGoalTarget] = React.useState<string>('5000');

    const stats = useMemo(() => {
        const totalTarget = data.goals.reduce((acc, g) => acc + g.target, 0);
        const totalCurrent = data.goals.reduce((acc, g) => acc + g.current, 0);
        const remaining = totalTarget - totalCurrent;
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

        const chartData = data.goals.map(g => ({
            name: g.name,
            value: g.target
        })).filter(g => g.value > 0);

        return {
            totalTarget,
            totalCurrent,
            remaining,
            overallProgress,
            chartData
        };
    }, [data.goals]);

    const updateGoal = (goalId: string, updates: Partial<Goal>) => {
        const newGoals = data.goals.map(g =>
            g.id === goalId ? { ...g, ...updates } : g
        );
        onUpdate({ goals: newGoals });
    };

    const addGoal = () => {
        setNewGoalName('');
        setNewGoalTarget('5000');
        setIsAddGoalModalOpen(true);
    };

    const handleAddGoalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalName.trim()) return;

        const newGoal: Goal = {
            id: Date.now().toString(),
            name: newGoalName.trim(),
            target: Number(newGoalTarget) || 0,
            current: 0,
        };
        onUpdate({ goals: [...data.goals, newGoal] });
        setIsAddGoalModalOpen(false);
    };

    const removeGoal = (goal: Goal) => {
        setGoalToDelete(goal);
        setGoalDeleteModalOpen(true);
    };

    const confirmRemoveGoal = () => {
        if (goalToDelete) {
            onUpdate({ goals: data.goals.filter(g => g.id !== goalToDelete.id) });
            setGoalDeleteModalOpen(false);
            setGoalToDelete(null);
        }
    };

    return (
        <div className="space-y-8 pb-24 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#387E67] dark:text-[#52B788]">
                        <User size={16} />
                    </div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">{profile.name}'s Goals</h2>
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
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Active Goals</h3>
                            <button
                                onClick={addGoal}
                                className="text-[10px] uppercase tracking-widest text-[#387E67] dark:text-[#52B788] font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Goal
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {data.goals.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Target size={32} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                                    <p className="text-sm text-slate-500 dark:text-white/40">No goals added yet. Start by adding your first financial goal.</p>
                                </div>
                            ) : (
                                data.goals.map((goal) => (
                                    <div key={goal.id} className="relative group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <Label>Goal Name</Label>
                                                        <Input
                                                            aria-label="Goal Name"
                                                            value={goal.name}
                                                            onChange={(e) => updateGoal(goal.id, { name: e.target.value })}
                                                            placeholder="e.g. Dream House"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <Label>Target ($)</Label>
                                                        <Input
                                                            aria-label="Goal Target"
                                                            type="number"
                                                            value={goal.target}
                                                            onChange={(e) => updateGoal(goal.id, { target: Number(e.target.value) })}
                                                            placeholder="50000"
                                                        />
                                                    </div>
                                                </div>
                                                <Slider
                                                    label="Current Progress"
                                                    value={goal.current}
                                                    min={0}
                                                    max={goal.target || 100}
                                                    step={Math.max(1, Math.floor(goal.target / 100))}
                                                    prefix="$"
                                                    onChange={(v) => updateGoal(goal.id, { current: v })}
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeGoal(goal)}
                                                className="ml-4 p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                                                aria-label={`Delete ${goal.name} goal`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Allocation Breakdown</h3>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {stats.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                fontSize: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                            }}
                                            formatter={(value: number) => `$${value.toLocaleString()}`}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm text-slate-500 dark:text-white/40">Add goal targets to see allocation</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Total Goal Target</p>
                                        <p className="text-4xl font-light tracking-tighter font-sans">${stats.totalTarget.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Overall Progress</p>
                                        <p className="text-xl font-light tracking-tighter text-white/80">{Math.round(stats.overallProgress)}%</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Amount Saved</p>
                                        <p className="text-xl font-medium font-sans text-[#52B788]">${stats.totalCurrent.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-normal mb-1">Remaining</p>
                                        <p className="text-xl font-medium font-sans text-white/90">${stats.remaining.toLocaleString()}</p>
                                    </div>
                                </div>

                                {stats.overallProgress === 100 && (
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#52B788] font-bold bg-white/5 py-2 px-3 rounded-lg justify-center animate-pulse">
                                        <CheckCircle2 size={12} /> All Goals Reached
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={goalDeleteModalOpen}
                onClose={() => setGoalDeleteModalOpen(false)}
                title="Confirm Goal Deletion"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                        Are you sure you want to remove the goal <span className="font-semibold text-slate-900 dark:text-white">"{goalToDelete?.name}"</span>? This will permanently delete the goal and its progress.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setGoalDeleteModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmRemoveGoal}
                            className="flex-1 py-3 bg-[#A4161A] text-white rounded-xl text-sm font-medium hover:bg-[#8B1215] transition-colors shadow-lg shadow-red-500/20"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isAddGoalModalOpen}
                onClose={() => setIsAddGoalModalOpen(false)}
                title="Add New Financial Goal"
            >
                <form onSubmit={handleAddGoalSubmit} className="space-y-6">
                    <div>
                        <Label>Goal Name</Label>
                        <Input
                            aria-label="Goal Name"
                            autoFocus
                            value={newGoalName}
                            onChange={(e) => setNewGoalName(e.target.value)}
                            placeholder="e.g. Vacation Fund"
                        />
                    </div>
                    <div>
                        <Label>Target Amount ($)</Label>
                        <Input
                            aria-label="Target Amount"
                            type="number"
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(e.target.value)}
                            placeholder="5000"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newGoalName.trim()}
                        className="w-full py-3 bg-[#387E67] dark:bg-[#52B788] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                        Create Goal
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export const GoalsCalculator = () => {
    const [profiles, setProfiles] = React.useState<GoalsProfile[]>(() => {
        const saved = localStorage.getItem('goals_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: { goals: [DEFAULT_GOAL] } }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [profileToDelete, setProfileToDelete] = React.useState<{ id: string, name: string } | null>(null);
    const [newProfileName, setNewProfileName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('goals_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const addProfile = () => {
        setNewProfileName('');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProfileName.trim()) return;

        const newId = Date.now().toString();
        setProfiles(prev => [...prev, { id: newId, name: newProfileName.trim(), data: { goals: [DEFAULT_GOAL] } }]);
        setIsModalOpen(false);
        setNewProfileName('');
    };

    const removeProfile = (id: string, name: string) => {
        if (profiles.length === 1) return;
        setProfileToDelete({ id, name });
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (profileToDelete) {
            setProfiles(prev => prev.filter(p => p.id !== profileToDelete.id));
            setDeleteModalOpen(false);
            setProfileToDelete(null);
        }
    };

    const updateProfileData = (id: string, newData: GoalsData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <GoalsPersonView
                            profile={profile}
                            isOnly={profiles.length === 1}
                            onUpdate={(data) => updateProfileData(profile.id, data)}
                            onRemove={() => removeProfile(profile.id, profile.name)}
                        />
                    </React.Fragment>
                ))}
            </div>

            <div className="flex justify-center pt-12 border-t border-slate-100 dark:border-white/5">
                <button
                    onClick={addProfile}
                    className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group"
                >
                    <Plus size={18} className="text-[#387E67] dark:text-[#52B788] group-hover:scale-110 transition-transform" />
                    <span>Add Another Person</span>
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Profile"
            >
                <form onSubmit={handleModalSubmit} className="space-y-6">
                    <div>
                        <Label>Profile Name</Label>
                        <Input
                            aria-label="Profile Name"
                            autoFocus
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="e.g. Partner"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newProfileName.trim()}
                        className="w-full py-3 bg-[#387E67] dark:bg-[#52B788] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Add Profile
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
                        Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">"{profileToDelete?.name}"</span>? This action cannot be undone and all goal data for this person will be lost.
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
