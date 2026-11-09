/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from './components/Navigation.js';
import { DailyCheckInModal } from './components/DailyCheckInModal.js';
import { NotificationCenter } from './components/NotificationCenter.js';
import { HomeView } from './views/HomeView.js';
import { CompanionView } from './views/CompanionView.js';
import { SymptomsView } from './views/SymptomsView.js';
import { InsightsView } from './views/InsightsView.js';
import { MedicationsView } from './views/MedicationsView.js';
import { EnergyView } from './views/EnergyView.js';
import { CommunityView } from './views/CommunityView.js';
import { ReportsView } from './views/ReportsView.js';
import { SettingsView } from './views/SettingsView.js';
import { api } from './services/api.js';
import {
  UserProfile,
  SymptomEntry,
  Medication,
  EnergyEntry,
  ActivityLog,
  HealthInsight,
  CommunityPost,
  NotificationItem
} from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [loading, setLoading] = useState(true);

  // Core Data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Panels
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        ovData,
        profData,
        symData,
        medData,
        nrgData,
        actData,
        insData,
        comData,
        notifData
      ] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getProfile().catch(() => null),
        api.getSymptoms().catch(() => []),
        api.getMedications().catch(() => []),
        api.getEnergyEntries().catch(() => []),
        api.getActivities().catch(() => []),
        api.getInsights().catch(() => []),
        api.getCommunityPosts().catch(() => []),
        api.getNotifications().catch(() => [])
      ]);

      setOverview(ovData);
      setProfile(profData);
      setSymptoms(symData);
      setMedications(medData);
      setEnergyEntries(nrgData);
      setActivities(actData);
      setInsights(insData);
      setCommunityPosts(comData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Error loading Morrow data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigateToCompanionWithPrompt = (prompt?: string) => {
    setActiveTab('companion');
    if (prompt) {
      // Small timeout to allow tab transition, then auto-send
      setTimeout(() => {
        api.sendMessage(prompt).then(() => loadAllData());
      }, 200);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#574665] flex items-center justify-center text-[#FAF8F3] shadow-md animate-pulse mb-4">
          <span className="font-serif text-xl font-bold">M</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-[#35313A]">
          Morrow
        </h2>
        <p className="text-xs text-[#686270] mt-1 font-sans">
          Understand your health. One day at a time.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#35313A] flex flex-col selection:bg-[#DCD5F2]">
      {/* Navigation Shell */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        profile={profile}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-68 xl:pl-72 pt-20 lg:pt-8 pb-20 lg:pb-8 px-4 sm:px-8 max-w-7xl w-full mx-auto">
        {activeTab === 'home' && (
          <HomeView
            overview={overview}
            profile={profile}
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'companion' && (
          <CompanionView
            profile={profile}
            onRefreshData={loadAllData}
          />
        )}

        {activeTab === 'symptoms' && (
          <SymptomsView
            symptoms={symptoms}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            insights={insights}
            onNavigateToCompanion={navigateToCompanionWithPrompt}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationsView
            medications={medications}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'energy' && (
          <EnergyView
            energyEntries={energyEntries}
            activities={activities}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            posts={communityPosts}
            profile={profile}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'reports' && <ReportsView profile={profile} />}

        {activeTab === 'settings' && profile && (
          <SettingsView profile={profile} onRefresh={loadAllData} />
        )}
      </main>

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        initialData={overview?.todayCheckIn}
        onSuccess={() => {
          loadAllData();
        }}
      />

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
