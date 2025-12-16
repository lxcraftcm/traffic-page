import React from "react";

const CommonLoading: React.FC<{
    message?: string;
}> = ({message}) => {
    return <div
        className="absolute flex flex-col inset-0 bg-white/10 dark:bg-slate-800/10 items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
        <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"/>
            <div
                className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin [animation-duration:1.2s] [animation-timing-function:cubic-bezier(0.4,0,0.2,1)]"/>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-70"/>
            </div>
            <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-md"/>
        </div>
        {message && <p className="mt-4 text-gray-600">{message} </p>}
    </div>
}

export default CommonLoading;