import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import './CircularGallery.css';

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ item, index, itemWidth, round, trackItemOffset, x, transition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`carousel-item ${round ? 'round' : ''}`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : '100%',
        rotateY: rotateY,
        ...(round && { borderRadius: '50%' })
      }}
      transition={transition}
    >
      <div className={`carousel-item-header ${round ? 'round' : ''}`}>
        {item.image && (
          <img 
            src={item.image} 
            alt={item.title || ''} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: round ? '50%' : '8px' }} 
            draggable={false}
          />
        )}
      </div>
      <div className="carousel-item-content">
        <div className="carousel-item-title">{item.title}</div>
      </div>
    </motion.div>
  );
}

export default function CircularGallery({
  items = [],
  baseWidth = 500,
  bend = 1,
  textColor = '#ffffff',
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  
  const itemsForRender = useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items];
  }, [items]);

  const [position, setPosition] = useState(0);
  const x = useMotionValue(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (itemsForRender.length <= 1) return;
    
    const interval = setInterval(() => {
      setPosition(prev => {
        const next = prev + 1;
        if (next >= itemsForRender.length) {
          return 0;
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [itemsForRender.length]);

  useEffect(() => {
    x.set(-position * trackItemOffset);
  }, [position, trackItemOffset, x]);

  const effectiveTransition = SPRING_OPTIONS;

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    setPosition(prev => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const activeIndex = items.length === 0 ? 0 : position % items.length;

  if (items.length === 0) {
    return (
      <div className="carousel-container" style={{ width: `${baseWidth}px`, height: '400px' }}>
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
        backgroundColor: '#2A1810'
      }}
    >
      <motion.div
        className="carousel-track"
        drag="x"
        dragConstraints={{ left: -trackItemOffset * (itemsForRender.length - 1), right: 0 }}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={false}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>
      <div className="carousel-indicators-container">
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`carousel-indicator ${activeIndex === index ? 'active' : 'inactive'}`}
              animate={{
                scale: activeIndex === index ? 1.2 : 1
              }}
              onClick={() => setPosition(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
