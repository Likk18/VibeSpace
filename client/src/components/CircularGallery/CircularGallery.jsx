import { useRef, useEffect, useState, useCallback } from 'react';
import './CircularGallery.css';

const CircularGallery = ({ items = [], bend = 1, textColor = '#ffffff', borderRadius = 0.05, scrollSpeed = 2, scrollEase = 0.05 }) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const posRef = useRef({ current: 0, target: 0, startX: 0, startScroll: 0 });

    // Auto-scroll
    useEffect(() => {
        let raf;
        let autoDir = -1;

        const animate = () => {
            const pos = posRef.current;
            if (!isDragging) {
                pos.target += autoDir * 0.5 * scrollSpeed;
            }
            pos.current += (pos.target - pos.current) * scrollEase;

            if (trackRef.current) {
                // wrap around
                const trackWidth = trackRef.current.scrollWidth / 2;
                if (Math.abs(pos.current) > trackWidth) {
                    pos.current %= trackWidth;
                    pos.target %= trackWidth;
                }
                trackRef.current.style.transform = `translateX(${pos.current}px)`;
            }
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [isDragging, scrollSpeed, scrollEase]);

    const handlePointerDown = useCallback((e) => {
        setIsDragging(true);
        posRef.current.startX = e.clientX;
        posRef.current.startScroll = posRef.current.target;
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging) return;
        const diff = (e.clientX - posRef.current.startX) * 1.5;
        posRef.current.target = posRef.current.startScroll + diff;
    }, [isDragging]);

    const handlePointerUp = useCallback(() => setIsDragging(false), []);

    // Double the items for infinite looping
    const doubled = [...items, ...items];

    const sizes = [180, 140, 200, 160, 150, 190, 170]; // varied sizes

    return (
        <div
            ref={containerRef}
            className="circular-gallery"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <div ref={trackRef} className="circular-gallery-track" style={{ alignItems: 'center', gap: '20px', paddingLeft: '20px' }}>
                {doubled.map((item, i) => {
                    const size = sizes[i % sizes.length];
                    const yOffset = Math.sin((i * Math.PI) / 3.5) * 40 * bend;
                    return (
                        <div
                            key={i}
                            className="circular-gallery-item"
                            style={{
                                width: size,
                                height: size,
                                borderRadius: `${borderRadius * 100}%`,
                                transform: `translateY(${yOffset}px)`,
                            }}
                        >
                            <img src={item.image} alt={item.title || ''} draggable={false} />
                            {item.title && (
                                <div className="label" style={{ color: textColor }}>
                                    {item.title}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CircularGallery;
