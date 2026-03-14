import { useEffect, useRef, useState, useCallback } from 'react';
import './CircularGallery.css';

const GAP = 16;

export default function CircularGallery({
  items = [],
  baseWidth = 500,
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [trackX, setTrackX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const autoPlayRef = useRef(null);
  const lastInteractionRef = useRef(0);
  const containerRef = useRef(null);

  const totalItems = items.length;

  // Clamp position within bounds
  const clampPosition = useCallback((pos) => {
    return Math.max(0, Math.min(pos, totalItems - 1));
  }, [totalItems]);

  // Go to a specific index with smooth transition
  const goTo = useCallback((index) => {
    const clamped = clampPosition(index);
    setPosition(clamped);
    setTrackX(-(clamped * trackItemOffset));
  }, [clampPosition, trackItemOffset]);

  // Auto-play — pauses for 3s after any user interaction
  useEffect(() => {
    if (totalItems <= 1) return;

    autoPlayRef.current = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceInteraction < 3000) return; // pause after interaction

      setPosition(prev => {
        const next = (prev + 1) % totalItems;
        setTrackX(-(next * trackItemOffset));
        return next;
      });
    }, 4000);

    return () => clearInterval(autoPlayRef.current);
  }, [totalItems, trackItemOffset]);

  // Sync trackX when position changes from outside (indicator clicks)
  useEffect(() => {
    setTrackX(-(position * trackItemOffset));
  }, [position, trackItemOffset]);

  // Pointer drag handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    lastInteractionRef.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX;
    const baseX = -(position * trackItemOffset);
    setTrackX(baseX + delta);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    lastInteractionRef.current = Date.now();

    const delta = e.clientX - dragStartX;

    if (Math.abs(delta) > 50) {
      const direction = delta < 0 ? 1 : -1;
      const newPos = clampPosition(position + direction);
      setPosition(newPos);
      setTrackX(-(newPos * trackItemOffset));
    } else {
      // Snap back
      setTrackX(-(position * trackItemOffset));
    }
  };

  const activeIndex = position % totalItems;

  if (totalItems === 0) {
    return (
      <div
        className="carousel-container"
        style={{ width: `${baseWidth}px`, height: '400px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8B6914' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="carousel-container"
      style={{
        width: `${baseWidth}px`,
        height: '450px',
        backgroundColor: '#2A1810',
        userSelect: 'none',
        touchAction: 'pan-y',
      }}
    >
      {/* Track */}
      <div
        className="carousel-track"
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          transform: `translateX(${trackX}px)`,
          transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          cursor: isDragging ? 'grabbing' : 'grab',
          willChange: 'transform',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {items.map((item, index) => {
          // Simple offset-based scale/opacity for the 3D-ish feel without rotateY flickering
          const offset = index - position;
          const absOffset = Math.abs(offset);
          const scale = absOffset === 0 ? 1 : Math.max(0.82, 1 - absOffset * 0.08);
          const opacity = absOffset === 0 ? 1 : Math.max(0.45, 1 - absOffset * 0.3);

          return (
            <div
              key={`${item?.id ?? index}-${index}`}
              className="carousel-item"
              style={{
                width: itemWidth,
                height: '100%',
                transform: `scale(${scale})`,
                opacity,
                transition: isDragging
                  ? 'none'
                  : 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease',
                willChange: 'transform, opacity',
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title || ''}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <div className="carousel-item-content" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <div className="carousel-item-title">{item.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="carousel-indicators-container">
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <div
              key={index}
              className={`carousel-indicator ${activeIndex === index ? 'active' : 'inactive'}`}
              style={{
                transform: activeIndex === index ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
              }}
              onClick={() => {
                lastInteractionRef.current = Date.now();
                goTo(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
