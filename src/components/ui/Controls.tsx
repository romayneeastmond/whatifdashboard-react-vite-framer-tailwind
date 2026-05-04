import React from 'react';
import { cn } from '@/src/lib/utils';

export const Card = ({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'summary' }) => (
	<div className={cn(
		variant === 'summary'
			? "bg-[#387E67] text-white border-none rounded-2xl shadow-xl shadow-[#387E67]/20"
			: "bg-white dark:bg-[#121212] border border-[#e1e1de] dark:border-white/10 rounded-[12px] shadow-sm shadow-slate-200/50 dark:shadow-none",
		className
	)}>
		{children}
	</div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
	<div className={cn("px-6 py-5", className)}>
		{children}
	</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
	<div className={cn("p-6", className)}>
		{children}
	</div>
);

export const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
	<label className={cn("text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-2 block", className)}>
		{children}
	</label>
);

export const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
	<input
		{...props}
		className={cn(
			"w-full px-3 py-2 bg-[#F8F9F8] dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-mono text-slate-900 dark:text-white transition-all",
			"focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/5 focus:border-slate-300 dark:focus:border-white/10",
			props.className
		)}
	/>
);

export const Slider = ({
	label,
	value,
	min,
	max,
	step = 1,
	onChange,
	suffix = ""
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onChange: (val: number) => void;
	suffix?: string;
}) => (
	<div className="mb-6">
		<div className="flex justify-between items-center mb-2">
			<Label>{label}</Label>
			<span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{value.toLocaleString()}{suffix}</span>
		</div>
		<input
			type="range"
			min={min}
			max={max}
			step={step}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#387E67]"
		/>
	</div>
);

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export const Modal = ({ 
	isOpen, 
	onClose, 
	title, 
	children 
}: { 
	isOpen: boolean; 
	onClose: () => void; 
	title: string; 
	children: React.ReactNode;
}) => (
	<AnimatePresence>
		{isOpen && (
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<motion.div 
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				/>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
				>
					<div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
						<h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-widest">{title}</h3>
						<button onClick={onClose} className="p-1 text-slate-400 hover:text-black dark:hover:text-white transition-colors">
							<X size={18} />
						</button>
					</div>
					<div className="p-6">
						{children}
					</div>
				</motion.div>
			</div>
		)}
	</AnimatePresence>
);
