import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, X, Check, CheckCheck, 
  Info, CheckCircle2, AlertTriangle, AlertCircle,
  Clock, Trash2
} from 'lucide-react';
import { NotificationType } from '../contexts/NotificationContext';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return AlertCircle;
    default:
      return Info;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'warning':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'error':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-blue-50 text-blue-600 border-blue-200';
  }
};

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-[#64748B] hover:bg-slate-50 rounded-2xl transition-all group"
      >
        <Bell 
          size={22} 
          className={`group-hover:rotate-12 transition-transform ${unreadCount > 0 ? 'text-[#E63946]' : ''}`} 
        />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#E63946] rounded-full border-2 border-white shadow-sm shadow-red-200 animate-pulse"></span>
        )}
        {unreadCount > 0 && unreadCount < 100 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-[#E63946] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 max-h-[600px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between bg-white sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFEBEE] rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-[#E63946]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0F172A]">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] font-bold text-[#64748B]">{unreadCount} unread</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} className="text-[#64748B]" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={16} className="text-[#64748B]" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {recentNotifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell size={32} className="mx-auto text-[#CBD5E1] mb-3" />
                <p className="text-sm font-black text-[#64748B] mb-1">No notifications</p>
                <p className="text-xs text-[#94A3B8]">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {recentNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-6 py-4 hover:bg-[#F8F9FA] transition-colors cursor-pointer group ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 ${colorClass}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-black ${!notification.read ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#E63946] rounded-full flex-shrink-0 mt-1.5"></div>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
                              <Clock size={12} />
                              <span>{formatTime(notification.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-lg transition-all"
                                  title="Mark as read"
                                >
                                  <Check size={14} className="text-[#64748B]" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-lg transition-all"
                                title="Remove"
                              >
                                <X size={14} className="text-[#64748B]" />
                              </button>
                            </div>
                          </div>
                          {notification.actionLabel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="mt-2 text-[10px] font-black text-[#E63946] uppercase tracking-wider hover:underline"
                            >
                              {notification.actionLabel} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-6 py-3 border-t border-[#F1F5F9] bg-[#F8F9FA]">
              <p className="text-[10px] font-bold text-[#94A3B8] text-center">
                Showing {recentNotifications.length} of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

