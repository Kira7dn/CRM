'use client'

/**
 * PostScheduler Component
 *
 * NOTE: This component uses FullCalendar library which handles Date objects internally.
 * This is an EXCEPTION to CRM Date Standards because:
 * 1. FullCalendar is a third-party UI library that requires Date objects
 * 2. All dates from backend (ISO strings) are converted to Date at component boundary
 * 3. The library handles timezone display internally based on browser timezone
 * 4. Data sent back to backend is always converted to ISO strings
 */

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { EventInput, EventClickArg, EventSegment } from '@fullcalendar/core'
import type { EventContentArg } from '@fullcalendar/core/index.js'
import type { DateClickArg } from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Platform, PostStatus } from '@/core/domain/marketing/post'
import { Post } from '@/core/domain/marketing/post'
import { usePostStore } from '../_store/usePostStore'
import { Card } from '@shared/ui/card'
import DayScheduleDialog from './DayScheduleDialog'
import PostFormModal from './PostFormModal'
import { Loader2 } from 'lucide-react'
import { startOfDay } from 'date-fns'
import CalendarNav from './scheduler/calendar-nav'
import { EventsProvider } from './scheduler/context/events-context'

// Dynamic import FullCalendar - only render on client
const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
}) as any

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: '#1877F2',
  tiktok: '#000000',
  zalo: '#0068FF',
  youtube: '#FF0000',
  website: '#6B7280',
  telegram: '#26A5E4',
  wordpress: '#21759B',
  instagram: '#E4405F',
}

// Color mapping based on Status (stronger, more saturated colors)
const STATUS_COLOR_MAP: Record<PostStatus, { bg: string; border: string; text: string }> = {
  draft: { bg: '#6B7280', border: '#4B5563', text: '#FFFFFF' },      // Gray (darker)
  scheduled: { bg: '#2563EB', border: '#1D4ED8', text: '#FFFFFF' },  // Blue (strong)
  published: { bg: '#10B981', border: '#059669', text: '#FFFFFF' },  // Green
  failed: { bg: '#DC2626', border: '#B91C1C', text: '#FFFFFF' },     // Red
  archived: { bg: '#D97706', border: '#B45309', text: '#FFFFFF' },   // Amber
}


