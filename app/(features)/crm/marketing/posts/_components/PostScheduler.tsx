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
import { CheckCircle, Clock, XCircle } from 'lucide-react'
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
  const { posts, setPosts, filter } = usePostStore()
  const [events, setEvents] = useState<EventInput[]>([])
  const router = useRouter()

  const calendarRef = useRef<FullCalendar | null>(null);
  const [selectedStart, setSelectedStart] = useState(new Date());
  const [selectedEnd, setSelectedEnd] = useState(new Date());
  const [viewedDate, setViewedDate] = useState(new Date());

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

    setEvents(calendarEvents)
  }, [posts, filter])



  const handleDateClick = (info: DateClickArg) => {
    console.log(info);
    router.push(`/crm/marketing/posts/new?scheduledAt=${info.dateStr}`)
  }

  const handleEventClick = (info: EventClickArg) => {
    const post = info.event.extendedProps.post as Post
  }


  const renderEventContent = (eventInfo: EventContentArg) => {
    const post = eventInfo.event.extendedProps.post as Post
    const isPublished = post.platforms.some(p => p.status === 'published')
    const isFailed = post.platforms.some(p => p.status === 'failed')
    const isScheduled = post.scheduledAt && new Date(post.scheduledAt) > new Date()

    return (
      <div className="flex items-center gap-1 p-1 w-full overflow-hidden hover:opacity-100 opacity-80">
        {isPublished && <CheckCircle className="h-3 w-3 shrink-0" />}
        {isFailed && <XCircle className="h-3 w-3 shrink-0" />}
        {isScheduled && !isPublished && !isFailed && <Clock className="h-3 w-3 shrink-0" />}
        <div className="text-xs font-medium truncate cursor-pointer">
          {eventInfo.event.title}
        </div>
      </div>
    )
  }

  return (
    <EventsProvider>
      <div className="space-y-5">
        <CalendarNav
          calendarRef={calendarRef}
          start={selectedStart}
          end={selectedEnd}
          viewedDate={viewedDate}
        />
        <Card className="p-4">
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
    </EventsProvider>
  )
}
