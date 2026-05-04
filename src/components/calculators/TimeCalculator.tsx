import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { TimeAllocationData } from '@/src/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { cn } from '@/src/lib/utils';

export const TimeCalculator = () => {
	const [data, setData] = React.useState<TimeAllocationData>(() => {
		const saved = localStorage.getItem('time_allocation_data');
		return saved ? JSON.parse(saved) : {
			sleep: 56,
			work: 40,
			chores: 10,
			fitness: 5,
			leisure: 30,
			learning: 5,
		};
	});

	React.useEffect(() => {
		localStorage.setItem('time_allocation_data', JSON.stringify(data));
	}, [data]);

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
						onChange={(v) => setData({ ...data, sleep: v })}
					/>
					<Slider
						label="Work"
						value={data.work}
						min={0}
						max={100}
						suffix="h"
						onChange={(v) => setData({ ...data, work: v })}
					/>
					<Slider
						label="Maintenance"
						value={data.chores}
						min={0}
						max={40}
						suffix="h"
						onChange={(v) => setData({ ...data, chores: v })}
					/>
					<Slider
						label="Health / Fitness"
						value={data.fitness}
						min={0}
						max={20}
						suffix="h"
						onChange={(v) => setData({ ...data, fitness: v })}
					/>
					<Slider
						label="Leisure"
						value={data.leisure}
						min={0}
						max={80}
						suffix="h"
						onChange={(v) => setData({ ...data, leisure: v })}
					/>
					<Slider
						label="Self-Growth"
						value={data.learning}
						min={0}
						max={40}
						suffix="h"
						onChange={(v) => setData({ ...data, learning: v })}
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
	);
};
