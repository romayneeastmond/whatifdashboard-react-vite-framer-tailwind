
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BarChart3, Home, Wallet, Clock, Target, ArrowRight, ChevronDown, Scale, CreditCard, LayoutGrid, Dumbbell, Flame, CalendarDays, LayoutList, FolderOpen, Utensils, TrendingUp, ShieldAlert, Banknote, TrendingDown, LifeBuoy, ShieldCheck, PiggyBank, Landmark, CircleDollarSign, Search } from 'lucide-react';
import { useState } from 'react';

const TOOLS = [
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
		path: '/daysbetween',
		label: 'Days Between',
		icon: CalendarDays,
		color: 'text-sky-600 dark:text-sky-400',
		bg: 'bg-sky-50 dark:bg-sky-950/40',
		description:
			'Calculate the exact number of days, weeks, months, and years between any two dates. Shows both a total and a broken-down remainder for each unit.',
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
		path: '/goals',
		label: 'Goals Tracking',
		icon: Target,
		color: 'text-rose-600 dark:text-rose-400',
		bg: 'bg-rose-50 dark:bg-rose-950/40',
		description:
			'Set financial targets and track progress toward each one. Add goals, log current amounts, and watch your completion percentage grow.',
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
		path: '/protein',
		label: 'Protein Intake',
		icon: Dumbbell,
		color: 'text-orange-600 dark:text-orange-400',
		bg: 'bg-orange-50 dark:bg-orange-950/40',
		description:
			'Calculate your recommended daily protein intake based on your age, weight, and activity level. See results in grams and protein powder scoops. Supports lbs and kg.',
	},
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
		path: '/time',
		label: 'Time Allocation',
		icon: Clock,
		color: 'text-amber-600 dark:text-amber-400',
		bg: 'bg-amber-50 dark:bg-amber-950/40',
		description:
			'Audit how you spend your 24 hours. Allocate time across sleep, work, fitness, chores, learning, and leisure to find a balance that works for you.',
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
		path: '/weightloss',
		label: 'Weight Loss',
		icon: Flame,
		color: 'text-red-600 dark:text-red-400',
		bg: 'bg-red-50 dark:bg-red-950/40',
		description:
			'Calculate your recommended daily caloric intake, safe calorie deficit, and projected weekly weight loss to reach a target weight. Uses the Mifflin-St Jeor equation. Supports lbs and kg.',
	},
	{
		path: '/calorie',
		label: 'Calorie Deficit Planner',
		icon: Utensils,
		color: 'text-lime-600 dark:text-lime-400',
		bg: 'bg-lime-50 dark:bg-lime-950/40',
		description:
			'Plan your calorie deficit strategy. Set a weekly loss goal, split your deficit between diet and exercise, and compare conservative vs aggressive approaches side by side.',
	},
	{
		path: '/careerpath',
		label: 'Career Path Projection',
		icon: TrendingUp,
		color: 'text-teal-600 dark:text-teal-400',
		bg: 'bg-teal-50 dark:bg-teal-950/40',
		description:
			'Project your salary over 5, 10, or 20 years. Compare staying in your current role with promotions against job-hopping for higher bumps, and see the lifetime earnings difference.',
	},
	{
		path: '/wrongfuldismissal',
		label: 'Wrongful Dismissal',
		icon: ShieldAlert,
		color: 'text-rose-700 dark:text-rose-400',
		bg: 'bg-rose-50 dark:bg-rose-950/40',
		description:
			'Estimate your wrongful dismissal damages under Canadian employment law. Calculates common law notice, ESA minimums, bad faith damages, mitigation deductions, and a typical settlement range.',
	},
	{
		path: '/lowerpayingjob',
		label: 'Lower-Paying Job',
		icon: TrendingDown,
		color: 'text-fuchsia-600 dark:text-fuchsia-400',
		bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
		description:
			'Compare your current salary against a lower-paying job offer. See the true financial cost of the pay cut including benefits, monthly surplus, and projected 10-year wealth difference.',
	},
	{
		path: '/emergencyfund',
		label: 'Emergency Fund Runway',
		icon: ShieldCheck,
		color: 'text-sky-600 dark:text-sky-400',
		bg: 'bg-sky-50 dark:bg-sky-950/40',
		description:
			'Find out if your emergency fund is big enough and how long it will take to build one. See your current runway in months, the gap to your target, and how boosting contributions or cutting expenses accelerates your timeline.',
	},
	{
		path: '/fire',
		label: 'FIRE / Retirement Calculator',
		icon: PiggyBank,
		color: 'text-green-600 dark:text-green-400',
		bg: 'bg-green-50 dark:bg-green-950/40',
		description:
			'Find your FIRE number and see when you can retire. Enter your current savings, monthly contributions, expected return, and retirement expenses to project your portfolio over time and see if you\'re on track.',
	},
	{
		path: '/layoffsurvival',
		label: 'Layoff Survival Simulator',
		icon: LifeBuoy,
		color: 'text-orange-600 dark:text-orange-400',
		bg: 'bg-orange-50 dark:bg-orange-950/40',
		description:
			'Find out how long your savings and severance will last after a job loss. Model your runway, burn rate, and break-even income — then see how cutting expenses or adding side income extends your timeline.',
	},
	{
		path: '/severanceei',
		label: 'Severance & EI Estimator',
		icon: Banknote,
		color: 'text-cyan-600 dark:text-cyan-400',
		bg: 'bg-cyan-50 dark:bg-cyan-950/40',
		description:
			'Estimate your Canadian severance package and Employment Insurance benefits after a job loss. Calculates ESA termination and severance pay by province, EI eligibility, weekly benefit, duration, and your total income runway.',
	},
	{
		path: '/rrsp-tfsa',
		label: 'RRSP vs TFSA Optimizer',
		icon: Landmark,
		color: 'text-indigo-600 dark:text-indigo-400',
		bg: 'bg-indigo-50 dark:bg-indigo-950/40',
		description:
			'Decide whether to prioritize RRSP or TFSA contributions based on your current and expected retirement tax rates. Compares after-tax retirement wealth for each strategy and recommends the better option.',
	},
	{
		path: '/networth',
		label: 'Net Worth Projection',
		icon: CircleDollarSign,
		color: 'text-teal-600 dark:text-teal-400',
		bg: 'bg-teal-50 dark:bg-teal-950/40',
		description:
			'Track your total net worth and project how it grows over time. Enter all your assets and liabilities, set your monthly savings rate and expected growth, and see your trajectory over up to 40 years. Supports multiple profiles for couples.',
	},
	{
		path: '/total-comp',
		label: 'Total Compensation',
		icon: Wallet,
		color: 'text-violet-600 dark:text-violet-400',
		bg: 'bg-violet-50 dark:bg-violet-950/40',
		description:
			'See the true value of a job offer beyond the base salary. Add dental, medical, vision, life insurance, disability, and RRSP / 401k match to calculate your full compensation package and how much your benefits are worth.',
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
		q: 'How many calculators are available?',
		a: `There are ${TOOLS.length} free calculators available — no account, no subscription, no paywall. Every tool runs entirely in your browser.`,
	},
	{
		q: 'Where is my data stored?',
		a: "Everything stays in your browser's localStorage — no account, no server, no database. Your numbers never leave your device.",
	},
	{
		q: 'Is any data sent to a server?',
		a: 'No. All calculations run entirely in your browser. Nothing is transmitted, tracked, or stored outside your own device.',
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
		q: 'Can I use my exported data in Notion or Obsidian?',
		a: 'Yes. The exported JSON file is plain, human-readable data. In Notion you can import it via a Notion integration or paste values manually. In Obsidian, drop the file into your vault and reference it from any note — community plugins like Dataview or JSON Importer can render the data inline.',
	},
	{
		q: 'Can I feed my data into an AI assistant or LLM?',
		a: 'Yes. Use the "Export → MCP / RAG JSON" option in the footer. It produces a structured JSON file where each calculator\'s inputs and results are labelled and formatted as readable strings — ideal for pasting into a system prompt or uploading to an LLM context window. You can also load it into a retrieval-augmented generation (RAG) pipeline or an MCP server so that an AI assistant like Claude can answer questions about your finances, career, or health goals using your actual numbers.',
	},
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
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

