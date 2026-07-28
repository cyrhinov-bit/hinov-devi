import React from 'react';
import { Menu, Search, Bell, Settings, MoreVertical } from 'lucide-react';
import './Topbar.css';

export function Topbar() {
  return (
    <nav className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-toggle">
          <Menu />
        </button>
        <span className="brand-name">HINOV DEVIS</span>
      </div>
      
      <div className="topbar-right">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="START TYPING..." />
        </div>
        
        <button className="icon-button notification-btn">
          <Bell />
          <span className="badge">7</span>
        </button>
        
        <button className="icon-button">
          <Settings />
        </button>
        
        <button className="icon-button">
          <MoreVertical />
        </button>
      </div>
    </nav>
  );
}
