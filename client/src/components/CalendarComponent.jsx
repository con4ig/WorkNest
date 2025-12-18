import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import pl from 'date-fns/locale/pl';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const locales = {
    'pl': pl,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

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
    
    const viewButtons = {
        month: 'Miesiąc',
        week: 'Tydzień',
        agenda: 'Agenda',
    };

    return (
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Navigation and Title */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={goToBack}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goToCurrent}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
                    >
                        Dziś
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                    {label()}
                </h2>
            </div>

            {/* Right: View Switcher */}
            {views.length > 1 && (
                 <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {views.map(viewName => (
                        <button
                            key={viewName}
                            onClick={() => onView(viewName)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                view === viewName
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {viewButtons[viewName]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomEvent = ({ event }) => {
    const initials = event.resource.user?.username?.charAt(0).toUpperCase() || '?';
    return (
        <div className="flex items-center gap-1.5 h-full px-1">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {initials}
            </div>
            <div className="truncate text-xs font-medium">
                {event.resource.user?.username}
            </div>
        </div>
    );
};

const CalendarComponent = ({ leaves, onEventClick, views = ['month', 'week', 'agenda'] }) => {
    const [date, setDate] = React.useState(new Date());
    const [view, setView] = React.useState(views[0] || 'month');

    const events = leaves.map(leave => ({
        id: leave._id,
        title: `${leave.user?.username || 'Nieznany'}`,
        start: new Date(leave.startDate),
        end: new Date(new Date(leave.endDate).getTime() + 86400000), 
        allDay: true,
        resource: leave,
    }));

    const eventStyleGetter = (event) => {
        const status = event.resource.status;
        let backgroundColor = '#3b82f6'; 

        if (status === 'pending') backgroundColor = '#eab308'; 
        if (status === 'approved') backgroundColor = '#10b981'; 
        if (status === 'rejected') backgroundColor = '#ef4444'; 

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.85rem',
                padding: '0', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }
        };
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[800px]">
             <style>{`
                .rbc-calendar { font-family: inherit; }
                .rbc-header {
                    padding: 12px 0;
                    font-weight: 600;
                    color: #6b7280;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    border-bottom: 1px solid #f3f4f6 !important;
                }
                .rbc-month-view { border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden; }
                .rbc-day-bg { border-left: 1px solid #f3f4f6 !important; }
                .rbc-off-range-bg { bg-gray-50; }
                .rbc-date-cell { padding: 8px; font-weight: 500; font-size: 0.9rem; color: #374151; }
                .rbc-event { padding: 1px !important; margin: 1px 0 !important; border-radius: 6px !important;}
                .rbc-row-segment { padding: 0 4px; }
                .rbc-today { background-color: #ecfdf5 !important; }
                .rbc-off-range { color: #d1d5db !important; }
                .rbc-show-more {
                    color: #059669;
                    font-weight: 600;
                    font-size: 0.85rem;
                    background: #ecfdf5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-top: 2px;
                }
                .rbc-show-more:hover { text-decoration: none; opacity: 0.8; }
            `}</style>
            
            <Calendar
                localizer={localizer}
                events={events} // Keep 'events'
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={onEventClick}
                
                culture='pl'
                
                date={date}
                view={view}
                onNavigate={setDate}
                onView={setView}
                views={views}

                components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent 
                }}
                popup={true}
                
                messages={{
                    showMore: total => `+${total} więcej`
                }}
                // Date-fns format patterns
                formats={{
                    dayHeaderFormat: 'EEEE, d MMMM', 
                    monthHeaderFormat: 'MMMM yyyy', 
                    dayRangeHeaderFormat: ({ start, end }, culture, local) =>
                        `${local.format(start, 'd MMMM', culture)} – ${local.format(end, 'd MMMM', culture)}`
                }}
            />
        </div>
    );
};

export default CalendarComponent;
