import React from 'react';
import './AtomicRingsLoader.css'; // Import the dedicated CSS file

// Helper component to render the ellipse orbits/electrons
const Ellipse = ({ className, cx, cy, rx, ry, stroke, strokeDasharray, strokeWidth }) => (
    <ellipse
        className={className}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
        strokeWidth={strokeWidth}
    />
);

// Define the structure for a single ring
const Ring = ({ rotate, type }) => {
    // Standard orbits for the ring structure
    const Orbits = (
        <>
            <Ellipse className="pl__orbit" cx="64" cy="64" rx="60" ry="30" stroke={`hsla(var(--hue),90%,50%,${type === 'main' ? 0.3 : 0})`} />
            <Ellipse className="pl__orbit" cx="64" cy="64" rx="60" ry="30" stroke="hsla(var(--hue),90%,50%,0.5)" strokeDasharray="50 240" />
            <Ellipse className="pl__orbit" cx="64" cy="64" rx="60" ry="30" stroke="hsl(var(--hue),90%,50%)" strokeDasharray="25 265" />
        </>
    );

    // Electron orbits (simpler dasharray for the moving dots)
    const Electrons = (
        <>
            {[...Array(type === 'electron1' ? 2 : 4)].map((_, i) => (
                <Ellipse 
                    key={i}
                    className="pl__electron" 
                    cx="64" 
                    cy="64" 
                    rx="60" 
                    ry="30" 
                    stroke="hsl(0,0%,100%)" // White electron dots
                    strokeDasharray="1 289" 
                    strokeWidth="8" 
                />
            ))}
        </>
    );

    let content;
    if (type.startsWith('electron')) {
        content = Electrons;
    } else {
        content = Orbits;
    }

    return (
        <g className="pl__ring" transform={`rotate(${rotate})`}>
            {content}
        </g>
    );
};

const AtomicRingsLoader = () => {
    const particleCount = 13; // Number of particles in the nucleus

    return (
        <div className="loader-container">
            <div className="pl">
                <svg className="pl__rings" viewBox="0 0 128 128" width="128px" height="128px">
                    <g fill="none" strokeLinecap="round" strokeWidth="4">
                        {/* Orbit Rings (3 ellipses each) */}
                        <Ring rotate={0} type="main" /> 
                        <Ring rotate={0} type="orbit" />
                        <Ring rotate={0} type="orbit" />
                        <Ring rotate={0} type="orbit" />
                        <Ring rotate={180} type="main" />
                        <Ring rotate={180} type="orbit" />
                        
                        {/* Electron Rings (dots) */}
                        <Ring rotate={0} type="electron1" />
                        <Ring rotate={180} type="electron2" />
                    </g>
                </svg>
                <div className="pl__nucleus">
                    {[...Array(particleCount)].map((_, i) => (
                        <div key={i} className="pl__nucleus-particle"></div>
                    ))}
                </div>
            </div>
            
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default AtomicRingsLoader;