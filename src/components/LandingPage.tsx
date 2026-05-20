/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BarChart3, Home, Wallet, Clock, Target, ArrowRight, ChevronDown, Scale, CreditCard, LayoutGrid } from 'lucide-react';
import { useState } from 'react';

const TOOLS = [
	{
		path: '/salary',
		label: 'Salary & Taxes',
		icon: Wallet,
		color: 'text-emerald-600 dark:text-emerald-400',
		bg: 'bg-emerald-50 dark:bg-emerald-950/40',
		description:
			'Model your take-home pay. Adjust gross salary, tax rate, retirement contribution, and monthly expenses to see exactly what lands in your pocket.',
	},
	{
		path: '/mortgage',
		label: 'Mortgage Equity',
		icon: Home,
		color: 'text-blue-600 dark:text-blue-400',
		bg: 'bg-blue-50 dark:bg-blue-950/40',
		description:
			'Run the numbers on a home purchase. Explore how down payment, interest rate, and loan term affect your monthly payment and long-term equity.',
	},
	{
		path: '/debt',
		label: 'Debt Repayment',
		icon: CreditCard,
		color: 'text-red-600 dark:text-red-400',
		bg: 'bg-red-50 dark:bg-red-950/40',
		description:
			'See exactly when you will be debt-free. Enter your balance, interest rate, and monthly payment to visualize the payoff timeline and total interest cost.',
	},
	{
		path: '/investing',
		label: 'Wealth Growth',
		icon: BarChart3,
		color: 'text-violet-600 dark:text-violet-400',
		bg: 'bg-violet-50 dark:bg-violet-950/40',
		description:
			'Project your investment portfolio over time. Tweak initial amount, monthly contributions, and expected return rate to visualize compounding growth.',
	},
	{
		path: '/goals',
		label: 'Goals Tracking',
		icon: Target,
		color: 'text-rose-600 dark:text-rose-400',
		bg: 'bg-rose-50 dark:bg-rose-950/40',
		description:
			'Set financial targets and track progress toward each one. Add goals, log current amounts, and watch your completion percentage grow.',
	},
	{
		path: '/bardal',
		label: 'Bardal Factor',
		icon: Scale,
		color: 'text-slate-600 dark:text-slate-400',
		bg: 'bg-slate-50 dark:bg-slate-900/40',
		description:
			'Estimate your reasonable notice period and severance entitlement under Canadian employment law using the Bardal factors: character of employment, length of service, age, and availability of similar work.',
	},
	{
		path: '/time',
		label: 'Time Allocation',
		icon: Clock,
		color: 'text-amber-600 dark:text-amber-400',
		bg: 'bg-amber-50 dark:bg-amber-950/40',
		description:
			'Audit how you spend your 24 hours. Allocate time across sleep, work, fitness, chores, learning, and leisure to find a balance that works for you.',
	},
	{
		path: '/multi',
		label: 'Multi-Option Dashboard',
		icon: LayoutGrid,
		color: 'text-indigo-600 dark:text-indigo-400',
		bg: 'bg-indigo-50 dark:bg-indigo-950/40',
		description:
			'Build your own personal dashboard by combining any mix of calculators on a single page. Your selection is saved and included in your exported data.',
	},
];

const FAQ = [
	{
		q: 'Where is my data stored?',
		a: "Everything stays in your browser's localStorage — no account, no server, no database. Your numbers never leave your device.",
	},
	{
		q: 'Can I lose my data?',
		a: 'Yes, if you clear your browser data or switch browsers. Use the Export feature in the footer to save a backup file at any time.',
	},
	{
		q: 'How does Export work?',
		a: 'Clicking Export in the footer downloads a single JSON file containing all your saved inputs across every tool. Keep it anywhere you like.',
	},
	{
		q: 'How does Import work?',
		a: 'Clicking Import and selecting a previously exported JSON file restores all your inputs exactly as they were. This overwrites any current data, so export first if needed.',
	},
	{
		q: 'Is any data sent to a server?',
		a: 'No. All calculations run entirely in your browser. Nothing is transmitted, tracked, or stored outside your own device.',
	},
];

function FaqItem({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="border-t border-slate-200 dark:border-white/8">
			<button
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				className="w-full flex items-center justify-between py-4 text-left gap-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-150 px-3"
			>
				<span className="text-base font-medium text-slate-800 dark:text-white/90 group-hover:text-black dark:group-hover:text-white transition-colors">
					{q}
				</span>
				<ChevronDown
					size={16}
					className={`shrink-0 text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/60 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>
			<p className={`faq-answer pb-4 px-3 pt-3 text-sm text-slate-500 dark:text-white/40 leading-relaxed${open ? '' : ' hidden'}`}>
				{a}
			</p>
		</div>
	);
}

export function LandingPage() {
	return (
		<div className="w-full px-6 lg:px-12 py-16 lg:py-24">
			{/* Hero */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="mb-20"
			>
				<p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 mb-4 font-normal">
					Financial Modeling Tools
				</p>
				<h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
					What would happen<br />
					<span className="text-[#387E67] dark:text-[#52B788]">if you changed one thing?</span>
				</h2>
				<p className="text-base text-slate-500 dark:text-white/50 max-w-xl leading-relaxed">
					A set of quick, no-account-required modeling tools for everyday financial decisions.
					All calculations happen in your browser — nothing is sent anywhere.
				</p>
			</motion.div>

			{/* Tool cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{TOOLS.map((tool, i) => {
					const Icon = tool.icon;
					return (
						<motion.div
							key={tool.path}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.08 * i }}
						>
							<Link
								to={tool.path}
								className="group flex flex-col text-left p-6 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-sm transition-all duration-200 h-full"
							>
								<div className="flex items-start justify-between mb-4">
									<div className={`p-2.5 rounded-lg ${tool.bg}`}>
										<Icon size={18} className={tool.color} />
									</div>
									<ArrowRight
										size={16}
										className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 group-hover:translate-x-0.5 transition-all mt-1"
									/>
								</div>
								<h3 className="text-base font-medium text-slate-900 dark:text-white mb-2">
									{tool.label}
								</h3>
								<p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed">
									{tool.description}
								</p>
							</Link>
						</motion.div>
					);
				})}

			</div>

			{/* FAQ */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.08 * (TOOLS.length + 1) }}
				className="mt-20"
			>
				<p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 mb-6 font-normal">
					Frequently Asked Questions
				</p>
				<div className="w-full border-b border-slate-200 dark:border-white/8">
					{FAQ.map((item, i) => (
						<div key={i}><FaqItem q={item.q} a={item.a} /></div>
					))}
				</div>
			</motion.div>
		</div>
	);
}
