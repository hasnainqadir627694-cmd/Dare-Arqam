import React, { useState, useEffect } from 'react';
import { PageId, AcademicEvent } from '../types';
import { EVENTS_DATA } from '../data/mockData';
import { fetchEvents, subscribeEvents } from '../services/firebaseService';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EventsViewProps {
  initialTab?: 'upcoming' | 'previous';
  onNavigate: (page: PageId) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ initialTab = 'upcoming', onNavigate }) => {
  const [events, setEvents] = useState<AcademicEvent[]>(EVENTS_DATA);
  const [filter, setFilter] = useState<'upcoming' | 'previous' | 'all'>('all');

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        if (data && data.length > 0) setEvents(data);
      })
      .catch(() => {});

    const unsubscribe = subscribeEvents((data) => {
      if (data && data.length > 0) setEvents(data);
    });

    return () => unsubscribe();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filter === 'upcoming') return e.isUpcoming;
    if (filter === 'previous') return !e.isUpcoming;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-[#CBD5E1]">
        <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
          Calendar of Institutional Life
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
          Institutional Events & Ceremonies
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
          Official schedule of academic assessments, science exhibitions, sports olympiads, and annual convocations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#EEF2F8] rounded-md max-w-xs border border-[#CBD5E1]">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#20216B] text-white font-semibold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035]'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
            filter === 'upcoming'
              ? 'bg-[#20216B] text-white font-semibold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035]'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('previous')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
            filter === 'previous'
              ? 'bg-[#20216B] text-white font-semibold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035]'
          }`}
        >
          Previous
        </button>
      </div>

      {/* Events Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-6 space-y-4 hover:border-[#292A86] transition-colors shadow-2xs"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-16 bg-[#20216B] text-white rounded-md flex flex-col items-center justify-center shrink-0 text-center shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFF000]">
                  {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-xl font-bold font-mono">
                  {new Date(evt.date).getDate()}
                </span>
                <span className="text-[9px] text-stone-300">
                  {new Date(evt.date).getFullYear()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="font-semibold text-[#20216B]">{evt.category}</span>
                  <span>·</span>
                  <span className={evt.isUpcoming ? 'text-amber-800 font-semibold' : 'text-[#475569]'}>
                    {evt.isUpcoming ? 'Upcoming Official Event' : 'Concluded'}
                  </span>
                </div>
                <h3 className="font-editorial text-base sm:text-lg font-bold text-[#0F1035] leading-snug">
                  {evt.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#334155] font-prose-serif leading-relaxed">
              {evt.description}
            </p>

            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-[#475569] gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{evt.time}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{evt.venue}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