const CATEGORIES = [
	{ name: 'Career', color: 'text-teal-600 dark:text-teal-400', paths: ['/careerpath', '/lowerpayingjob', '/salary', '/total-comp'] },
	{ name: 'Finance', color: 'text-emerald-600 dark:text-emerald-400', paths: ['/debt', '/emergencyfund', '/fire', '/goals', '/layoffsurvival', '/mortgage', '/networth', '/investing', '/rrsp-tfsa'] },
	{ name: 'Fitness', color: 'text-orange-600 dark:text-orange-400', paths: ['/calorie', '/protein', '/weightloss'] },
	{ name: 'Legal', color: 'text-slate-600 dark:text-slate-400', paths: ['/bardal', '/wrongfuldismissal', '/severanceei'] },
	{ name: 'Productivity', color: 'text-amber-600 dark:text-amber-400', paths: ['/daysbetween', '/time'] },
];

const ToolCard = ({ tool, delay }: { tool: typeof TOOLS[number]; delay: number }) => {
	const Icon = tool.icon;
	return (
		<motion.div
			key={tool.path}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
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
}

const normalize = (s: string) => s.toLowerCase();

export const LandingPage = () => {
	const [view, setView] = useState<'list' | 'categories'>('categories');
	const [query, setQuery] = useState('');
	const navigate = useNavigate();

	const q = normalize(query.trim());
	const allToolsWithCategory = CATEGORIES.flatMap(cat =>
		TOOLS.filter(t => cat.paths.includes(t.path)).map(t => ({ ...t, category: cat.name }))
	);
	const filtered = q
		? allToolsWithCategory.filter(t =>
			normalize(t.label).includes(q) ||
			normalize(t.description).includes(q) ||
			normalize(t.category).includes(q)
		)
		: null;

	return (
		<div className="w-full px-6 lg:px-12 py-16 lg:py-24">
			{/* Hero */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
			>
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 mb-4 font-normal">
						Life Decision Simulator
					</p>
					<h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
						What would happen<br />
						<span className="text-[#387E67] dark:text-[#52B788]">if you changed one thing?</span>
					</h1>
					<p className="text-base text-slate-500 dark:text-white/50 max-w-xl leading-relaxed">
						Most calculators answer one question in isolation. This connects the whole picture — salary, debt, health, time, and retirement — so you can see how one decision ripples across your life. No account. Nothing sent anywhere.
					</p>
				</div>
				<div>
					<Link
						to="/blog"
						className="group flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-md transition-all duration-200"
					>
						<p className="text-xs uppercase tracking-[0.2em] text-[#387E67] dark:text-[#52B788] font-normal">
							From the Blog
						</p>
						<h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white leading-snug">
							Make better decisions<br />with better information.
						</h2>
						<p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed">
							Guides on personal finance, career moves, fitness, and the math behind life's biggest choices.
						</p>
						<span className="inline-flex items-center gap-2 text-sm font-medium text-[#387E67] dark:text-[#52B788] group-hover:gap-3 transition-all duration-200">
							Read the blog <ArrowRight size={15} />
						</span>
					</Link>
				</div>
			</motion.div>

			{/* Search */}
			<div className="relative mb-8">
				<Search
					size={15}
					className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none"
				/>
				<input
					type="search"
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder="Search calculators…"
					aria-label="Search calculators"
					className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:border-[#387E67] dark:focus:border-[#52B788] transition-colors [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
				/>
			</div>

			{/* View toggle */}
			<div className="flex items-center gap-1 mb-6">
				<button
					onClick={() => setView('list')}
					aria-label="List view"
					aria-pressed={view === 'list'}
					className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'text-[#387E67] dark:text-[#52B788] bg-slate-100 dark:bg-white/10' : 'text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'}`}
				>
					<LayoutList size={16} />
				</button>
				<button
					onClick={() => setView('categories')}
					aria-label="Categories view"
					aria-pressed={view === 'categories'}
					className={`p-2 rounded-lg transition-colors ${view === 'categories' ? 'text-[#387E67] dark:text-[#52B788] bg-slate-100 dark:bg-white/10' : 'text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'}`}
				>
					<FolderOpen size={16} />
				</button>
			</div>

			{/* Filtered search results */}
			{filtered !== null && (
				filtered.length === 0
					? (
						<p className="text-sm text-slate-400 dark:text-white/30 py-8 text-center">
							No calculators matching &ldquo;{query}&rdquo;
						</p>
					)
					: (
						<div className="space-y-3">
							{filtered.map((tool) => (
								<button
									key={tool.path}
									onClick={() => navigate(tool.path)}
									className="w-full flex items-center justify-between gap-4 p-4 text-left rounded-lg border border-slate-200 dark:border-white/8 bg-white dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-sm transition-all duration-200 group cursor-pointer"
								>
									<div className="min-w-0">
										<p className="text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 mb-1">
											{tool.category}
										</p>
										<p className="text-sm font-medium text-slate-900 dark:text-white truncate">{tool.label}</p>
										<p className="text-xs text-slate-500 dark:text-white/40 mt-1 line-clamp-1">{tool.description}</p>
									</div>
									<ArrowRight
										size={14}
										className="shrink-0 text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 group-hover:translate-x-0.5 transition-all"
									/>
								</button>
							))}
						</div>
					)
			)}

			{/* Tool cards — list view */}
			{filtered === null && view === 'list' && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[...TOOLS].sort((a, b) => a.label.localeCompare(b.label)).map((tool, i) => (
						<ToolCard key={tool.path} tool={tool} delay={0.06 * i} />
					))}
				</div>
			)}

			{/* Tool cards — categories view */}
			{filtered === null && view === 'categories' && (
				<div className="space-y-12">
					{CATEGORIES.map((cat) => {
						const catTools = TOOLS.filter(t => cat.paths.includes(t.path)).sort((a, b) => a.label.localeCompare(b.label));
						return (
							<div key={cat.name}>
								<h2 className={`text-xs uppercase tracking-[0.2em] font-normal mb-4 ${cat.color}`}>
									{cat.name}
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{catTools.map((tool, i) => (
										<ToolCard key={tool.path} tool={tool} delay={0.06 * i} />
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}


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
