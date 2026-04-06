import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const VirtualList = ({ items, renderItem, calculateHeight, containerWidth = 384, overscan = 2 }) => {
  const scrollContainerRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Find the scrollable parent
  useEffect(() => {
    let parent = contentRef.current?.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollContainerRef.current = parent;
        break;
      }
      parent = parent.parentElement;
    }

    if (!scrollContainerRef.current) {
      scrollContainerRef.current = window;
    }

    const handleScroll = () => {
      const newScrollTop = scrollContainerRef.current === window 
        ? window.scrollY 
        : scrollContainerRef.current.scrollTop;
      
      // Use requestAnimationFrame for smoother updates
      window.requestAnimationFrame(() => {
        setScrollTop(newScrollTop);
      });
    };

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    const target = scrollContainerRef.current;
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial sync
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate layout using pretext heights
  const { layouts, totalHeight } = useMemo(() => {
    let currentOffset = 0;
    const itemLayouts = items.map((item, index) => {
      const height = calculateHeight(item, containerWidth);
      const layout = {
        index,
        top: currentOffset,
        height,
        bottom: currentOffset + height,
      };
      currentOffset += height;
      return layout;
    });
    return { layouts: itemLayouts, totalHeight: currentOffset };
  }, [items, calculateHeight, containerWidth]);

  // Determine which items are visible
  const visibleItems = useMemo(() => {
    // Increase buffer for smoother fast scrolling
    const buffer = viewportHeight * overscan;
    const start = scrollTop - buffer;
    const end = scrollTop + viewportHeight + buffer;
    
    return layouts.filter(l => l.bottom > start && l.top < end);
  }, [layouts, scrollTop, viewportHeight, overscan]);

  return (
    <div 
      ref={contentRef}
      style={{ 
        height: totalHeight || 'auto', 
        position: 'relative', 
        width: '100%',
        minHeight: '1px' // Prevent collapse
      }}
    >
      {visibleItems.length > 0 ? (
        visibleItems.map(l => (
          <div 
            key={items[l.index].id || l.index} 
            style={{ 
              position: 'absolute', 
              top: l.top, 
              left: 0, 
              right: 0, 
              height: l.height,
              overflow: 'hidden'
            }}
          >
            {renderItem(items[l.index])}
          </div>
        ))
      ) : (
        /* Fallback if no items are visible yet but items exist */
        items.slice(0, 3).map((item, idx) => (
            <div key={item.id || idx} className="opacity-0">
                {renderItem(item)}
            </div>
        ))
      )}
    </div>
  );
};

export default VirtualList;
