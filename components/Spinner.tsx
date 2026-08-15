
import React from 'react';

export const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            <p className="ml-4 text-slate-600 dark:text-slate-400">AI is thinking...</p>
        </div>
    );
};
