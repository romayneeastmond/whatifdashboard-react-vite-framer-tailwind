import { useLocation } from 'react-router-dom';
import { BlogPost } from './BlogPost';
import { BLOG_POSTS } from './BlogPosts/registry';

export const BlogPostPage = ({ body }: { body: string }) => {
    const { pathname } = useLocation();
    const post = BLOG_POSTS.find(p => p.href === pathname);

    if (!post) return null;

    return <BlogPost {...post} body={body} />;
};
