import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DateClickArg } from "@fullcalendar/core";
import PageMeta from "../components/common/PageMeta";
import CalendarMediaModal from "../components/calendar/CalendarMediaModal";
import userService, { User } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const CalendarMediaPage: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaDate, setMediaDate] = useState<string>(new Date().toISOString().split("T")[0]);

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
    const dateStr = arg.dateStr.split("T")[0];
    setMediaDate(dateStr);
    setIsMediaOpen(true);
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
          <div className="text-sm text-gray-600">Click a date to manage media</div>
        </div>

        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
            dateClick={handleDateClick}
            selectable={true}
          />
        </div>

        <CalendarMediaModal isOpen={isMediaOpen} onClose={() => setIsMediaOpen(false)} date={mediaDate} />
      </div>
    </>
  );
};

export default CalendarMediaPage;
