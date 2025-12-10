import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import PageMeta from "../components/common/PageMeta";
import CalendarMediaModal from "../components/calendar/CalendarMediaModal";
import userService, { User } from "../services/userService";
import mediaService from "../services/mediaService";
import { useAuth } from "../context/AuthContext";

const CalendarMediaPage: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaDate, setMediaDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await userService.listUsers(token ?? null);
        const subs = list.filter((u) => u.role === "subscriber");
        setUsers(subs);
        if (subs.length > 0) setSelectedUserId(subs[0].user_id);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    })();
  }, [token]);

  const handleDateClick = (arg: DateClickArg) => {
    // Require a subscriber to be selected before opening the media modal
    if (!selectedUserId) {
      window.alert('Please select a subscriber first');
      return;
    }
    const dateStr = arg.dateStr.split("T")[0];
    setMediaDate(dateStr);
    setIsMediaOpen(true);
  };

  // helper to build list of dates between start (inclusive) and end (exclusive)
  const buildDateRange = (start: string, end: string) => {
    const res: string[] = [];
    const s = new Date(start);
    const e = new Date(end);
    for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
      res.push(d.toISOString().split("T")[0]);
    }
    return res;
  };

  const fetchMediaForRange = async (startStr: string, endStr: string) => {
    if (!selectedUserId) {
      setEvents([]);
      return;
    }
    const dates = buildDateRange(startStr, endStr);
    // fetch media for each date in parallel
    try {
      const promises = dates.map((d) =>
        mediaService.listMedia(selectedUserId as number, d, token ?? null).then((list) => ({ date: d, count: list.length })).catch(() => ({ date: d, count: 0 }))
      );
      const results = await Promise.all(promises);
      const evts = results
        .filter((r) => r.count > 0)
        .map((r) => {
          const d = new Date(r.date);
          const next = new Date(d);
          next.setDate(d.getDate() + 1);
          const endStr = next.toISOString().split('T')[0];
          return {
            title: `${r.count} items`,
            start: r.date,
            end: endStr,
            // use a visible event so we can render the title text; keep background color for highlight
            backgroundColor: '#f4b339',
            borderColor: '#f4b339',
            textColor: '#000',
            className: 'has-media',
          };
        });
      setEvents(evts);
    } catch (err) {
      console.error('Failed to fetch media for range', err);
      setEvents([]);
    }
  };

  // when selected subscriber changes, refresh events for current view
  useEffect(() => {
    if (!calendarRef.current) return;
    const api = (calendarRef.current as any).getApi();
    const view = api.view;
    const startStr = view.activeStart.toISOString().split('T')[0];
    const endStr = view.activeEnd.toISOString().split('T')[0];
    fetchMediaForRange(startStr, endStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, token]);

  const handleDatesSet = (arg: any) => {
    // arg.startStr and arg.endStr may be ISO strings
    const startStr = arg.startStr.split('T')[0];
    const endStr = arg.endStr.split('T')[0];
    fetchMediaForRange(startStr, endStr);
  };

  return (
    <>
      <PageMeta title="Calendar - Media" description="Calendar page for subscriber media uploads" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Subscriber</label>
            <select
              value={selectedUserId ?? ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="h-10 rounded-md border px-3"
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.user_name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-600">(Click a date to manage media)</div>
        </div>

        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next", center: "title" }}
            dateClick={handleDateClick}
            selectable={true}
            events={events}
            datesSet={handleDatesSet}
            eventContent={(arg: any) => {
              return (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', color: '#000', fontWeight: 300, paddingRight: 6 }}>
                  {arg.event.title}
                </div>
              );
            }}
          />
        </div>

        <CalendarMediaModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          date={mediaDate}
          selectedUserId={selectedUserId}
          selectedUser={users.find((u) => u.user_id === selectedUserId) ?? null}
        />
      </div>
    </>
  );
};

export default CalendarMediaPage;
