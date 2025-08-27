"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Plus, Calendar, Clock, Users, MapPin } from "lucide-react"
import Link from "next/link"

interface Schedule {
  id: string
  class_name: string
  instructor: string
  class_date: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
  location: string
  class_type: string
  status: string
  created_at: string
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch("/api/schedule")
      if (response.ok) {
        const data = await response.json()
        setSchedule(data)
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300"
      case "full":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAvailabilityStatus = (current: number, max: number) => {
    if (current >= max) return "Full"
    if (current >= max * 0.8) return "Almost Full"
    return "Available"
  }

  const getAvailabilityColor = (current: number, max: number) => {
    if (current >= max) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (current >= max * 0.8) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <AuthenticatedLayout 
      title="Class Schedule"
      showBackButton
      backHref="/"
      headerActions={
        <Button asChild>
          <Link href="/schedule/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading schedule...</p>
            </div>
          </div>
        ) : schedule.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classes scheduled</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first class.</p>
              <Button asChild>
                <Link href="/schedule/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {schedule.map((classItem) => (
              <Card key={classItem.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {classItem.class_name}
                      </CardTitle>
                      <CardDescription>
                        {classItem.class_type} • {classItem.instructor}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(classItem.status)}>
                        {classItem.status}
                      </Badge>
                      <Badge className={getAvailabilityColor(classItem.current_bookings, classItem.max_capacity)}>
                        {getAvailabilityStatus(classItem.current_bookings, classItem.max_capacity)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Date:</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(classItem.class_date)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Capacity:</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {classItem.current_bookings}/{classItem.max_capacity}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {classItem.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
