import React, { useMemo } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Slider, Card, CardHeader, CardContent, Modal, Input } from '../ui/Controls';
import { TimeAllocationData } from '../../types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface TimeProfile {
    id: string;
    name: string;
    data: TimeAllocationData;
}

const DEFAULT_DATA: TimeAllocationData = {
    sleep: 56,
    work: 40,
    chores: 10,
    fitness: 5,
    leisure: 30,
    learning: 5,
};

const TimePersonView = ({ profile, onUpdate, onRemove, isOnly }: { 
    profile: TimeProfile, 
    onUpdate: (data: TimeAllocationData) => void,
    onRemove: () => void,
    isOnly: boolean
}) => {
    const data = profile.data;

    const stats = useMemo(() => {
        const values = Object.values(data) as number[];
        const total = values.reduce((a, b) => a + b, 0);
        const remaining = 168 - total;

        return {
            total,
            remaining,
            radarData: [
                { subject: 'Rest', A: data.sleep, fullMark: 100 },
                { subject: 'Career', A: data.work, fullMark: 100 },
                { subject: 'Maintenance', A: data.chores, fullMark: 100 },
                { subject: 'Body', A: data.fitness, fullMark: 100 },
                { subject: 'Fun', A: data.leisure, fullMark: 100 },
                { subject: 'Growth', A: data.learning, fullMark: 100 },
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
                        title="Remove Profile"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Weekly Budget</h3>
                    </CardHeader>
                    <CardContent>
                        <Slider
                            label="Sleep"
                            value={data.sleep}
                            min={0}
                            max={112}
                            suffix="h"
                            onChange={(v) => onUpdate({ ...data, sleep: v })}
                        />
                        <Slider
                            label="Work"
                            value={data.work}
                            min={0}
                            max={100}
                            suffix="h"
                            onChange={(v) => onUpdate({ ...data, work: v })}
                        />
                        <Slider
                            label="Maintenance"
                            value={data.chores}
                            min={0}
                            max={40}
                            suffix="h"
                            onChange={(v) => onUpdate({ ...data, chores: v })}
                        />
                        <Slider
                            label="Health / Fitness"
                            value={data.fitness}
                            min={0}
                            max={20}
                            suffix="h"
                            onChange={(v) => onUpdate({ ...data, fitness: v })}
                        />
                        <Slider
                            label="Leisure"
                            value={data.leisure}
                            min={0}
                            max={80}
                            suffix="h"
                            onChange={(v) => onUpdate({ ...data, leisure: v })}
                        />
                        <Slider
                            label="Self-Growth"
                            value={data.learning}
                            min={0}
                            max={40}
                            suffix="h"
                            onChange={(v) => onUpdate({ ...data, learning: v })}
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Allocation Profile</h3>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                                    <PolarGrid stroke="var(--chart-grid)" />
                                    <PolarAngleAxis dataKey="subject" fontSize={10} tick={{ fill: '#94A3B8' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 80]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Hours"
                                        dataKey="A"
                                        stroke="var(--chart-primary)"
                                        fill="var(--chart-primary)"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card variant="summary" className={stats.remaining < 0 ? "bg-[#A4161A] shadow-[#A4161A]/20" : ""}>
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Weekly Margin</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">{stats.remaining}<span className="text-sm border-l border-white/20 ml-3 pl-3 text-white/40">hrs</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">State</p>
                                    <p className={cn(
                                        "text-xl font-light tracking-tighter",
                                        stats.remaining < 0 ? "text-red-100" : "text-white/80"
                                    )}>
                                        {stats.remaining < 0 ? "Over Limit" : stats.remaining < 10 ? "Capacity" : "Sustainable"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const TimeCalculator = () => {
    const [profiles, setProfiles] = React.useState<TimeProfile[]>(() => {
        const saved = localStorage.getItem('time_profiles');
        if (saved) return JSON.parse(saved);
        return [{ id: '1', name: 'Primary', data: DEFAULT_DATA }];
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [personToDelete, setPersonToDelete] = React.useState<{ id: string, name: string } | null>(null);
    const [newPersonName, setNewPersonName] = React.useState('');

    React.useEffect(() => {
        localStorage.setItem('time_profiles', JSON.stringify(profiles));
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

    const updateProfileData = (id: string, newData: TimeAllocationData) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, data: newData } : p));
    };

    return (
        <div className="space-y-24">
            <div className="space-y-32">
                {profiles.map(profile => (
                    <React.Fragment key={profile.id}>
                        <TimePersonView 
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

