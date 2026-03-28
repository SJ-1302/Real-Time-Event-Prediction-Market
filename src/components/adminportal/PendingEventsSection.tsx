import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Edit, X, Plus, Check, Calendar } from 'lucide-react';
import type { PendingEvent } from '@/types/admin';

interface PendingEventsSectionProps {
  events: PendingEvent[];
  onEventUpdate?: (eventId: string, updatedData: Partial<PendingEvent>) => void;
}

const AVAILABLE_SECTORS = [
  "Technology", "Business", "Politics", "Crypto", "Sports", "Finance", "AI/ML", 
  "Health", "Climate", "Entertainment", "Science", "Economics", "Social Media", 
  "Gaming", "Real Estate", "Energy", "Space", "Education", "Transportation", 
  "Food & Beverage", "Fashion", "Automotive", "Defense", "Agriculture", 
  "Biotechnology", "Cybersecurity", "E-commerce", "Media", "Manufacturing",
  "Telecommunications", "Insurance", "Banking", "Retail", "Hospitality",
  "Construction", "Mining", "Pharmaceuticals", "Logistics", "Aviation",
  "Maritime", "Legal", "Consulting", "Marketing", "HR & Recruiting"
];

export const PendingEventsSection: React.FC<PendingEventsSectionProps> = ({ events, onEventUpdate }) => {
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editedEvents, setEditedEvents] = useState<{[key: string]: Partial<PendingEvent>}>({});
  const [updatedEvents, setUpdatedEvents] = useState<{[key: string]: Partial<PendingEvent>}>({});
  const [showSectorDropdown, setShowSectorDropdown] = useState<string | null>(null);
  const [searchSector, setSearchSector] = useState('');
  
  // Selection state
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedEvents(new Set());
    }
  };

  // Select all events
  const handleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map(e => e.id)));
    }
  };

  // Toggle individual event selection
  const toggleEventSelection = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  // Collective approve
  const handleCollectiveApprove = () => {
    if (selectedEvents.size === 0) return;
    
    console.log('Approving events:', Array.from(selectedEvents));
    // Add your collective approve logic here
    
    // Clear selection after approve
    setSelectedEvents(new Set());
    setSelectMode(false);
  };

  // Collective reject
  const handleCollectiveReject = () => {
    if (selectedEvents.size === 0) return;
    
    console.log('Rejecting events:', Array.from(selectedEvents));
    // Add your collective reject logic here
    
    // Clear selection after reject
    setSelectedEvents(new Set());
    setSelectMode(false);
  };

  const handleApprove = (eventId: string) => {
    console.log('Approving event:', eventId);
  };

  const handleReject = (eventId: string) => {
    console.log('Rejecting event:', eventId);
  };

  const handleEdit = (eventId: string) => {
    if (editingEvent === eventId) {
      setEditingEvent(null);
      setShowSectorDropdown(null);
    } else {
      setEditingEvent(eventId);
      if (!editedEvents[eventId]) {
        const event = events.find(e => e.id === eventId);
        const savedData = updatedEvents[eventId];
        if (event) {
          setEditedEvents({
            ...editedEvents,
            [eventId]: {
              question: savedData?.question || event.question,
              category: savedData?.category || [event.category].flat(),
              expirationDate: savedData?.expirationDate || event.expirationDate || '',
            }
          });
        }
      }
    }
  };

  const handleAddSector = (eventId: string, sector: string) => {
    const defaultEvent = events.find(e => e.id === eventId);
    const currentData = editedEvents[eventId] || {
      question: defaultEvent?.question,
      category: [],
      expirationDate: defaultEvent?.expirationDate || '',
    };

    if (Array.isArray(currentData.category) && !currentData.category.includes(sector)) {
      setEditedEvents({
        ...editedEvents,
        [eventId]: {
          ...currentData,
          category: [...(currentData.category as string[]), sector]
        }
      });
    }
    setSearchSector('');
    setShowSectorDropdown(null);
  };

  const handleRemoveSector = (eventId: string, sector: string) => {
    const currentData = editedEvents[eventId];
    if (!currentData) return;
    setEditedEvents({
      ...editedEvents,
      [eventId]: {
        ...currentData,
        category: (currentData.category as string[])?.filter((c: string) => c !== sector)
      }
    });
  };

  const handleSaveChanges = (eventId: string) => {
    const updatedData = editedEvents[eventId];
    console.log('Saving changes for event:', eventId, updatedData);
    
    setUpdatedEvents({
      ...updatedEvents,
      [eventId]: updatedData
    });
    
    if (onEventUpdate) {
      onEventUpdate(eventId, updatedData);
    }
    
    setEditingEvent(null);
    setShowSectorDropdown(null);
  };

  const handleQuestionChange = (eventId: string, value: string) => {
    const currentData = editedEvents[eventId];
    setEditedEvents({
      ...editedEvents,
      [eventId]: {
        ...currentData,
        question: value
      }
    });
  };

  const handleExpirationDateChange = (eventId: string, value: string) => {
    const currentData = editedEvents[eventId];
    setEditedEvents({
      ...editedEvents,
      [eventId]: {
        ...currentData,
        expirationDate: value
      }
    });
  };

  const ensureArray = (val: any): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const getEventCategories = (event: PendingEvent): string[] => {
    if (updatedEvents[event.id] && updatedEvents[event.id]?.category) {
      return ensureArray(updatedEvents[event.id]?.category);
    }
    if (editingEvent === event.id && editedEvents[event.id]) {
      return ensureArray(editedEvents[event.id]?.category);
    }
    return ensureArray(event.category);
  };
  
  const getEventQuestion = (event: PendingEvent) => {
    if (updatedEvents[event.id]) {
      return updatedEvents[event.id]?.question;
    }
    return event.question;
  };

  const getEventExpirationDate = (event: PendingEvent) => {
    if (updatedEvents[event.id]) {
      return updatedEvents[event.id]?.expirationDate;
    }
    return event.expirationDate || '';
  };

  const filteredSectors = AVAILABLE_SECTORS.filter(sector =>
    sector.toLowerCase().includes(searchSector.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {/* Header with Customize Select Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectMode}
            className={`p-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              selectMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {selectMode ? 'Cancel' : 'SELECT'}
          </button>
          
          {selectMode && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selectedEvents.size === events.length 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-zinc-600'
              }`}>
                {selectedEvents.size === events.length && <Check size={12} className="text-white" />}
              </div>
              Select All ({events.length})
            </button>
          )}
        </div>

        {/* Action Buttons - Only show when events are selected */}
        {selectMode && selectedEvents.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400 mr-2">
              {selectedEvents.size} selected
            </span>
            <button
              onClick={handleCollectiveApprove}
              className="flex items-center gap-2 p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <CheckCircle size={16} />
              Approve ({selectedEvents.size})
            </button>
            <button
              onClick={handleCollectiveReject}
              className="flex items-center gap-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <XCircle size={16} />
              Reject ({selectedEvents.size})
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      {events.map((event: PendingEvent) => {
        const categories = getEventCategories(event);
        const question = getEventQuestion(event);
        const expirationDate = getEventExpirationDate(event);
        const isSelected = selectedEvents.has(event.id);
        
        return (
          <div key={event.id} className="flex items-start gap-3" style={{ position: 'relative' }}>
            {/* Selection Checkbox - Visible in select mode */}
            {selectMode && (
              <div 
                className="flex-shrink-0" 
                style={{ 
                  paddingTop: '12px',
                  minWidth: '32px'
                }}
              >
                <div
                  onClick={() => {
                    console.log('Checkbox clicked for event:', event.id);
                    toggleEventSelection(event.id);
                  }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#71717a'}`,
                    backgroundColor: isSelected ? '#3b82f6' : '#27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#71717a';
                    }
                  }}
                >
                  {isSelected && <Check size={14} style={{ color: 'white', strokeWidth: 3 }} />}
                </div>
              </div>
            )}

            {/* Event Card - Reduced padding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex-1 bg-zinc-900 border rounded-xl p-3 transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-white mb-1.5">{question}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((category: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded border border-blue-500/20"
                      >
                        {category}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded border border-green-500/20 flex items-center gap-1">
                      Initial Probability: 50%
                    </span>
                    {expirationDate && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-bold rounded border border-purple-500/20 flex items-center gap-1">
                        <Calendar size={11} />
                        Expires: {formatDate(expirationDate)}, 23:59
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Only show when NOT in select mode */}
                {!selectMode && (
                  <div className="flex items-center gap-1.5 ml-3">
                    <button
                      onClick={() => handleEdit(event.id)}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="p-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors cursor-pointer"
                      title="Approve"
                    >
                      <CheckCircle size={15} />
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Reject"
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Edit Mode Panel */}
              {editingEvent === event.id && !selectMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-zinc-800 space-y-2.5"
                >
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Edit Question</label>
                    <input
                      type="text"
                      value={editedEvents[event.id]?.question || event.question}
                      onChange={(e) => handleQuestionChange(event.id, e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-text"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1.5 block">Categories / Sectors</label>
                      
                      {/* Selected Categories with inline Add button */}
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(editedEvents[event.id]?.category) && (editedEvents[event.id]?.category as string[]).map((category: string, idx: number) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded border border-blue-500/20 flex items-center gap-1"
                          >
                            {category}
                            <button
                              onClick={() => handleRemoveSector(event.id, category)}
                              className="hover:text-blue-300 cursor-pointer"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                        
                        {/* Small Add Sector Button inline with categories */}
                        <div className="relative">
                          <button
                            onClick={() => setShowSectorDropdown(showSectorDropdown === event.id ? null : event.id)}
                            className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400 hover:text-white hover:border-blue-500 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus size={11} /> Add
                          </button>

                          {showSectorDropdown === event.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute z-50 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl w-64"
                              style={{ left: 0, top: '100%' }}
                            >
                              {/* Search Input */}
                              <div className="p-2 border-b border-zinc-700">
                                <input
                                  type="text"
                                  placeholder="Search sectors..."
                                  value={searchSector}
                                  onChange={(e) => setSearchSector(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-text"
                                  autoFocus
                                />
                              </div>
                              
                              {/* Sector List */}
                              <div className="max-h-48 overflow-y-auto">
                                {filteredSectors.map((sector) => (
                                  <button
                                    key={sector}
                                    onClick={() => handleAddSector(event.id, sector)}
                                    disabled={Array.isArray(editedEvents[event.id]?.category) && (editedEvents[event.id]?.category as string[]).includes(sector)}
                                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors cursor-pointer ${
                                      Array.isArray(editedEvents[event.id]?.category) && (editedEvents[event.id]?.category as string[]).includes(sector)
                                        ? 'text-zinc-600 cursor-not-allowed'
                                        : 'text-zinc-300'
                                    }`}
                                  >
                                    {sector}
                                    {Array.isArray(editedEvents[event.id]?.category) && (editedEvents[event.id]?.category as string[]).includes(sector) && (
                                      <span className="ml-2 text-green-500">✓</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1">
                        <Calendar size={11} />
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        value={editedEvents[event.id]?.expirationDate || event.expirationDate || ''}
                        onChange={(e) => handleExpirationDateChange(event.id, e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      />
                      <p className="text-xs text-zinc-600 mt-1">Time set to 23:59 by default</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => handleSaveChanges(event.id)}
                      className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => handleEdit(event.id)}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};