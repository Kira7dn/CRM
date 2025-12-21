'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import type { DateSelectArg, EventInput } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import type { Platform, ContentType, PostMedia, PlatformMetadata } from '@/core/domain/marketing/post'
import { Post } from '@/core/domain/marketing/post'
import { usePostStore } from '../_store/usePostStore'
import { Card } from '@shared/ui/card'
import PostDetailModal from './PostDetailModal'
import DayScheduleDialog from './DayScheduleDialog'
import { CheckCircle, Clock, XCircle, Sparkles, Loader2 } from 'lucide-react'
import { startOfDay } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { ThemeProvider } from './scheduler/theme-provider'
import CalendarNav from './scheduler/calendar-nav'
import { EventsProvider } from './scheduler/context/events-context'

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

interface PostSchedulerProps {
  initialPosts: Post[]
}



export default function PostScheduler({ initialPosts }: PostSchedulerProps) {
  const { posts, setPosts, filter, previewPosts, isGeneratingSchedule } = usePostStore()
  const [events, setEvents] = useState<EventInput[]>([])
  const router = useRouter()

  const calendarRef = useRef<FullCalendar | null>(null);
  const [selectedStart, setSelectedStart] = useState(new Date());
  const [selectedEnd, setSelectedEnd] = useState(new Date());
  const [viewedDate, setViewedDate] = useState(new Date());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedDatePosts, setSelectedDatePosts] = useState<Post[]>([])

  const handleDateSelect = (info: DateSelectArg) => {
    setSelectedStart(info.start);
    setSelectedEnd(info.end);
  };


  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts, setPosts])

  // Transform posts to calendar events
  useEffect(() => {
    const filtered = posts.filter((p) =>
      p.title.toLowerCase().includes(filter.toLowerCase())
    )

    const calendarEvents: EventInput[] = filtered.map((post) => {
      // Determine primary platform color (use first platform)
      const primaryPlatform = post.platforms[0]?.platform || 'website'
      const backgroundColor = PLATFORM_COLORS[primaryPlatform]

      // Check if any platform is published
      const isPublished = post.platforms.some(p => p.status === 'published')
      const isFailed = post.platforms.some(p => p.status === 'failed')

      const start = post.scheduledAt
        ? new Date(post.scheduledAt)
        : new Date(post.createdAt)

      return {
        id: post.id,
        title: post.title,
        start: start,
        allDay: true,
        backgroundColor: isPublished ? '#10B981' : isFailed ? '#EF4444' : backgroundColor,
        borderColor: isPublished ? '#059669' : isFailed ? '#DC2626' : backgroundColor,
        extendedProps: { post }
      }
    })

    // Add preview posts as amber events
    const previewEvents: EventInput[] = previewPosts.map((item, idx) => ({
      id: `preview-${idx}`,
      title: item.title,
      start: new Date(item.scheduledDate),
      allDay: true,
      backgroundColor: '#F59E0B',  // Amber
      borderColor: '#D97706',
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

    // Filter posts for the clicked date
    const postsOnDate = posts.filter((post) => {
      const postDate = post.scheduledAt
        ? startOfDay(new Date(post.scheduledAt))
        : startOfDay(new Date(post.createdAt))
      return postDate.getTime() === clickedDate.getTime()
    })

    setSelectedDate(clickedDate)
    setSelectedDatePosts(postsOnDate)
    setDialogOpen(true)
  }

  const handleEventClick = (info: EventClickArg) => {
    const post = info.event.extendedProps.post as Post
    router.push(`/crm/marketing/posts/edit?id=${post.id}`)

  }


  const renderEventContent = (eventInfo: EventContentArg) => {
    const isPreview = eventInfo.event.extendedProps.isPreview

    if (isPreview) {
      return (
        <div className="flex items-center gap-1 p-1 w-full overflow-hidden opacity-90">
          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-white" />
          <div className="text-[10px] sm:text-xs font-medium truncate italic text-white">
            {eventInfo.event.title}
          </div>
        </div>
      )
    }

    const post = eventInfo.event.extendedProps.post as Post
    const isPublished = post.platforms.some(p => p.status === 'published')
    const isFailed = post.platforms.some(p => p.status === 'failed')
    const isScheduled = post.scheduledAt && new Date(post.scheduledAt) > new Date()

    return (
      <div className="flex items-center gap-1 p-1 w-full overflow-hidden hover:opacity-100 opacity-80">
        {isPublished && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
        {isFailed && <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
        {isScheduled && !isPublished && !isFailed && <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
        <div className="text-[10px] sm:text-xs font-medium truncate cursor-pointer">
          {eventInfo.event.title}
        </div>
      </div>
    )
  }

  return (
    <EventsProvider>
      <div className="space-y-4 sm:space-y-5">
        <CalendarNav
          calendarRef={calendarRef}
          start={selectedStart}
          end={selectedEnd}
          viewedDate={viewedDate}
        />

        <div className="relative">
          {isGeneratingSchedule && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mr-2" />
              <span className="text-xs sm:text-sm font-medium">Generating schedule...</span>
            </div>
          )}

          <Card className="p-2 sm:p-4">
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
              datesSet={(dates) => setViewedDate(dates.view.currentStart)}
              height="auto"
              firstDay={1}
              displayEventTime={false}
              displayEventEnd={false}
              dayMaxEvents={2}
              editable={false}
              selectable={true}
            />
          </Card>
        </div>

        {/* Day Schedule Dialog */}
        <DayScheduleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedDate={selectedDate}
          posts={selectedDatePosts}
        />
      </div>
    </EventsProvider>
  )
}
