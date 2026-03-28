import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';

import { TabButton } from './TabButton';
import { PendingEventsSection } from './PendingEventsSection';
import { ActiveEventsSection } from './ActiveEventsSection';
import { UsersSection } from './UsersSection';
import type { AdminPortalData, ActiveEventAdmin } from '@/types/admin';
import type { AdminUser } from '@/types/user';
import type { MarketEvent } from '@/types/market';

interface AdminPortalViewProps {
  data: AdminPortalData;
  allEvents: MarketEvent[];
  allUsers: AdminUser[];
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ data, allEvents, allUsers }) => {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'active' | 'users'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  if (!data) return null;

  const activeEvents = data.activeEvents ?? allEvents;

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex justify-center items-center" style={{ marginBottom: '50px' }}>
        <h1 className="text-8xl font-black text-white uppercase" style={{ fontSize: '4.5rem', fontWeight: '900', textAlign: 'center' }}>
          ADMIN PORTAL
        </h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-zinc-800">
        <TabButton 
          active={selectedTab === 'pending'} 
          onClick={() => setSelectedTab('pending')}
          count={data.pendingEvents.length}
        >
          Pending Events
        </TabButton>
        <TabButton 
          active={selectedTab === 'active'} 
          onClick={() => setSelectedTab('active')}
          count={activeEvents.length}
        >
          Active Events
        </TabButton>
        <TabButton 
          active={selectedTab === 'users'} 
          onClick={() => setSelectedTab('users')}
          count={allUsers.length}
        >
          User Information
        </TabButton>
      </div>

      <div className="mb-8">
        {selectedTab === 'pending' && <PendingEventsSection events={data.pendingEvents} />}
        {selectedTab === 'active' && <ActiveEventsSection events={activeEvents} />}
        {selectedTab === 'users' && (
          <UsersSection 
            users={filteredUsers} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onViewPortfolio={setSelectedUser}
          />
        )}
      </div>
    </div>
  );
};