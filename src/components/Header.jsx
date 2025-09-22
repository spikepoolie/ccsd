import React from 'react';

export default function Header({ logoSrc, title, onMenuToggle, isMenuOpen }) {
  return (
    <header role="banner" aria-label="Site header">
      <div>
        {/* Menu toggle for mobile (made visible via CSS) */}
        <button
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="drawer"
          aria-expanded={!!isMenuOpen}
          onClick={onMenuToggle}
          className="menu-toggle"
        >
          {isMenuOpen ? '×' : '☰'}
        </button>
        <a href="#main" className="skip-link">Skip to content</a>
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Contra Costa County Sheriff"
            style={{ width: 36, height: 36, objectFit: 'contain' }}
          />
        )}
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{title}</div>
      </div>
    </header>
  );
}
