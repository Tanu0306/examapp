import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  BellIcon,
  ServerIcon,
  UserIcon,
  LogOutIcon,
  ShieldAlertIcon,
  ChevronDownIcon,
  CheckIcon,
  LaptopIcon,
} from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import './Header.css';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/questions': 'Question Bank & Authoring',
  '/exams': 'Examination Management',
  '/exams/create': 'Create New Examination',
  '/monitoring': 'Live Laboratory Proctoring',
  '/evaluation': 'Assessment Evaluation',
  '/results': 'Results & Analytics',
  '/students': 'Student Roster & Credentials',
  '/settings': 'System & LAN Settings',
};

export const Header = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Teacher Portal';

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      type: 'violation',
      title: 'Tab Switch Violation Alert',
      desc: 'Candidate CS21B042 (Alex Rivera) lost window focus (2nd warning).',
      time: '2m ago',
      unread: true,
    },
    {
      id: 2,
      type: 'system',
      title: 'LAN Terminal Disconnect',
      desc: 'Terminal #24 in Lab 3 reconnected automatically.',
      time: '8m ago',
      unread: true,
    },
  ];

  return (
    <header className="top-header">
      {/* Left: Page Title & Breadcrumb */}
      <div className="header-left">
        {isSidebarCollapsed && (
          <button
            type="button"
            className="header-expand-btn"
            onClick={onToggleSidebar}
            title="Expand Sidebar"
          >
            <ServerIcon size={16} />
          </button>
        )}
        <div className="header-title-box">
          <h1 className="header-title">{pageTitle}</h1>
          <span className="header-breadcrumb-sub">
            LAN Portal &bull; {user?.activeLab ? user.activeLab.split('(')[0].trim() : 'Lab Node'}
          </span>
        </div>
      </div>

      {/* Middle: Live LAN Network Pill */}
      <div className="header-middle">
        <div className="header-lan-badge" title="Local Area Network High-Speed Channel">
          <span className="header-lan-ping-dot" />
          <span className="header-lan-ip">192.168.1.100</span>
          <span className="header-lan-divider">|</span>
          <span className="header-lan-status">LAN Online (0.8ms)</span>
        </div>
      </div>

      {/* Right: Actions, Search, Notifications, Theme, Profile */}
      <div className="header-right">
        {/* Quick Search */}
        <div className="header-search-wrap">
          <span className="header-search-icon">
            <SearchIcon size={15} />
          </span>
          <input
            type="text"
            placeholder="Search questions, exams, roll numbers... (Cmd+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
        </div>

        {/* Notifications Bell */}
        <div className="header-menu-container" ref={notifRef}>
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            title="Active Alerts & Violations"
          >
            <BellIcon size={18} />
            <span className="header-notif-badge">2</span>
          </button>

          {showNotifications && (
            <div className="header-dropdown-panel notif-dropdown">
              <div className="dropdown-panel-header">
                <span className="dropdown-panel-title">System &amp; Violation Alerts</span>
                <Badge variant="danger" size="sm">2 Unresolved</Badge>
              </div>

              <div className="notif-list">
                {sampleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.unread ? 'unread' : ''}`}
                  >
                    <div className="notif-item-icon">
                      {notif.type === 'violation' ? (
                        <ShieldAlertIcon size={16} color="var(--danger)" />
                      ) : (
                        <LaptopIcon size={16} color="var(--primary)" />
                      )}
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-title-row">
                        <span className="notif-item-title">{notif.title}</span>
                        <span className="notif-item-time">{notif.time}</span>
                      </div>
                      <p className="notif-item-desc">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dropdown-panel-footer">
                <button
                  type="button"
                  className="dropdown-footer-link"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/monitoring');
                  }}
                >
                  View All Live Violations in Monitoring &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="header-menu-container" ref={userRef}>
          <button
            type="button"
            className="header-user-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Profile"
          >
            <div className="header-user-avatar">
              <UserIcon size={15} />
            </div>
            <div className="header-user-text">
              <span className="header-user-name">{user?.name || 'Faculty Member'}</span>
              <span className="header-user-code">{user?.employeeId || 'ID: 204'}</span>
            </div>
            <ChevronDownIcon size={14} color="var(--text-muted)" />
          </button>

          {showUserMenu && (
            <div className="header-dropdown-panel user-dropdown">
              <div className="user-dropdown-info">
                <span className="user-dropdown-name">{user?.name}</span>
                <span className="user-dropdown-email">{user?.email}</span>
                <span className="user-dropdown-dept">{user?.department}</span>
              </div>

              <div className="user-dropdown-lab">
                <span className="user-dropdown-lab-label">Assigned Node:</span>
                <span className="user-dropdown-lab-val">{user?.activeLab}</span>
              </div>

              <div className="user-dropdown-divider" />

              <button
                type="button"
                className="user-dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
              >
                <span>System &amp; Exam Settings</span>
              </button>

              <button
                type="button"
                className="user-dropdown-item text-danger"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                <LogOutIcon size={15} />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
