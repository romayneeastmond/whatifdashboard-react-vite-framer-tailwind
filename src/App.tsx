/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
	BarChart3,
	Home,
	Wallet,
	Clock,
	Github,
	X,
	Menu,
	Sun,
	Moon,
	Target
} from 'lucide-react';
import { CalculatorType } from './types';
import { SalaryCalculator } from './components/calculators/SalaryCalculator';
import { MortgageCalculator } from './components/calculators/MortgageCalculator';
import { InvestmentCalculator } from './components/calculators/InvestmentCalculator';
import { TimeCalculator } from './components/calculators/TimeCalculator';
import { GoalsCalculator } from './components/calculators/GoalsCalculator';
import { cn } from './lib/utils';

const NAV_ITEMS = [
	{ id: 'salary', label: 'Salary & Taxes', icon: Wallet },
	{ id: 'mortgage', label: 'Mortgage Equity', icon: Home },
	{ id: 'investing', label: 'Wealth Growth', icon: BarChart3 },
	{ id: 'goals', label: 'Goals Tracking', icon: Target },
	{ id: 'time', label: 'Time Allocation', icon: Clock },
] as const;

export default function App() {
	const [activeTab, setActiveTab] = useState<CalculatorType>('salary');
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(() => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('theme') === 'dark' ||
				(!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
		return false;
	});

	React.useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}, [isDarkMode]);

	const toggleTheme = () => setIsDarkMode(!isDarkMode);

	const renderCalculator = () => {
		switch (activeTab) {
			case 'salary': return <SalaryCalculator />;
			case 'mortgage': return <MortgageCalculator />;
			case 'investing': return <InvestmentCalculator />;
			case 'time': return <TimeCalculator />;
			case 'goals': return <GoalsCalculator />;
			default: return null;
		}
	};

	return (
		<div className="min-h-screen bg-[#F7F7F4] dark:bg-[#0A0A0A] text-slate-900 dark:text-white font-sans selection:bg-slate-200 dark:selection:bg-white/10 selection:text-slate-900 transition-colors duration-300">
			{/* Sticky Top Header (Desktop) */}
			<header className="sticky top-0 z-40 w-full bg-[#F7F7F4] dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5 hidden lg:block">
				<div className="max-w-6xl mx-auto px-12 h-12 flex items-center justify-between">
					<div className="flex items-center gap-8">
						<h1 className="font-medium tracking-tight text-sm text-black dark:text-white whitespace-nowrap">What-If Dashboard</h1>
						<nav className="flex items-center h-12">
							{NAV_ITEMS.map((item) => {
								const isActive = activeTab === item.id;
								const Icon = item.icon;
								return (
									<button
										key={item.id}
										onClick={() => setActiveTab(item.id)}
										className={cn(
											"px-4 h-12 flex items-center gap-2 text-[11px] font-normal transition-all relative group cursor-pointer",
											isActive
												? "text-black dark:text-white"
												: "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
										)}
									>
										<Icon size={14} className={isActive ? "text-[#387E67] dark:text-[#52B788]" : "text-black/30 dark:text-white/30"} />
										{item.label}
										{isActive && (
											<motion.div
												layoutId="activeTabUnderline"
												className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#387E67] dark:bg-[#52B788]"
											/>
										)}
									</button>
								);
							})}

							<div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-4" />

							<button
								onClick={toggleTheme}
								className="p-1.5 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
								title="Toggle Theme"
							>
								{isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
							</button>
						</nav>
					</div>
				</div>
			</header>

			{/* Mobile Header */}
			<header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-3 bg-[#F7F7F4] dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
				<h1 className="font-medium tracking-tight text-sm text-black dark:text-white">What-If Dashboard</h1>
				<div className="flex items-center gap-2">
					<button
						onClick={toggleTheme}
						className="p-1.5 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors rounded-lg"
					>
						{isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
					</button>
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
					>
						{isSidebarOpen ? <X size={18} className="dark:text-white" /> : <Menu size={18} className="dark:text-white" />}
					</button>
				</div>
			</header>

			<div className="flex flex-col">
				{/* Mobile Sidebar (Drawer) */}
				<aside className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out lg:hidden",
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}>
					<div className="p-8">
						<div className="mb-12 flex justify-between items-center">
							<h1 className="font-medium tracking-tight text-md text-black dark:text-white">What-If Dashboard</h1>
							<button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
								<X size={18} />
							</button>
						</div>

						<nav className="space-y-1">
							{NAV_ITEMS.map((item) => {
								const Icon = item.icon;
								const isActive = activeTab === item.id;
								return (
									<button
										key={item.id}
										onClick={() => {
											setActiveTab(item.id);
											setIsSidebarOpen(false);
										}}
										className={cn(
											"w-full flex items-center gap-3 px-4 py-3 text-sm font-normal transition-all group cursor-pointer",
											isActive
												? "bg-slate-100 dark:bg-white/5 text-black dark:text-white"
												: "text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
										)}
									>
										<Icon size={18} className={cn(
											"transition-colors",
											isActive ? "text-[#387E67] dark:text-[#52B788]" : "text-slate-400 dark:text-white/30 group-hover:text-black dark:group-hover:text-white"
										)} />
										{item.label}
									</button>
								);
							})}
						</nav>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full">
					<header className="flex justify-between items-end border-b border-slate-200 dark:border-white/5 pb-6 mb-10">
						<div>
							<h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
								{NAV_ITEMS.find(n => n.id === activeTab)?.label}
							</h2>
						</div>
					</header>

					<AnimatePresence mode="wait">
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
						>
							{renderCalculator()}
						</motion.div>
					</AnimatePresence>

					<footer className="mt-20 pb-12 border-t border-slate-200 dark:border-white/5 pt-8">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-black dark:text-slate-500 font-normal">
							<a
								href="https://github.com/romayneeastmond/whatifdashboard-react-vite-framer-tailwind"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-slate-400 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors"
							>
								<Github size={12} />
								<span>Source Code</span>
							</a>
							<p>&copy; 2026 What-If Dashboard</p>
						</div>
					</footer>
				</main>
			</div>

			{/* Overlay for mobile nav */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</div>
	);
}

