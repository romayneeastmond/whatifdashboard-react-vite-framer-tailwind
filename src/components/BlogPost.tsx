import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BlogPostProps } from '../types';
import { useBlogSeo } from '../hooks/useBlogSeo';

const BlogPostFull = (props: BlogPostProps) => {
	const { title, category, date, body } = props; // title used in breadcrumb
	useBlogSeo(props);
	return (
		<>
			<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/40 mb-6">
				<Link to="/blog" className="hover:text-[#387E67] dark:hover:text-[#52B788] transition-colors">Blog</Link>
				<ChevronRight size={10} className="opacity-50" />
				<span className="text-slate-700 dark:text-white/60">{title}</span>
			</nav>
			<div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-3">
				<span className="text-[#387E67] dark:text-[#52B788]">{category}</span>
				<span>•</span>
				<span>{date}</span>
			</div>
			<article aria-labelledby="page-title" dangerouslySetInnerHTML={{ __html: body! }} />
		</>
	);
};

export const BlogPost = (props: BlogPostProps) => {
	const { title, excerpt, href, body, category, date } = props;
	if (body) {
		return <BlogPostFull {...props} />;
	};

	return (
		<Link
			to={href}
			className="group block rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/3 hover:border-[#387E67] dark:hover:border-[#52B788] hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#387E67] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F4] dark:focus-visible:ring-offset-[#0A0A0A]"
			aria-label={title}
		>
			<div className="p-5">
				<div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-3">
					<span className="text-[#387E67] dark:text-[#52B788]">{category}</span>
					<span>•</span>
					<span>{date}</span>
				</div>
				<h2 className="text-base font-medium text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#387E67] dark:group-hover:text-[#52B788] transition-colors">
					{title}
				</h2>
				<p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed mb-4 line-clamp-2">
					{excerpt}
				</p>
				<span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-white/60 group-hover:text-[#387E67] dark:group-hover:text-[#52B788] transition-colors">
					Read Article
					<ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" />
				</span>
			</div>
		</Link>
	);
};
