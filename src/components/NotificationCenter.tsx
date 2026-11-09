import React from 'react';
import { X, CheckCheck, Bell, Pill, BatteryCharging, Sparkles, Heart } from 'lucide-react';
import { NotificationItem } from '../types/index.js';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (tab: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4 text-[#574665]" />;
      case 'pacing':
        return <BatteryCharging className="w-4 h-4 text-[#574665]" />;
      case 'insight':
        return <Sparkles className="w-4 h-4 text-[#574665]" />;
      default:
        return <Heart className="w-4 h-4 text-[#574665]" />;
    }
  };

  const handleActionClick = (n: NotificationItem) => {
    onMarkAsRead(n.id);
    if (n.actionUrl) {
      const cleanTab = n.actionUrl.replace('/', '');
      onNavigate(cleanTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-[#35313A]/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#FAF8F3] rounded-3xl shadow-2xl border border-[#35313A]/10 mt-12 sm:mt-14 max-h-[85vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#35313A]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#574665]" />
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Notifications & Reminders
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-[#574665] hover:text-[#3E324A] font-medium flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#686270] hover:bg-[#EEE9F7]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#686270]">
              No active notifications right now.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleActionClick(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white/60 border-[#35313A]/5 opacity-80'
                    : 'bg-white border-[#35313A]/10 shadow-xs ring-1 ring-[#574665]/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#EEE9F7] shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[#35313A] truncate">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#574665] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#686270] mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#9B94A4] mt-2">
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.actionUrl && (
                        <>
                          <span>·</span>
                          <span className="text-[#574665] font-medium">Tap to open</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
