import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  QuestionsIcon,
  PlusCircleIcon,
  ExamIcon,
  MonitoringIcon,

  ResultsIcon,
  StudentsIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ServerIcon,
  LogOutIcon,
  UserIcon,
} from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Question Bank', path: '/questions', icon: QuestionsIcon, badge: 'Phase 2' },
  { label: 'Create Exam', path: '/exams/create', icon: PlusCircleIcon, badge: 'New' },
  { label: 'All Examinations', path: '/exams', icon: ExamIcon },
  { label: 'Live Exam Manager', path: '/live-exams', icon: MonitoringIcon, livePulse: true },

  { label: 'Results & Reports', path: '/results', icon: ResultsIcon },
  { label: 'Student Roster', path: '/students', icon: StudentsIcon },
  { label: 'Settings & Lab', path: '/settings', icon: SettingsIcon },
];

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">
            <ServerIcon size={18} color="#ffffff" />
          </span>
          {!isCollapsed && (
            <div className="sidebar-brand-info">
              <span className="sidebar-brand-name">ExamLAN</span>
              <span className="sidebar-brand-edition">TEACHER PORTAL</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand (248px)' : 'Collapse (72px)'}
        >
          {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </button>
      </div>

      {/* Lab Station Indicator */}
      {!isCollapsed && user?.activeLab && (
        <div className="sidebar-lab-tag">
          <span className="sidebar-lab-dot" />
          <span className="sidebar-lab-name" title={user.activeLab}>
            {user.activeLab.split('(')[0].trim()}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="sidebar-nav" aria-label="Main Navigation">
        <ul className="sidebar-menu">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} className="sidebar-item">
                <NavLink
                  to={item.path}
                  className={({ isActive: linkActive }) =>
                    `sidebar-link ${linkActive ? 'active' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="sidebar-icon-wrapper">
                    <Icon size={18} />
                    {item.livePulse && <span className="sidebar-live-dot" />}
                  </span>

                  {!isCollapsed && (
                    <>
                      <span className="sidebar-link-text">{item.label}</span>
                      {item.livePulse && (
                        <span className="sidebar-live-pill">LIVE</span>
                      )}
                      {item.badge && !item.livePulse && (
                        <span className="sidebar-item-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Profile Summary & Log out */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" title={user?.email}>
          <div className="sidebar-avatar">
            <UserIcon size={16} />
          </div>

          {!isCollapsed && (
            <div className="sidebar-user-meta">
              <span className="sidebar-user-name">{user?.name || 'Faculty Member'}</span>
              <span className="sidebar-user-dept">{user?.department ? user.department.split('&')[0] : 'Instructor'}</span>
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={logout}
              title="Sign Out of Teacher Portal"
              aria-label="Sign Out"
            >
              <LogOutIcon size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
