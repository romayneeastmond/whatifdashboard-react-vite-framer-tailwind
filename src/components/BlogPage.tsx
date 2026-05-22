
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { BlogPost } from './BlogPost';
import { BLOG_POSTS } from './BlogPosts/registry';
import { cn } from '../lib/utils';

const normalize = (s: string) => s.toLowerCase();

export const BlogPage = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const q = normalize(query.trim());
    const filtered = q
        ? BLOG_POSTS.filter(p =>
            normalize(p.title).includes(q) ||
            normalize(p.excerpt).includes(q) ||
            normalize(p.category).includes(q)
        )
        : null;

    const sorted = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                    placeholder="Search posts…"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:border-[#387E67] dark:focus:border-[#52B788] transition-colors [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />
            </div>

            {/* Filtered results */}
            {filtered !== null && (
                filtered.length === 0
                    ? (
                        <p className="text-sm text-slate-400 dark:text-white/30 py-8 text-center">
                            No posts matching &ldquo;{query}&rdquo;
                        </p>
                    )
                    : (
                        <div className="space-y-3">
                            {filtered.map((post, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(post.href)}
                                    className={cn(
                                        'w-full flex items-center justify-between gap-4 p-4 text-left rounded-lg border border-slate-200 dark:border-white/8',
                                        'bg-white dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-sm transition-all duration-200 group cursor-pointer'
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 mb-1">
                                            {post.category}
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{post.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-white/40 mt-1 line-clamp-1">{post.excerpt}</p>
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

            {/* Default grid */}
            {filtered === null && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map((post, index) => (
                        <BlogPost key={index} {...post} />
                    ))}
                </div>
            )}
        </div>
    );
};
