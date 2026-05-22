
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'cookie_consent';

export const CookieBanner = () => {
    const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    role="dialog"
                    aria-live="polite"
                    aria-label="Cookie notice"
                    className="fixed bottom-16 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-lg p-4 flex items-start gap-4"
                >
                    <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed flex-1">
                        This site uses cookies for limited visitor and usage tracking. No personal data is collected or shared.
                    </p>
                    <button
                        onClick={dismiss}
                        aria-label="Dismiss cookie notice"
                        className="shrink-0 p-1 text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
