import { useEffect } from 'react';
import type { BlogPostProps } from '../types';

const SITE_NAME = 'What-If Dashboard';
const SITE_URL = import.meta.env.VITE_SITE_URL ?? '';

export const useBlogSeo = (post: BlogPostProps) => {
    useEffect(() => {
        const prev = {
            title: document.title,
            description: getMeta('name', 'description'),
            ogType: getMeta('property', 'og:type'),
            ogTitle: getMeta('property', 'og:title'),
            ogDescription: getMeta('property', 'og:description'),
            ogUrl: getMeta('property', 'og:url'),
            ogImage: getMeta('property', 'og:image'),
            twCard: getMeta('name', 'twitter:card'),
            twTitle: getMeta('name', 'twitter:title'),
            twDescription: getMeta('name', 'twitter:description'),
            twImage: getMeta('name', 'twitter:image'),
        };

        const canonicalUrl = `${SITE_URL}${post.href}`;

        document.title = `${post.title} — ${SITE_NAME}`;
        setMeta('name', 'description', post.excerpt);
        setMeta('property', 'og:type', 'article');
        setMeta('property', 'og:title', post.title);
        setMeta('property', 'og:description', post.excerpt);
        setMeta('property', 'og:url', canonicalUrl);
        if (post.image) setMeta('property', 'og:image', post.image);
        setMeta('name', 'twitter:card', post.image ? 'summary_large_image' : 'summary');
        setMeta('name', 'twitter:title', post.title);
        setMeta('name', 'twitter:description', post.excerpt);
        if (post.image) setMeta('name', 'twitter:image', post.image);

        let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl;

        const ld = buildJsonLd(post, canonicalUrl);
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'blog-post-jsonld';
        script.textContent = JSON.stringify(ld);
        document.head.appendChild(script);

        return () => {
            document.title = prev.title;
            restoreMeta('name', 'description', prev.description);
            restoreMeta('property', 'og:type', prev.ogType);
            restoreMeta('property', 'og:title', prev.ogTitle);
            restoreMeta('property', 'og:description', prev.ogDescription);
            restoreMeta('property', 'og:url', prev.ogUrl);
            restoreMeta('property', 'og:image', prev.ogImage);
            restoreMeta('name', 'twitter:card', prev.twCard);
            restoreMeta('name', 'twitter:title', prev.twTitle);
            restoreMeta('name', 'twitter:description', prev.twDescription);
            restoreMeta('name', 'twitter:image', prev.twImage);
            document.querySelector('link[rel="canonical"]')?.remove();
            document.getElementById('blog-post-jsonld')?.remove();
        };
    }, [post.href]);
};

const getMeta = (attr: string, value: string): string => {
    return document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`)?.content ?? '';
};

const setMeta = (attr: string, value: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, value);
        document.head.appendChild(el);
    }
    el.content = content;
};

const restoreMeta = (attr: string, value: string, content: string) => {
    if (content) {
        setMeta(attr, value, content);
    } else {
        document.querySelector(`meta[${attr}="${value}"]`)?.remove();
    }
};

const buildJsonLd = (post: BlogPostProps, url: string) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    datePublished: post.dateISO,
    author: {
        '@type': 'Person',
        name: post.author ?? SITE_NAME,
    },
    publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: import.meta.env.VITE_SITE_URL ?? '',
    },
    ...(post.image ? { image: post.image } : {}),
});
