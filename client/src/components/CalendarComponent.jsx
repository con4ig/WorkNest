import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const locales = {
    pl: pl,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const viewButtons = {
    month: 'Month',
    week: 'Week',
    agenda: 'Agenda',
};

const CustomToolbar = ({ date, onNavigate, onView, view, views }) => {
    const goToBack = () => {
        onNavigate('PREV');
    };

    const goToNext = () => {
        onNavigate('NEXT');
    };

    const goToCurrent = () => {
        onNavigate('TODAY');
    };

    const label = () => {
        return format(date, 'MMMM yyyy', { locale: pl });
    };

    return (
        <div className="mb-8 flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
            {/* Left: Navigation and Title */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-black/5 p-1 shadow-inner dark:border-white/10 dark:bg-white/5">
                    <button
                        type="button"
                        onClick={goToBack}
                        className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-black/10 hover:text-black active:scale-95 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={goToCurrent}
                        className="rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-black/10 hover:text-black active:scale-95 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={goToNext}
                        className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-black/10 hover:text-black active:scale-95 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
                <h2 className="text-2xl font-black capitalize tracking-tighter text-zinc-900 dark:text-white">
                    {label()}
                </h2>
            </div>

            {/* Right: View Switcher */}
            {views.length > 1 && (
                <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-black/5 p-1 shadow-inner dark:border-white/10 dark:bg-white/5">
                    {views.map((viewName) => (
                        <button
                            type="button"
                            key={viewName}
                            onClick={() => onView(viewName)}
                            className={clsx(
                                'rounded-lg px-5 py-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95',
                                view === viewName
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                    : 'text-zinc-500 hover:bg-black/10 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-200',
                            )}
                        >
                            {viewButtons[viewName]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomEvent = ({ event, continuesPrior }) => {
    if (continuesPrior) return <div className="h-8" />;

    const initials =
        event.resource.user?.username?.charAt(0).toUpperCase() || '?';
    const status = event.resource.status;

    return (
        <div className="group flex h-full items-center gap-2 overflow-hidden pl-2">
            <div
                className={clsx(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-white/10 text-[10px] font-black shadow-sm transition-transform group-hover:scale-110',
                    status === 'pending'
                        ? 'bg-amber-500/20 text-amber-500'
                        : status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-rose-500/20 text-rose-500',
                )}
            >
                {initials}
            </div>
            <div className="truncate text-[11px] font-bold tracking-tight text-zinc-900 dark:text-white">
                {event.resource.user?.username}
            </div>
        </div>
    );
};

const eventStyleGetter = (event) => {
    const status = event.resource.status;
    let borderColor = 'rgba(255,255,255,0.1)';
    let backgroundColor = 'rgba(255,255,255,0.05)';

    if (status === 'pending') {
        backgroundColor = 'var(--calendar-event-pending-bg)';
        borderColor = 'var(--calendar-event-pending-border)';
    } else if (status === 'approved') {
        backgroundColor = 'var(--calendar-event-approved-bg)';
        borderColor = 'var(--calendar-event-approved-border)';
    } else if (status === 'rejected') {
        backgroundColor = 'var(--calendar-event-rejected-bg)';
        borderColor = 'var(--calendar-event-rejected-border)';
    }

    return {
        style: {
            backgroundColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '6px',
            padding: '10px 2px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)',
            minHeight: '32px',
        },
    };
};

const viewsArray = ['month'];

const CalendarComponent = ({ leaves, onEventClick }) => {
    const views = viewsArray;
    const [date, setDate] = React.useState(new Date());
    const [view, setView] = React.useState(views[0] || 'month');

    const events = leaves.map((leave) => ({
        id: leave._id,
        title: `${leave.user?.username || 'Nieznany'}`,
        start: new Date(leave.startDate),
        end: new Date(new Date(leave.endDate).getTime() + 86400000),
        allDay: true,
        resource: leave,
    }));

    return (
        <div className="shadow-3xl h-[calc(100vh-280px)] min-h-[420px] w-full rounded-[2.5rem] border border-black/10 bg-white p-4 transition-colors duration-300 [--calendar-text-main:theme(colors.zinc.900)] [--calendar-text-muted:theme(colors.zinc.400)] dark:border-white/10 dark:bg-zinc-900/40 dark:[--calendar-text-main:theme(colors.white)] dark:[--calendar-text-muted:theme(colors.zinc.500)] sm:min-h-[500px] md:p-8 lg:min-h-[600px]">
            <style>{`
                .rbc-calendar { font-family: inherit; color: var(--calendar-text-main); }
                .rbc-header {
                    padding: 12px 0 !important;
                    font-weight: 800;
                    color: var(--calendar-text-muted);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    border-bottom: 1px solid var(--calendar-border) !important;
                    box-sizing: border-box !important;
                }
                /* DEEP RESET for Global Tailwind Border Overrides */
                .rbc-calendar, .rbc-calendar *, .rbc-calendar *:before, .rbc-calendar *:after {
                    box-sizing: content-box !important;
                    border-width: 0;
                }
                
                .rbc-month-view { 
                    border: 1px solid var(--calendar-border) !important; 
                    border-radius: 32px; 
                    overflow: hidden; 
                    background: var(--calendar-bg-view);
                    box-sizing: border-box !important;
                }

                .rbc-month-row {
                    border-top: 1px solid var(--calendar-border) !important;
                    box-sizing: border-box !important;
                }

                .rbc-header + .rbc-header {
                    border-left: 1px solid var(--calendar-border) !important;
                }

                .rbc-day-bg + .rbc-day-bg {
                    border-left: 1px solid var(--calendar-border) !important;
                }

                .rbc-off-range-bg { background: var(--calendar-off-range); }
                
                .rbc-date-cell { 
                    padding: 6px 12px !important; 
                    font-weight: 800; 
                    font-size: 0.75rem; 
                    color: var(--calendar-text-muted); 
                    text-align: right;
                }
                
                .rbc-date-cell.rbc-now { color: var(--calendar-text-main); }
                
                .rbc-event { 
                    padding: 0 !important; 
                    box-sizing: border-box !important;
                    display: flex !important;
                }

                .rbc-row-segment { 
                    padding: 0 4px !important; 
                    box-sizing: border-box !important;
                    display: flex !important;
                }

                .rbc-today { background-color: var(--calendar-bg-today) !important; }
                .rbc-off-range { color: #52525b !important; }

                /* Fix for the absolute row content */
                .rbc-row-content {
                    z-index: 2;
                    width: 100%;
                    padding-top: 0 !important;
                }
                .rbc-row-content .rbc-row:first-child { 
                    margin-bottom: 2px !important; 
                }
                .rbc-show-more {
                    color: var(--calendar-text-muted);
                    font-weight: 800;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    background: var(--calendar-off-range);
                    padding: 4px 10px;
                    border-radius: 8px;
                    margin: 4px auto;
                    display: block;
                    width: fit-content;
                    border: 1px solid var(--calendar-border);
                    transition: all 0.2s;
                }
                .rbc-show-more:hover { 
                    background: var(--calendar-border);
                    color: var(--calendar-text-main);
                    text-decoration: none; 
                }
                /* Hide default borders */
                .rbc-time-view, .rbc-agenda-view { border: none !important; }
            `}</style>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={onEventClick}
                culture="pl"
                date={date}
                view={view}
                onNavigate={setDate}
                onView={setView}
                views={views}
                components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent,
                }}
                popup={true}
                messages={{
                    showMore: (total) => `+${total} more`,
                }}
                formats={{
                    dayHeaderFormat: 'EEEE, d MMMM',
                    monthHeaderFormat: 'MMMM yyyy',
                    dayRangeHeaderFormat: ({ start, end }, culture, local) =>
                        `${local.format(start, 'd MMMM', culture)} – ${local.format(end, 'd MMMM', culture)}`,
                }}
            />
        </div>
    );
};

export default CalendarComponent;
