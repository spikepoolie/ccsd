import React, { useEffect, useMemo, useRef } from 'react';

export default function SideDrawer({ items, selected, onSelect, className, isOpen, onClose }) {
  const navRef = useRef(null);
  const firstFocusable = useRef(null);
  const lastFocusable = useRef(null);
  const drag = useRef({ startX: 0, startY: 0, dx: 0, dy: 0, dragging: false });

  const clsName = useMemo(() => {
    const base = 'app-drawer';
    const open = isOpen ? ' is-open' : '';
    const extra = className ? ` ${className}` : '';
    return `${base}${open}${extra}`.trim();
  }, [className, isOpen]);

  // Focus the first item when opened on mobile; enable ESC to close; basic focus trap
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Determine focusable elements
    const focusable = nav.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    firstFocusable.current = focusable[0] || null;
    lastFocusable.current = focusable[focusable.length - 1] || null;

    const mq = window.matchMedia('(max-width: 960px)');
    if (isOpen && mq.matches) {
      // Defer to next frame to ensure it's in DOM
      requestAnimationFrame(() => {
        firstFocusable.current?.focus();
      });
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose?.();
        } else if (e.key === 'Tab' && mq.matches) {
          // trap focus within nav
          if (e.shiftKey && document.activeElement === firstFocusable.current) {
            e.preventDefault();
            lastFocusable.current?.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusable.current) {
            e.preventDefault();
            firstFocusable.current?.focus();
          }
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, onClose]);

  // Swipe-to-close on mobile (left drawer): drag left to close
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const mq = window.matchMedia('(max-width: 960px)');
    if (!mq.matches) return;

    const onTouchStart = (e) => {
      if (!isOpen) return;
      const t = e.touches && e.touches[0];
      if (!t) return;
      drag.current = { startX: t.clientX, startY: t.clientY, dx: 0, dy: 0, dragging: true };
      nav.classList.add('is-dragging');
    };
    const onTouchMove = (e) => {
      if (!isOpen || !drag.current.dragging) return;
      const t = e.touches && e.touches[0];
      if (!t) return;
      drag.current.dx = t.clientX - drag.current.startX;
      drag.current.dy = t.clientY - drag.current.startY;
      // Only act if horizontal intent is stronger than vertical
      if (Math.abs(drag.current.dx) < 6 || Math.abs(drag.current.dx) < Math.abs(drag.current.dy)) return;
      // Prevent scroll when horizontally dragging
      e.preventDefault();
      const translate = Math.min(0, drag.current.dx); // clamp to 0..-inf (move left only)
      nav.style.transform = `translateX(${translate}px)`;
    };
    const onTouchEnd = () => {
      if (!isOpen || !drag.current.dragging) return;
      const threshold = -60; // pixels to trigger close
      const dx = drag.current.dx || 0;
      drag.current.dragging = false;
      nav.classList.remove('is-dragging');
      nav.style.transform = '';
      if (dx <= threshold) {
        // Swiped left enough -> close
        onClose?.();
      }
    };

    nav.addEventListener('touchstart', onTouchStart, { passive: false });
    nav.addEventListener('touchmove', onTouchMove, { passive: false });
    nav.addEventListener('touchend', onTouchEnd);
    nav.addEventListener('touchcancel', onTouchEnd);
    return () => {
      nav.removeEventListener('touchstart', onTouchStart);
      nav.removeEventListener('touchmove', onTouchMove);
      nav.removeEventListener('touchend', onTouchEnd);
      nav.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isOpen, onClose]);

  const handleKey = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(key);
    }
  };

  return (
    <nav
      id="drawer"
      ref={navRef}
      aria-label="Primary"
      aria-hidden={!isOpen && window.matchMedia('(max-width: 960px)').matches ? true : undefined}
      className={`${clsName}`}
      style={{ width: 260, minWidth: 220, background: '#112540', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '20px 16px', overflowY: 'auto', boxSizing: 'border-box', color: '#e5e7eb' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 16, margin: '0 8px 12px', color: '#fff' }}>Menu</div>
        {/* Close button visible on mobile via CSS */}
        <button
          type="button"
          className="drawer-close"
          aria-label="Close menu"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
        {items.map((it) => (
          <li key={it.key}>
            <button
              type="button"
              onClick={() => onSelect(it.key)}
              onKeyDown={(e) => handleKey(e, it.key)}
              aria-current={selected === it.key ? 'page' : undefined}
              aria-label={it.label}
              style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontWeight: 600, cursor: 'pointer', borderRadius: 10, padding: '12px 14px', border: '1px solid transparent', color: selected === it.key ? '#fff' : '#e5e7eb', background: selected === it.key ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
