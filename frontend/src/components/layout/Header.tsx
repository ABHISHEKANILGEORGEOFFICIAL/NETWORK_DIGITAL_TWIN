import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, RefreshCw, UserCheck, Shield, ChevronDown,
  Radio, Check, Sparkles, Activity, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { api } from '../../services/api';
import { Notification, UserRole } from '../../types';

export const Header: React.FC = () => {
  const { user, quickSwitchUser, logout } = useAuth();
  const { isConnected, isLive, lastUpdate, liveMetrics, refreshData } = useWebSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [timeAgo, setTimeAgo] = useState('just now');

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Time ago ticker for live telemetry indicator
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastUpdate) {
        setTimeAgo('connecting...');
        return;
      }
      const diffSec = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
      if (diffSec <= 2) setTimeAgo('just now');
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate]);

  // Fetch notifications
  useEffect(() => {
    async function loadNotifs() {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      } catch (e) {
        // quiet fallback
      }
    }
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Global search autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    api.getDevices({ search: q }).then((devices) => {
      const formatted = devices.slice(0, 6).map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: `${d.type.toUpperCase()} • ${d.ip_address} • ${d.location}`,
        path: `/devices/${d.id}`,
        type: 'device',
      }));
      setSearchResults(formatted);
    });
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await api.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-surface border-b border-surface-border px-6 flex items-center justify-between flex-shrink-0 z-30">
      {/* Search Input */}
      <div className="relative w-96" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search devices, IPs, interfaces, alerts (Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-slate-900/90 border border-surface-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50 py-1.5 backdrop-blur-md">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Search Results
            </div>
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setShowSearchDropdown(false);
                  setSearchQuery('');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Environment Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROD DIGITAL TWIN</span>
        </div>

        {/* Live Telemetry Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-surface-border text-xs font-mono">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-semibold">LIVE</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{timeAgo}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-amber-400 font-semibold">RECONNECTING</span>
            </>
          )}
          <button
            onClick={() => refreshData()}
            title="Force refresh telemetry"
            className="text-slate-400 hover:text-slate-200 ml-1"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Notification Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 border border-surface-border text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-left transition-colors ${
                        n.is_read ? 'bg-transparent' : 'bg-cyan-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Role Switcher Popover */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg bg-slate-900 border border-surface-border hover:border-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white uppercase">
              {user?.role?.[0] || 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name?.split(' ')?.[0] || 'Administrator'}
              </p>
              <p className="text-[10px] text-cyan-400 uppercase font-medium tracking-wide">
                {user?.role || 'Admin'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50 p-2">
              <div className="px-3 py-2 border-b border-surface-border mb-2">
                <p className="text-xs font-bold text-white">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="space-y-1">
                <p className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Quick Role Switcher
                </p>
                {(['admin', 'engineer', 'viewer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      quickSwitchUser(r);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between capitalize transition-colors ${
                      user?.role === r
                        ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{r === 'admin' ? 'Administrator' : r === 'engineer' ? 'Network Engineer' : 'Viewer (SOC)'}</span>
                    {user?.role === r && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-surface-border">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
