
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Wallet, Home, BarChart3, Target, CreditCard,
    Flame, Dumbbell, Utensils,
    Clock, CalendarDays,
    Scale, ShieldAlert, Banknote,
    TrendingUp, TrendingDown, LifeBuoy, ShieldCheck, PiggyBank, Landmark,
    ArrowRight, Search,
} from 'lucide-react';
import { cn } from '../lib/utils';

type Tool = {
    path: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bg: string;
    description: string;
};

type Category = {
    name: string;
    color: string;
    tools: Tool[];
};

const CATEGORIES: Category[] = [
    {
        name: 'Career',
        color: 'text-teal-600 dark:text-teal-400',
        tools: [
            {
                path: '/careerpath',
                label: 'Career Path Projection',
                icon: TrendingUp,
                color: 'text-teal-600 dark:text-teal-400',
                bg: 'bg-teal-50 dark:bg-teal-950/40',
                description: 'Project your salary over 5, 10, or 20 years. Compare staying in your current role with promotions against job-hopping for higher bumps, and see the lifetime earnings difference.',
            },
            {
                path: '/lowerpayingjob',
                label: 'Lower-Paying Job',
                icon: TrendingDown,
                color: 'text-fuchsia-600 dark:text-fuchsia-400',
                bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
                description: 'Compare your current salary against a lower-paying job offer. See the true financial cost of the pay cut including benefits, monthly surplus, and projected 10-year wealth difference.',
            },
            {
                path: '/salary',
                label: 'Salary & Taxes',
                icon: Wallet,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-950/40',
                description: 'Model your take-home pay. Adjust gross salary, tax rate, retirement contribution, and monthly expenses to see exactly what lands in your pocket.',
            },
        ],
    },
    {
        name: 'Finance',
        color: 'text-emerald-600 dark:text-emerald-400',
        tools: [
            {
                path: '/emergencyfund',
                label: 'Emergency Fund Runway',
                icon: ShieldCheck,
                color: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-sky-50 dark:bg-sky-950/40',
                description: 'Find out if your emergency fund is big enough and how long it will take to build one. See your current runway in months, the gap to your target, and how boosting contributions or cutting expenses accelerates your timeline.',
            },
            {
                path: '/fire',
                label: 'FIRE / Retirement Calculator',
                icon: PiggyBank,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-50 dark:bg-green-950/40',
                description: 'Find your FIRE number and see when you can retire. Enter your current savings, monthly contributions, expected return, and retirement expenses to project your portfolio over time and see if you\'re on track.',
            },
            {
                path: '/debt',
                label: 'Debt Repayment',
                icon: CreditCard,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-50 dark:bg-red-950/40',
                description: 'See exactly when you will be debt-free. Enter your balance, interest rate, and monthly payment to visualize the payoff timeline and total interest cost.',
            },
            {
                path: '/goals',
                label: 'Goals Tracking',
                icon: Target,
                color: 'text-rose-600 dark:text-rose-400',
                bg: 'bg-rose-50 dark:bg-rose-950/40',
                description: 'Set financial targets and track progress toward each one. Add goals, log current amounts, and watch your completion percentage grow.',
            },
            {
                path: '/mortgage',
                label: 'Mortgage Equity',
                icon: Home,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-950/40',
                description: 'Run the numbers on a home purchase. Explore how down payment, interest rate, and loan term affect your monthly payment and long-term equity.',
            },
            {
                path: '/investing',
                label: 'Wealth Growth',
                icon: BarChart3,
                color: 'text-violet-600 dark:text-violet-400',
                bg: 'bg-violet-50 dark:bg-violet-950/40',
                description: 'Project your investment portfolio over time. Tweak initial amount, monthly contributions, and expected return rate to visualize compounding growth.',
            },
            {
                path: '/layoffsurvival',
                label: 'Layoff Survival Simulator',
                icon: LifeBuoy,
                color: 'text-orange-600 dark:text-orange-400',
                bg: 'bg-orange-50 dark:bg-orange-950/40',
                description: 'Find out how long your savings and severance will last after a job loss. Model your runway, burn rate, and break-even income — then see how cutting expenses or adding side income extends your timeline.',
            },
            {
                path: '/rrsp-tfsa',
                label: 'RRSP vs TFSA Optimizer',
                icon: Landmark,
                color: 'text-indigo-600 dark:text-indigo-400',
                bg: 'bg-indigo-50 dark:bg-indigo-950/40',
                description: 'Decide whether to prioritize RRSP or TFSA contributions based on your current and expected retirement tax rates. Compares after-tax retirement wealth for each strategy and recommends the better option.',
            },
        ],
    },
    {
        name: 'Fitness',
        color: 'text-orange-600 dark:text-orange-400',
        tools: [
            {
                path: '/calorie',
                label: 'Calorie Deficit Planner',
                icon: Utensils,
                color: 'text-lime-600 dark:text-lime-400',
                bg: 'bg-lime-50 dark:bg-lime-950/40',
                description: 'Plan your calorie deficit strategy. Set a weekly loss goal, split your deficit between diet and exercise, and compare conservative vs aggressive approaches side by side.',
            },
            {
                path: '/protein',
                label: 'Protein Intake',
                icon: Dumbbell,
                color: 'text-orange-600 dark:text-orange-400',
                bg: 'bg-orange-50 dark:bg-orange-950/40',
                description: 'Calculate your recommended daily protein intake based on your age, weight, and activity level. See results in grams and protein powder scoops. Supports lbs and kg.',
            },
            {
                path: '/weightloss',
                label: 'Weight Loss',
                icon: Flame,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-50 dark:bg-red-950/40',
                description: 'Calculate your recommended daily caloric intake, safe calorie deficit, and projected weekly weight loss to reach a target weight. Uses the Mifflin-St Jeor equation. Supports lbs and kg.',
            },
        ],
    },
    {
        name: 'Legal',
        color: 'text-slate-600 dark:text-slate-400',
        tools: [
            {
                path: '/bardal',
                label: 'Bardal Factor',
                icon: Scale,
                color: 'text-slate-600 dark:text-slate-400',
                bg: 'bg-slate-50 dark:bg-slate-900/40',
                description: 'Estimate your reasonable notice period and severance entitlement under Canadian employment law using the Bardal factors: character of employment, length of service, age, and availability of similar work.',
            },
            {
                path: '/wrongfuldismissal',
                label: 'Wrongful Dismissal',
                icon: ShieldAlert,
                color: 'text-rose-700 dark:text-rose-400',
                bg: 'bg-rose-50 dark:bg-rose-950/40',
                description: 'Estimate wrongful dismissal damages. Calculates reasonable notice, bad faith damages, mitigation deductions, a typical settlement range, and net after legal fees.',
            },
            {
                path: '/severanceei',
                label: 'Severance & EI Estimator',
                icon: Banknote,
                color: 'text-cyan-600 dark:text-cyan-400',
                bg: 'bg-cyan-50 dark:bg-cyan-950/40',
                description: 'Estimate your Canadian severance package and Employment Insurance benefits after a job loss. Calculates ESA termination and severance pay by province, EI eligibility, weekly benefit, duration, and your total income runway.',
            },
        ],
    },
    {
        name: 'Productivity',
        color: 'text-amber-600 dark:text-amber-400',
        tools: [
            {
                path: '/daysbetween',
                label: 'Days Between',
                icon: CalendarDays,
                color: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-sky-50 dark:bg-sky-950/40',
                description: 'Calculate the exact number of days, weeks, months, and years between any two dates. Shows both a total and a broken-down remainder for each unit.',
            },
            {
                path: '/time',
                label: 'Time Allocation',
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-950/40',
                description: 'Audit how you spend your 24 hours. Allocate time across sleep, work, fitness, chores, learning, and leisure to find a balance that works for you.',
            },
        ],
    },
];

