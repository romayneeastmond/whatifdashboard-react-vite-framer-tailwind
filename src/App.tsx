
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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
	Target,
	Download,
	Upload,
	ArrowUp,
	Coffee,
	Scale,
	CreditCard,
	LayoutGrid,
	ChevronDown,
	Dumbbell,
	Flame,
	CalendarDays,
	FolderOpen,
	Utensils,
	TrendingUp,
	ShieldAlert,
	Banknote,
	Trash2,
	TrendingDown,
	LifeBuoy,
	ShieldCheck,
} from 'lucide-react';
import { exportNotion, exportObsidian, exportMcpRag } from './utils/exportMarkdown';
import { BLOG_POSTS } from './components/BlogPosts/registry';

const SalaryCalculator = React.lazy(() => import('./components/calculators/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const MortgageCalculator = React.lazy(() => import('./components/calculators/MortgageCalculator').then(m => ({ default: m.MortgageCalculator })));
const InvestmentCalculator = React.lazy(() => import('./components/calculators/InvestmentCalculator').then(m => ({ default: m.InvestmentCalculator })));
const TimeCalculator = React.lazy(() => import('./components/calculators/TimeCalculator').then(m => ({ default: m.TimeCalculator })));
const GoalsCalculator = React.lazy(() => import('./components/calculators/GoalsCalculator').then(m => ({ default: m.GoalsCalculator })));
const BardalCalculator = React.lazy(() => import('./components/calculators/BardalCalculator').then(m => ({ default: m.BardalCalculator })));
const DebtCalculator = React.lazy(() => import('./components/calculators/DebtCalculator').then(m => ({ default: m.DebtCalculator })));
const ProteinCalculator = React.lazy(() => import('./components/calculators/ProteinCalculator').then(m => ({ default: m.ProteinCalculator })));
const WeightLossCalculator = React.lazy(() => import('./components/calculators/WeightLossCalculator').then(m => ({ default: m.WeightLossCalculator })));
const DaysBetweenCalculator = React.lazy(() => import('./components/calculators/DaysBetweenCalculator').then(m => ({ default: m.DaysBetweenCalculator })));
const MultiOptionPage = React.lazy(() => import('./components/MultiOptionPage').then(m => ({ default: m.MultiOptionPage })));
const CategoriesPage = React.lazy(() => import('./components/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const LandingPage = React.lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const CalorieDeficitCalculator = React.lazy(() => import('./components/calculators/CalorieDeficitCalculator').then(m => ({ default: m.CalorieDeficitCalculator })));
const CareerPathCalculator = React.lazy(() => import('./components/calculators/CareerPathCalculator').then(m => ({ default: m.CareerPathCalculator })));
const WrongfulDismissalCalculator = React.lazy(() => import('./components/calculators/WrongfulDismissalCalculator').then(m => ({ default: m.WrongfulDismissalCalculator })));
const SeveranceEICalculator = React.lazy(() => import('./components/calculators/SeveranceEICalculator').then(m => ({ default: m.SeveranceEICalculator })));
const LowerPayingJobCalculator = React.lazy(() => import('./components/calculators/LowerPayingJobCalculator').then(m => ({ default: m.LowerPayingJobCalculator })));
const LayoffSurvivalCalculator = React.lazy(() => import('./components/calculators/LayoffSurvivalCalculator').then(m => ({ default: m.LayoffSurvivalCalculator })));
const EmergencyFundCalculator = React.lazy(() => import('./components/calculators/EmergencyFundCalculator').then(m => ({ default: m.EmergencyFundCalculator })));
const CookieBanner = React.lazy(() => import('./components/CookieBanner').then(m => ({ default: m.CookieBanner })));
const BlogPage = React.lazy(() => import('./components/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = React.lazy(() => import('./components/BlogPostPage').then(m => ({ default: m.BlogPostPage })));

const WrongfulDismissalBlogPost = React.lazy(() => import('./components/BlogPosts/WrongfulDismissalBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
const CareerPathBlogPost = React.lazy(() => import('./components/BlogPosts/CareerPathBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
const GoalsBlogPost = React.lazy(() => import('./components/BlogPosts/GoalsBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
const SalaryBlogPost = React.lazy(() => import('./components/BlogPosts/SalaryBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
const DebtBlogPost = React.lazy(() => import('./components/BlogPosts/DebtBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
const InvestmentBlogPost = React.lazy(() => import('./components/BlogPosts/InvestmentBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
const SeveranceEIBlogPost = React.lazy(() => import('./components/BlogPosts/SeveranceEIBlogPost').then(m => ({ default: () => <BlogPostPage body={m.default} /> })));
import { cn } from './lib/utils';

const NAV_ITEMS = [
	{ path: '/salary', label: 'Salary & Taxes', icon: Wallet },
	{ path: '/mortgage', label: 'Mortgage Equity', icon: Home },
	{ path: '/debt', label: 'Debt Repayment', icon: CreditCard },
	{ path: '/investing', label: 'Wealth Growth', icon: BarChart3 },
	{ path: '/goals', label: 'Goals Tracking', icon: Target },
	{ path: '/blog', label: 'Blog', icon: TrendingUp },
] as const;

type MoreNavItem = { path: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> };
type MoreDivider = { divider: true };
type MoreEntry = MoreNavItem | MoreDivider;

const MORE_ITEMS: MoreEntry[] = [
	{ path: '/bardal', label: 'Bardal Factor', icon: Scale },
	{ path: '/calorie', label: 'Calorie Deficit', icon: Utensils },
	{ path: '/careerpath', label: 'Career Path', icon: TrendingUp },
	{ path: '/daysbetween', label: 'Days Between', icon: CalendarDays },
	{ path: '/emergencyfund', label: 'Emergency Fund', icon: ShieldCheck },
	{ path: '/layoffsurvival', label: 'Layoff Survival', icon: LifeBuoy },
	{ path: '/lowerpayingjob', label: 'Lower-Paying Job', icon: TrendingDown },
	{ path: '/protein', label: 'Protein Intake', icon: Dumbbell },
	{ path: '/severanceei', label: 'Severance & EI', icon: Banknote },
	{ path: '/time', label: 'Time Allocation', icon: Clock },
	{ path: '/weightloss', label: 'Weight Loss', icon: Flame },
	{ path: '/wrongfuldismissal', label: 'Wrongful Dismissal', icon: ShieldAlert },
	{ divider: true },
	{ path: '/multi', label: 'Multi-Option', icon: LayoutGrid },
	{ path: '/categories', label: 'Categories', icon: FolderOpen },
];

const MORE_PATHS = MORE_ITEMS
	.filter((m): m is MoreNavItem => !('divider' in m))
	.map(m => m.path);

const CALCULATOR_LABELS: Record<string, string> = {
	'/bardal': 'Bardal Factor',
	'/calorie': 'Calorie Deficit Planner',
	'/careerpath': 'Career Path Projection',
	'/daysbetween': 'Days Between',
	'/debt': 'Debt Repayment',
	'/emergencyfund': 'Emergency Fund Runway',
	'/goals': 'Goals Tracking',
	'/investing': 'Wealth Growth',
	'/layoffsurvival': 'Layoff Survival Simulator',
	'/lowerpayingjob': 'Lower-Paying Job',
	'/mortgage': 'Mortgage Equity',
	'/protein': 'Protein Intake',
	'/salary': 'Salary & Taxes',
	'/severanceei': 'Severance & EI Estimator',
	'/time': 'Time Allocation',
	'/weightloss': 'Weight Loss',
	'/wrongfuldismissal': 'Wrongful Dismissal',
};

const CATEGORIES_MAP = [
	{ name: 'Career', paths: ['/careerpath', '/lowerpayingjob', '/salary'] },
	{ name: 'Finance', paths: ['/debt', '/emergencyfund', '/goals', '/layoffsurvival', '/mortgage', '/investing'] },
	{ name: 'Fitness', paths: ['/calorie', '/protein', '/weightloss'] },
	{ name: 'Legal', paths: ['/bardal', '/wrongfuldismissal', '/severanceei'] },
	{ name: 'Productivity', paths: ['/daysbetween', '/time'] },
];

const RelatedCategoryDropdown = ({ currentPath }: { currentPath: string }) => {
	const [open, setOpen] = useState(false);
	const ref = React.useRef<HTMLDivElement>(null);

	const category = CATEGORIES_MAP.find(c => c.paths.includes(currentPath));

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
		document.addEventListener('mousedown', handler);
		document.addEventListener('keydown', onKey);
		return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
	}, []);

	if (!category) return null;

	const siblings = category.paths.filter(p => p !== currentPath);

	return (
		<div ref={ref} className="relative flex items-center">
			<button
				onClick={() => setOpen(o => !o)}
				aria-haspopup="true"
				aria-expanded={open}
				aria-label={`Related: ${category.name} calculators`}
				className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] font-normal text-slate-500 dark:text-white/40 hover:text-[#387E67] dark:hover:text-[#52B788] border border-slate-200 dark:border-white/10 hover:border-[#387E67] dark:hover:border-[#52B788] transition-colors duration-200 cursor-pointer"
			>
				{category.name}
				<ChevronDown size={11} className={cn('transition-transform duration-150', open && 'rotate-180')} />
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 4 }}
						transition={{ duration: 0.15 }}
						className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-lg z-50 py-1"
					>
						{siblings.map(path => (
							<Link
								key={path}
								to={path}
								onClick={() => setOpen(false)}
								className="flex items-center px-4 py-2.5 text-[11px] text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors"
							>
								{CALCULATOR_LABELS[path] ?? path}
							</Link>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

const BackToTop = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 300);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<AnimatePresence>
			{visible && (
				<motion.button
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 8 }}
					transition={{ duration: 0.2 }}
					onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-normal text-black/50 dark:text-white/40 hover:text-[#387E67] dark:hover:text-[#52B788] border border-slate-200 dark:border-white/10 hover:border-[#387E67] dark:hover:border-[#52B788] bg-[#F7F7F4] dark:bg-[#0A0A0A] transition-colors duration-200 cursor-pointer"
					aria-label="Back to top"
				>
					<ArrowUp size={12} />
					<span>Top</span>
				</motion.button>
			)}
		</AnimatePresence>
	);
}

const MoreDropdown = ({ currentPath }: { currentPath: string }) => {
	const [open, setOpen] = useState(false);
	const ref = React.useRef<HTMLDivElement>(null);
	const isActive = MORE_PATHS.includes(currentPath);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
		document.addEventListener('mousedown', handler);
		document.addEventListener('keydown', onKey);
		return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
	}, []);

	return (
		<div ref={ref} className="relative h-12 flex items-center">
			<button
				onClick={() => setOpen(o => !o)}
				aria-haspopup="true"
				aria-expanded={open}
				className={cn(
					'px-4 h-12 flex items-center gap-1.5 text-[11px] font-normal transition-all relative group cursor-pointer',
					isActive ? 'text-black dark:text-white' : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white'
				)}
			>
				More
				<ChevronDown size={11} className={cn('transition-transform duration-150', open && 'rotate-180')} />
				{isActive && (
					<motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#387E67] dark:bg-[#52B788]" />
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 4 }}
						transition={{ duration: 0.15 }}
						className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-lg z-50 py-1"
					>
						{MORE_ITEMS.map((item, i) => {
							if ('divider' in item) {
								return <div key={`div-${i}`} className="my-1 border-t border-slate-100 dark:border-white/5" />;
							}
							const Icon = item.icon;
							const active = currentPath === item.path;
							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={() => setOpen(false)}
									aria-current={active ? 'page' : undefined}
									className={cn(
										'flex items-center gap-3 px-4 py-2.5 text-[11px] transition-colors',
										active
											? 'text-[#387E67] dark:text-[#52B788] bg-slate-50 dark:bg-white/5'
											: 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
									)}
								>
									<Icon size={13} className={active ? 'text-[#387E67] dark:text-[#52B788]' : ''} />
									{item.label}
								</Link>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

const App = () => {
	const location = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(() => {
		if (typeof window !== 'undefined') {
			return (
				localStorage.getItem('theme') === 'dark' ||
				(!localStorage.getItem('theme') &&
					window.matchMedia('(prefers-color-scheme: dark)').matches)
			);
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

	const CALCULATOR_PATHS = ['/salary', '/mortgage', '/debt', '/investing', '/goals', '/bardal', '/time', '/daysbetween', '/weightloss', '/protein', '/calorie', '/careerpath', '/wrongfuldismissal', '/severanceei', '/lowerpayingjob', '/multi', '/categories', '/blog'];

	React.useEffect(() => {
		let styleEl: HTMLStyleElement | null = null;

		const onBefore = () => {
			if (CALCULATOR_PATHS.includes(location.pathname)) {
				styleEl = document.createElement('style');
				styleEl.textContent = '@page { size: A4 landscape; margin: 12mm 14mm; }';
				document.head.appendChild(styleEl);
			}
		};
		const onAfter = () => {
			styleEl?.remove();
			styleEl = null;
		};

		window.addEventListener('beforeprint', onBefore);
		window.addEventListener('afterprint', onAfter);
		return () => {
			window.removeEventListener('beforeprint', onBefore);
			window.removeEventListener('afterprint', onAfter);
			styleEl?.remove();
		};
	}, [location.pathname]);

	const toggleTheme = () => setIsDarkMode(!isDarkMode);

	const handleExport = () => {
		const data: Record<string, string> = {};
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) data[key] = localStorage.getItem(key) || '';
		}
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `whatif-backup-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const data = JSON.parse(event.target?.result as string);
				localStorage.clear();
				Object.entries(data).forEach(([key, value]) => {
					localStorage.setItem(key, value as string);
				});
				window.location.reload();
			} catch (err) {
				console.error('Import error:', err);
				alert('Invalid backup file');
			}
		};
		reader.readAsText(file);
	};

	const [showPurgeModal, setShowPurgeModal] = useState(false);
	const [showExportMenu, setShowExportMenu] = useState(false);

	const handlePurge = () => {
		localStorage.clear();
		setShowPurgeModal(false);
		window.location.reload();
	};

	const BLOG_POST_TITLES = Object.fromEntries(BLOG_POSTS.map(p => [p.href, p.title]));

	const isHome = location.pathname === '/';
	const activeNav = NAV_ITEMS.find((n) => n.path === '/blog' ? location.pathname.startsWith('/blog') : n.path === location.pathname);
	const activeMore = MORE_ITEMS.filter((m): m is MoreNavItem => !('divider' in m)).find(m => m.path === location.pathname);
	const pageTitle = BLOG_POST_TITLES[location.pathname] ?? activeNav?.label ?? activeMore?.label ?? '';

	useEffect(() => {
		const suffix = 'What-If Dashboard';
		document.title = pageTitle ? `${pageTitle} — ${suffix}` : `${suffix} — Free Financial Modeling Tools`;
	}, [pageTitle]);

	return (
		<div className="min-h-screen bg-[#F7F7F4] dark:bg-[#0A0A0A] text-slate-900 dark:text-white font-sans selection:bg-slate-200 dark:selection:bg-white/10 selection:text-slate-900 transition-colors duration-300">
			{/* Skip to content */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:text-sm focus:bg-[#F7F7F4] dark:focus:bg-[#0A0A0A] focus:border focus:border-[#387E67] focus:text-[#387E67] focus:outline-none"
			>
				Skip to content
			</a>

			{/* Desktop header */}
			<header className="sticky top-0 z-40 w-full bg-[#F7F7F4] dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5 hidden lg:block">
				<div className="max-w-6xl mx-auto px-12 h-12 flex items-center justify-between">
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="font-medium tracking-tight text-sm text-black dark:text-white whitespace-nowrap hover:opacity-70 transition-opacity"
						>
							What-If Dashboard
						</Link>
						<nav aria-label="Main navigation" className="flex items-center h-12">
							{NAV_ITEMS.map((item) => {
								const isActive = item.path === '/blog' ? location.pathname.startsWith('/blog') : location.pathname === item.path;
								const Icon = item.icon;
								return (
									<Link
										key={item.path}
										to={item.path}
										aria-current={isActive ? 'page' : undefined}
										className={cn(
											'px-4 h-12 flex items-center gap-2 text-[11px] font-normal transition-all relative group',
											isActive
												? 'text-black dark:text-white'
												: 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white'
										)}
									>
										<Icon
											size={14}
											className={
												isActive
													? 'text-[#387E67] dark:text-[#52B788]'
													: 'text-black/30 dark:text-white/30'
											}
										/>
										{item.label}
										{isActive && (
											<motion.div
												layoutId="activeTabUnderline"
												className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#387E67] dark:bg-[#52B788]"
											/>
										)}
									</Link>
								);
							})}

							<MoreDropdown currentPath={location.pathname} />

							<div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-4" />

							<button
								onClick={toggleTheme}
								className="p-1.5 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
								aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
							>
								{isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
							</button>
						</nav>
					</div>
				</div>
			</header>

			{/* Mobile header */}
			<header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-3 bg-[#F7F7F4] dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
				<Link
					to="/"
					className="font-medium tracking-tight text-sm text-black dark:text-white"
				>
					What-If Dashboard
				</Link>
				<div className="flex items-center gap-2">
					<button
						onClick={toggleTheme}
						className="p-1.5 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors rounded-lg"
						aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						{isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
					</button>
					<button
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
						aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
						aria-expanded={isSidebarOpen}
						aria-controls="mobile-sidebar"
					>
						{isSidebarOpen ? (
							<X size={18} className="dark:text-white" />
						) : (
							<Menu size={18} className="dark:text-white" />
						)}
					</button>
				</div>
			</header>

			<div className="flex flex-col">
				{/* Mobile sidebar */}
				<aside
					id="mobile-sidebar"
					aria-label="Mobile navigation"
					className={cn(
						'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out lg:hidden',
						isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
					)}
				>
					<div className="p-8 h-full overflow-y-auto">
						<div className="mb-12 flex justify-between items-center">
							<Link
								to="/"
								onClick={() => setIsSidebarOpen(false)}
								className="font-medium tracking-tight text-md text-black dark:text-white"
							>
								What-If Dashboard
							</Link>
							<button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400" aria-label="Close navigation menu">
								<X size={18} />
							</button>
						</div>

						<nav className="space-y-1">
							{NAV_ITEMS.map((item) => {
								const Icon = item.icon;
								const isActive = item.path === '/blog' ? location.pathname.startsWith('/blog') : location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										onClick={() => setIsSidebarOpen(false)}
										aria-current={isActive ? 'page' : undefined}
										className={cn(
											'w-full flex items-center gap-3 px-4 py-3 text-sm font-normal transition-all group',
											isActive
												? 'bg-slate-100 dark:bg-white/5 text-black dark:text-white'
												: 'text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
										)}
									>
										<Icon
											size={18}
											className={cn(
												'transition-colors',
												isActive
													? 'text-[#387E67] dark:text-[#52B788]'
													: 'text-slate-400 dark:text-white/30 group-hover:text-black dark:group-hover:text-white'
											)}
										/>
										{item.label}
									</Link>
								);
							})}
						</nav>

						{/* More section in sidebar */}
						<div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
							<p className="px-4 pb-2 text-[9px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/25 font-normal">More</p>
							{MORE_ITEMS.map((item, i) => {
								if ('divider' in item) return <div key={`div-${i}`} className="my-1 mx-4 border-t border-slate-100 dark:border-white/5" />;
								const Icon = item.icon;
								const isActive = location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										onClick={() => setIsSidebarOpen(false)}
										aria-current={isActive ? 'page' : undefined}
										className={cn(
											'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-normal transition-all group',
											isActive
												? 'bg-slate-100 dark:bg-white/5 text-black dark:text-white'
												: 'text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
										)}
									>
										<Icon
											size={16}
											className={cn(
												'transition-colors',
												isActive
													? 'text-[#387E67] dark:text-[#52B788]'
													: 'text-slate-400 dark:text-white/30 group-hover:text-black dark:group-hover:text-white'
											)}
										/>
										{item.label}
									</Link>
								);
							})}
						</div>
					</div>
				</aside>

				{/* Main content */}
				<main id="main-content" className={cn('flex-1 max-w-6xl mx-auto w-full', !isHome && 'p-6 lg:p-12')}>
					{!isHome && (
						<header className="flex justify-between items-end border-b border-slate-200 dark:border-white/5 pb-6 mb-10">
							<h1 id="page-title" className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
								{pageTitle}
							</h1>
							<RelatedCategoryDropdown currentPath={location.pathname} />
						</header>
					)}

					<AnimatePresence mode="wait">
						<motion.div
							key={location.pathname}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
						>
							<React.Suspense fallback={null}>
							<Routes>
								<Route path="/" element={<LandingPage />} />
								<Route path="/salary" element={<SalaryCalculator />} />
								<Route path="/mortgage" element={<MortgageCalculator />} />
								<Route path="/investing" element={<InvestmentCalculator />} />
								<Route path="/goals" element={<GoalsCalculator />} />
								<Route path="/time" element={<TimeCalculator />} />
								<Route path="/bardal" element={<BardalCalculator />} />
								<Route path="/debt" element={<DebtCalculator />} />
								<Route path="/daysbetween" element={<DaysBetweenCalculator />} />
								<Route path="/weightloss" element={<WeightLossCalculator />} />
								<Route path="/protein" element={<ProteinCalculator />} />
								<Route path="/calorie" element={<CalorieDeficitCalculator />} />
								<Route path="/careerpath" element={<CareerPathCalculator />} />
								<Route path="/wrongfuldismissal" element={<WrongfulDismissalCalculator />} />
								<Route path="/severanceei" element={<SeveranceEICalculator />} />
								<Route path="/lowerpayingjob" element={<LowerPayingJobCalculator />} />
								<Route path="/layoffsurvival" element={<LayoffSurvivalCalculator />} />
								<Route path="/emergencyfund" element={<EmergencyFundCalculator />} />
								<Route path="/multi" element={<MultiOptionPage />} />
								<Route path="/categories" element={<CategoriesPage />} />
								<Route path="/blog" element={<BlogPage />} />
								<Route path="/blog/what-your-severance-package-should-really-include" element={<WrongfulDismissalBlogPost />} />
								<Route path="/blog/career-path-projection-job-hopping-vs-staying-put" element={<CareerPathBlogPost />} />
								<Route path="/blog/setting-smart-financial-goals-that-actually-stick" element={<GoalsBlogPost />} />
								<Route path="/blog/master-your-salary-calculator-a-beginners-guide" element={<SalaryBlogPost />} />
								<Route path="/blog/the-debt-repayment-strategy-that-saved-me-10000" element={<DebtBlogPost />} />
								<Route path="/blog/compound-interest-the-eighth-wonder-of-the-world" element={<InvestmentBlogPost />} />
								<Route path="/blog/laid-off-heres-what-youre-actually-owed-in-canada" element={<SeveranceEIBlogPost />} />
							</Routes>
						</React.Suspense>
						</motion.div>
					</AnimatePresence>

					<footer className={cn('pb-12 border-t border-slate-200 dark:border-white/5 pt-8', isHome ? 'mx-6 lg:mx-12 mt-4' : 'mt-20')}>
						<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-black dark:text-slate-500 font-normal">
							<div className="flex items-center gap-6">
								<a
									href="https://github.com/romayneeastmond/whatifdashboard-react-vite-framer-tailwind"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-slate-400 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors"
								>
									<Github size={12} />
									<span>Source Code</span>
								</a>

								<div className="w-px h-3 bg-slate-200 dark:bg-white/10" />

								<div className="flex items-center gap-6">
									<div className="relative">
										<button
											onClick={() => setShowExportMenu(v => !v)}
											className="flex items-center gap-2 text-slate-400 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors cursor-pointer"
										>
											<Download size={12} />
											<span>Export</span>
											<ChevronDown size={10} className={`transition-transform duration-150 ${showExportMenu ? 'rotate-180' : ''}`} />
										</button>
										<AnimatePresence>
											{showExportMenu && (
												<>
													<div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
													<motion.div
														initial={{ opacity: 0, y: 4 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 4 }}
														transition={{ duration: 0.15 }}
														className="absolute bottom-full right-0 mb-1 w-52 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-lg z-20 py-1"
													>
														{([
															{ label: '🗂️  JSON Backup', action: () => { handleExport(); setShowExportMenu(false); } },
															{ label: '📋  Notion (.zip)', action: () => { exportNotion().then(() => setShowExportMenu(false)); } },
															{ label: '💎  Obsidian (.zip)', action: () => { exportObsidian().then(() => setShowExportMenu(false)); } },
															{ label: '🤖  MCP / RAG (.json)', action: () => { exportMcpRag(); setShowExportMenu(false); } },
														] as { label: string; action: () => void }[]).map(({ label, action }) => (
															<button
																key={label}
																onClick={action}
																className="flex items-center w-full text-left px-4 py-2.5 text-[11px] text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
															>
																{label}
															</button>
														))}
													</motion.div>
												</>
											)}
										</AnimatePresence>
									</div>

									<label className="flex items-center gap-2 normal-case text-slate-400 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors cursor-pointer">
										<Upload size={12} />
										<span>Import</span>
										<input type="file" accept=".json" onChange={handleImport} className="hidden" />
									</label>

									<button
										onClick={() => setShowPurgeModal(true)}
										className="flex items-center gap-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
									>
										<Trash2 size={12} />
										<span>Purge</span>
									</button>
								</div>
							</div>
							<div className="flex items-center gap-6">
								{import.meta.env.VITE_SHOW_BMC === 'true' && (
									<>
										<a
											href="https://buymeacoffee.com/placeholder"
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-slate-400 hover:text-[#FFDD00] dark:text-white/30 dark:hover:text-[#FFDD00] transition-colors"
										>
											<Coffee size={12} />
											<span>Buy Me a Coffee</span>
										</a>
										<div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
									</>
								)}
								<p>&copy; 2026 What-If Dashboard</p>
							</div>
						</div>
					</footer>
				</main>
			</div>

			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			<BackToTop />
			<CookieBanner />

			{showPurgeModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-red-200 dark:border-red-900">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950">
								<Trash2 size={20} className="text-red-600 dark:text-red-400" />
							</div>
							<h2 className="text-lg font-semibold text-slate-900 dark:text-white">Purge All Data</h2>
						</div>
						<p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
							This will permanently delete all saved inputs, preferences, and settings stored in your browser. This cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setShowPurgeModal(false)}
								className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handlePurge}
								className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
							>
								Purge Everything
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
