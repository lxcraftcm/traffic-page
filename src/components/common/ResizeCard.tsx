import React, {useEffect, useRef, useState} from "react";

interface ResizeCardProps {
    children: any,
    className?: string;
    duration?: number;
}


const ResizeCard = ({children, className = '', duration = 200}: ResizeCardProps) => {
    const contentRef = useRef(null);
    const containerRef = useRef(null);
    const [height, setHeight]: any = useState('auto');

    useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setHeight(entry.contentRect.height);
            }
        });

        observer.observe(contentRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={`transition-all duration-${duration} ease-in-out ${className}`}
            style={{height}}
        >
            <div ref={contentRef}>
                {children}
            </div>
        </div>
    );
};

export default ResizeCard;