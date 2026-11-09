import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Activity,
  Compass,
  Pill,
  BatteryCharging,
  Users,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  PlusCircle,
  Heart
} from 'lucide-react';
import { UserProfile } from '../types/index.js';

export type NavTab =
  | 'home'
  | 'companion'
  | 'symptoms'
  | 'insights'
  | 'medications'
  | 'energy'
  | 'community'
  | 'reports'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCheckIn: () => void;
  profile: UserProfile | null;
  unreadCount: number;
  onOpenNotifications: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenCheckIn,
  profile,
  unreadCount,
  onOpenNotifications
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'companion' as NavTab, label: 'AI Companion', icon: Sparkles, badge: 'AI' },
    { id: 'symptoms' as NavTab, label: 'My Health', icon: Activity },
    { id: 'insights' as NavTab, label: 'Insights', icon: Compass },
    { id: 'medications' as NavTab, label: 'Medications', icon: Pill },
    { id: 'energy' as NavTab, label: 'Energy & Pacing', icon: BatteryCharging },
    { id: 'community' as NavTab, label: 'Community', icon: Users },
    { id: 'reports' as NavTab, label: 'Doctor Reports', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  const handleMobileNav = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-68 xl:w-72 fixed inset-y-0 left-0 bg-[#FAF8F3] border-r border-[#35313A]/10 z-30 select-none">
        {/* Brand Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onTabChange('home')}
              className="text-left group focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#574665] flex items-center justify-center text-[#FAF8F3] shadow-sm">
                  <Heart className="w-4 h-4 fill-[#FAF8F3]" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#35313A] leading-none">
                    Morrow
                  </h1>
                </div>
              </div>
              <p className="text-[11px] font-sans text-[#686270] mt-1.5 tracking-wide">
                Understand your health.
              </p>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-[#574665] hover:bg-[#EEE9F7] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#574665]"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#574665] ring-2 ring-[#FAF8F3]" />
              )}
            </button>
          </div>

          {/* Quick Check-in Button */}
          <button
            onClick={onOpenCheckIn}
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-[#3E324A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#574665]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Daily Check-in</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EEE9F7] text-[#574665] font-semibold shadow-xs'
                    : 'text-[#686270] hover:text-[#35313A] hover:bg-[#FAF8F3]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#574665]' : 'text-[#9B94A4]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold text-[#574665] px-1.5 py-0.5 rounded-md bg-[#DCD5F2]/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        {profile && (
          <div className="p-4 border-t border-[#35313A]/10 bg-[#FAF8F3]/80">
            <button
              onClick={() => onTabChange('settings')}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#EEE9F7]/70 transition-colors text-left"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#DCD5F2]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#35313A] truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-[#686270] truncate">
                  {profile.conditions[0] || 'Health tracking'}
                </p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#35313A]/10 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#574665] flex items-center justify-center text-[#FAF8F3]">
            <Heart className="w-3.5 h-3.5 fill-[#FAF8F3]" />
          </div>
          <span className="font-serif text-xl font-semibold text-[#35313A]">
            Morrow
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCheckIn}
            className="py-1.5 px-3 rounded-lg bg-[#574665] text-[#FAF8F3] text-xs font-medium flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Check-in</span>
          </button>
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-[#574665] hover:bg-[#EEE9F7]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#574665]" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-[#574665] hover:bg-[#EEE9F7]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[#FAF8F3] border-t border-[#35313A]/10 px-2 flex items-center justify-around z-30">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === 'home' ? 'text-[#574665] font-semibold' : 'text-[#686270]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onTabChange('companion')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === 'companion' ? 'text-[#574665] font-semibold' : 'text-[#686270]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>AI</span>
        </button>
        <button
          onClick={() => onTabChange('symptoms')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === 'symptoms' ? 'text-[#574665] font-semibold' : 'text-[#686270]'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span>Symptoms</span>
        </button>
        <button
          onClick={() => onTabChange('medications')}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            activeTab === 'medications' ? 'text-[#574665] font-semibold' : 'text-[#686270]'
          }`}
        >
          <Pill className="w-5 h-5 mb-0.5" />
          <span>Meds</span>
        </button>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center py-1 px-3 text-xs ${
            ['insights', 'energy', 'community', 'reports', 'settings'].includes(activeTab)
              ? 'text-[#574665] font-semibold'
              : 'text-[#686270]'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile Drawer Slide-over */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#35313A]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-[#FAF8F3] shadow-xl flex flex-col p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#35313A]/10">
              <span className="font-serif text-lg font-semibold text-[#35313A]">
                Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#686270] hover:bg-[#EEE9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNav(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-[#EEE9F7] text-[#574665] font-semibold'
                        : 'text-[#686270] hover:bg-[#EEE9F7]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {profile && (
              <div className="pt-4 border-t border-[#35313A]/10">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#35313A]">
                      {profile.name}
                    </p>
                    <p className="text-xs text-[#686270]">{profile.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