export default function PostScheduler() {
  const {
    posts,
    filter,
    previewPosts,
    isGeneratingSchedule,
    loadPostsByMonth,
    loadedMonths,
    openDayScheduleDialog,
  } = usePostStore()

  const [events, setEvents] = useState<EventInput[]>([])
  const calendarRef = useRef<any>(null)
  const [viewedDate, setViewedDate] = useState(new Date())

  // Get post status based on platform statuses (matching DayScheduleDialog logic)
  const getPostStatus = (post: Post): PostStatus => {
    if (post.platforms.some((p) => p.status === 'published')) return 'published'
    if (post.platforms.some((p) => p.status === 'failed')) return 'failed'
    if (post.platforms.some((p) => p.status === 'scheduled')) return 'scheduled'
    return 'draft'
  }

  // Load posts when calendar month changes
  useEffect(() => {
    const year = viewedDate.getFullYear()
    const month = viewedDate.getMonth() // 0-11
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

    // Check if this month is already loaded
    if (!loadedMonths.has(monthKey)) {
      console.log(`[PostScheduler] Loading posts for new month: ${monthKey}`)
      loadPostsByMonth(year, month)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedDate])

  // Transform posts to calendar events
  useEffect(() => {
    const filtered = posts.filter((p) => {
      const searchText = (p.title || p.idea || '').toLowerCase()
      return searchText.includes(filter.toLowerCase())
    })

    const calendarEvents: EventInput[] = filtered.map((post) => {
      // Get post status and apply color based on status
      const status = getPostStatus(post)
      const statusColor = STATUS_COLOR_MAP[status]

      // Convert ISO string to Date object for FullCalendar (third-party library requirement)
      const start = post.scheduledAt
        ? new Date(post.scheduledAt)
        : new Date(post.createdAt)

      const eventTitle = post.title || post.idea || 'Untitled Post'

      return {
        id: post.id,
        title: eventTitle,
        start: start,
        allDay: true,
        backgroundColor: statusColor.bg,
        borderColor: statusColor.border,
        textColor: statusColor.text,
        extendedProps: { post, status },
      }
    })

    // Add preview posts as amber events
    const previewEvents: EventInput[] = previewPosts.map((item, idx) => ({
      id: `preview-${idx}`,
      title: item.idea,
      // Convert ISO string to Date object for FullCalendar
      start: item.scheduledAt ? new Date(item.scheduledAt) : new Date(),
      allDay: true,
      // Use stronger amber for preview to make it more visible
      backgroundColor: '#D97706',
      borderColor: '#B45309',
      textColor: '#FFFFFF',
      className: 'preview-event',
      extendedProps: {
        isPreview: true,
        scheduleItem: item
      }
    }))

    setEvents([...calendarEvents, ...previewEvents])
  }, [posts, filter, previewPosts])



  const handleDateClick = (info: DateClickArg) => {
    const clickedDate = startOfDay(info.date)
    openDayScheduleDialog(clickedDate)
  }

  const handleEventClick = (info: EventClickArg) => {
    // Extract date from the clicked event and show all posts for that day
    const clickedDate = startOfDay(info.event.start || new Date())
    openDayScheduleDialog(clickedDate)
  }

  const handleMoreClick = (info: any) => {
    console.log(info);

    // Extract date from the clicked event and show all posts for that day
    const clickedDate = startOfDay(info.date || new Date())
    openDayScheduleDialog(clickedDate)
  }
  // Thay đổi nội dung liên kết "more"
  function renderMoreLinkContent(arg: any) {
    return (
      <>

        <span style={{ color: "red" }}>
          +{arg.num}
        </span>
        <span className='hidden md:inline'>
          {` more`}
        </span>
      </>
    );
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const isPreview = eventInfo.event.extendedProps.isPreview

    if (isPreview) {
      return (
        <div className="flex items-center gap-1 p-0 sm:p-1 w-full overflow-hidden opacity-90 text-gray-400">
          {/* Amber dot for preview - 4x4px on mobile */}
          <div className="h-1 w-1 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 rounded-full bg-white shrink-0" />
          <div className="hidden md:block text-[10px] sm:text-xs font-medium truncate italic text-white">
            {eventInfo.event.title}
          </div>
        </div>
      )
    }

    const post = eventInfo.event.extendedProps.post as Post

    return (
      <div className="flex items-center gap-0.5 sm:gap-1 p-0 sm:p-1 w-full min-w-0 hover:opacity-100 opacity-80">
        {/* Colored dot - 4x4px on mobile, 8px tablet, 10px desktop */}
        <div className="h-1 w-1 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 rounded-full sm:bg-white shrink-0" />
        {/* Title - Desktop only */}
        <div className="hidden md:block text-[10px] sm:text-xs font-medium truncate min-w-0">
          {eventInfo.event.title}
        </div>
      </div>
    )
  }

  return (
    <EventsProvider>
      <Card className="py-2 gap-2">
        <CalendarNav calendarRef={calendarRef} viewedDate={viewedDate} />

        <div className="relative">
          {isGeneratingSchedule && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mr-2" />
              <span className="text-xs sm:text-sm font-medium">Generating schedule...</span>
            </div>
          )}

          <div className="p-2 md:p-4 text-xs md:text-base">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              timeZone="local"
              initialView="dayGridMonth"
              headerToolbar={false}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              datesSet={(dates: any) => setViewedDate(dates.view.currentStart)}
              height="auto"
              displayEventTime={false}
              displayEventEnd={false}
              dayMaxEvents={4} // Allow all events to show (will wrap on mobile)
              editable={false}
              selectable={false}
              handleWindowResize={true}
              moreLinkClick="month"
              moreLinkContent={renderMoreLinkContent}
            />
          </div>
        </div>

        {/* Modals - controlled by Zustand store */}
        <DayScheduleDialog />
        <PostFormModal />
      </Card>
    </EventsProvider>
  )
}
