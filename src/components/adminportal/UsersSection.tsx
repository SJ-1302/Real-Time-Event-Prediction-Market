import React from 'react';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AdminUser } from '@/types/user';

interface UsersSectionProps {
  users: AdminUser[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewPortfolio: (user: AdminUser) => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  searchQuery,
  setSearchQuery,
  onViewPortfolio,
}) => {
  return (
    <div>
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            backgroundColor: '#18181b', border: '1px solid #27272a',
            borderRadius: 12, padding: '10px 14px 10px 40px',
            fontSize: 13, color: '#e4e4e7', outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden', backgroundColor: 'rgba(24,24,27,0.6)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 780 }}>
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>

            <thead>
              <tr style={{ borderBottom: '1px solid #27272a', backgroundColor: 'rgba(39,39,42,0.6)' }}>
                {[
                  { label: 'User',             left: true  },
                  { label: 'Total Value',       left: false },
                  { label: 'Active Trades',     left: false },
                  { label: 'Total P&L',         left: false },
                  { label: 'Available Funds',   left: false },
                ].map(({ label, left }) => (
                  <th
                    key={label}
                    style={{
                      padding: '14px 20px',
                      fontSize: 11, fontWeight: 700, color: '#d4d4d8',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      textAlign: left ? 'left' : 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.map((user: AdminUser, idx: number) => {
                const isLast = idx === users.length - 1;
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid rgba(39,39,42,0.7)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(39,39,42,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* User */}
                    <td style={{ padding: '10px 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg,#3b82f6,#7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3 }}>{user.name}</p>
                          <p style={{ fontSize: 11, color: '#71717a', margin: 0, lineHeight: 1.3 }}>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Total Value */}
                    <td style={{ padding: '10px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user.totalValue}</span>
                    </td>

                    {/* Active Trades */}
                    <td style={{ padding: '10px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d8' }}>{user.activeTrades}</span>
                    </td>

                    {/* Total P&L */}
                    <td style={{ padding: '10px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 13, fontWeight: 700,
                        color: user.pnlPositive ? '#4ade80' : '#f87171',
                      }}>
                        {user.pnlPositive
                          ? <ArrowUpRight size={14} />
                          : <ArrowDownRight size={14} />
                        }
                        {user.totalPnL}
                      </span>
                    </td>

                    {/* Available Funds */}
                    <td style={{ padding: '10px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d8' }}>{user.availableFunds}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};