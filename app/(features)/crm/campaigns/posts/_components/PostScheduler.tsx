'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import type { Post, Platform } from '@/core/domain/marketing/post'
import { usePostStore } from '../_store/usePostStore'
import { Card } from '@shared/ui/card'
import PostFormModal from './PostFormModal'
import PostDetailModal from './PostDetailModal'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: '#1877F2',
  tiktok: '#000000',
  zalo: '#0068FF',
  youtube: '#FF0000',
  website: '#6B7280',
  telegram: '#26A5E4',
  wordpress: '#21759B',
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  backgroundColor: string
  borderColor: string
  extendedProps: {
    post: Post
  }
}

export default function PostScheduler({ initialPosts }: { initialPosts: Post[] }) {
  const { posts, setPosts, filter } = usePostStore()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostForm, setShowPostForm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts, setPosts])

  // Transform posts to calendar events
  useEffect(() => {
    const filtered = posts.filter((p) =>
      p.title.toLowerCase().includes(filter.toLowerCase())
    )

    const calendarEvents: CalendarEvent[] = filtered.map((post) => {
      // Determine primary platform color (use first platform)
      const primaryPlatform = post.platforms[0]?.platform || 'website'
      const backgroundColor = PLATFORM_COLORS[primaryPlatform]

      // Check if any platform is published
      const isPublished = post.platforms.some(p => p.status === 'published')
      const isFailed = post.platforms.some(p => p.status === 'failed')

      const eventStart = post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt)

      // Fix positioning: use same time for all events to avoid layout issues
      const fixedStart = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate(), 10, 0, 0)
      const fixedEnd = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate(), 10, 30, 0)

      // Log date mismatches
      const dbDate = eventStart.getDate()
      const displayDate = fixedStart.getDate()
      const dbMonth = eventStart.getMonth()
      const displayMonth = fixedStart.getMonth()

      if (dbDate !== displayDate || dbMonth !== displayMonth) {
        console.log('[POST SCHEDULE MISMATCH]', {
          postId: post.id,
          title: post.title,
          dbScheduledAt: post.scheduledAt,
          dbDate: `${dbMonth + 1}/${dbDate}`,
          displayDate: `${displayMonth + 1}/${displayDate}`,
          eventStart: eventStart.toString(),
          fixedStart: fixedStart.toString()
        })
      }

      return {
        id: post.id,
        title: post.title,
        start: fixedStart,
        end: fixedEnd,
        backgroundColor: isPublished ? '#10B981' : isFailed ? '#EF4444' : backgroundColor,
        borderColor: isPublished ? '#059669' : isFailed ? '#DC2626' : backgroundColor,
        extendedProps: {
          post
        }
      }
    })

    setEvents(calendarEvents)
  }, [posts, filter])

  const handleDateClick = (info: DateClickArg) => {
    // Check if there are already posts on this date
    const postsOnDate = posts.filter(p => {
      const postDate = p.scheduledAt ? new Date(p.scheduledAt) : new Date(p.createdAt)
      return postDate.toDateString() === info.date.toDateString()
    })

    // Limit: max 2 posts per day
    if (postsOnDate.length >= 2) {
      alert('Maximum 2 posts per day. Please select another date.')
      return
    }

    setSelectedDate(info.date)
    setSelectedPost(null)
    setShowPostForm(true)
  }

  const handleEventClick = (info: EventClickArg) => {
    const post = info.event.extendedProps.post as Post

    // Check if any platform is published
    const isPublished = post.platforms.some(p => p.status === 'published')

    if (isPublished) {
      // Published posts: view only
      setSelectedPost(post)
      setShowDetailModal(true)
    } else {
      // Draft/scheduled posts: allow edit
      setSelectedPost(post)
      setSelectedDate(null)
      setShowPostForm(true)
    }
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const post = eventInfo.event.extendedProps.post as Post
    const isPublished = post.platforms.some(p => p.status === 'published')
    const isFailed = post.platforms.some(p => p.status === 'failed')
    const isScheduled = post.scheduledAt && new Date(post.scheduledAt) > new Date()

    return (
      <div className="flex items-center gap-1 p-1 w-full overflow-hidden">
        {isPublished && <CheckCircle className="h-3 w-3 shrink-0" />}
        {isFailed && <XCircle className="h-3 w-3 shrink-0" />}
        {isScheduled && !isPublished && !isFailed && <Clock className="h-3 w-3 shrink-0" />}
        <span className="text-xs font-medium truncate">{eventInfo.event.title}</span>
      </div>
    )
  }

  return (
    <>
      <Card className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          firstDay={1}
          displayEventTime={false}
          displayEventEnd={false}
          dayMaxEvents={2}
          editable={false}
          selectable={true}
        />
      </Card>

      {/* Post Form Modal */}
      <PostFormModal
        open={showPostForm}
        post={selectedPost || undefined}
        initialScheduledAt={selectedDate || undefined}
        onClose={() => {
          setShowPostForm(false)
          setSelectedPost(null)
          setSelectedDate(null)
        }}
      />

      {/* Detail Modal (for published posts) */}
      {showDetailModal && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedPost(null)
          }}
        />
      )}
    </>
  )
}