const ToolCard = ({ tool, delay }: { tool: Tool; delay: number }) => {
    const Icon = tool.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
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

export const CategoriesPage = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    let globalDelay = 0;

    const q = normalize(query.trim());
    const allTools = CATEGORIES.flatMap(cat => cat.tools.map(t => ({ ...t, category: cat.name })));
    const filtered = q
        ? allTools.filter(t =>
            normalize(t.label).includes(q) ||
            normalize(t.description).includes(q) ||
            normalize(t.category).includes(q)
        )
        : null;

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="relative">
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

            {/* Filtered results */}
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
                                    className={cn(
                                        'w-full flex items-center justify-between gap-4 p-4 text-left rounded-lg border border-slate-200 dark:border-white/8',
                                        'bg-white dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-sm transition-all duration-200 group cursor-pointer'
                                    )}
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

            {/* Default category grid */}
            {filtered === null && <div className="space-y-16">
            {[...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                <motion.section
                    key={cat.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: globalDelay * 0.06 }}
                >
                    <h2 className={`text-xs uppercase tracking-[0.2em] font-normal mb-4 ${cat.color}`}>
                        {cat.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...cat.tools].sort((a, b) => a.label.localeCompare(b.label)).map((tool) => {
                            const d = globalDelay++ * 0.06;
                            return <ToolCard key={tool.path} tool={tool} delay={d} />;
                        })}
                    </div>
                </motion.section>
            ))}
        </div>}
        </div>
    );
}
