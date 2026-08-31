import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../../context/AuthContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import GoBackButton from '../../components/GoBackButton'
import EventCalendar from './components/EventCalendar'
import SocietyCard from './components/SocietyCard'
import { API_BASE_URL } from '../../config/api';

export default function Societies() {
  const navigate = useNavigate()
  const { User } = AuthContext()
  const [view, setView] = useState('societies') // 'calendar' or 'societies'
  const [societies, setSocieties] = useState([])
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchSocieties()
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [User?.email])

  const fetchSocieties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/societies`)
      if (response.data.success) {
        setSocieties(response.data.societies)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching societies:', error)
      toast.error('Failed to load societies')
      setIsLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const userEmail = User?.email
      const url = `${API_BASE_URL}/api/events${userEmail ? `?userEmail=${userEmail}` : ''}`
      const response = await axios.get(url)
      if (response.data.success) {
        setEvents(response.data.events)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    }
  }

  const handleEventRegister = async (eventId) => {
    try {
      if (!User?.email) {
        toast.error('Please login to register for events')
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, {
        userEmail: User.email
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Registration successful!')
        // Refresh events to update participant count
        fetchEvents()
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      toast.error(error.response?.data?.message || 'Failed to register for event')
    }
  }

  const handleEventUnregister = async (eventId) => {
    try {
      if (!User?.email) {
        toast.error('Please login to cancel registration')
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/unregister`, {
        userEmail: User.email
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Registration cancelled successfully!')
        // Refresh events to update participant count
        fetchEvents()
      }
    } catch (error) {
      console.error('Error cancelling registration:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel registration')
    }
  }

  const handleSocietyClick = (societyId) => {
    navigate(`/societies/${societyId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header showMenuButton={false} />

      <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <GoBackButton />
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
                  Societies & Events
                </h1>
                <p className="mt-1 text-gray-600">
                  Discover campus societies and upcoming events
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                  view === 'calendar'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </button>
              <button
                onClick={() => setView('societies')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                  view === 'societies'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Societies
              </button>
            </div>
          </div>

          {/* Main Content */}
          {view === 'calendar' ? (
            <EventCalendar 
              events={events}
              onEventRegister={handleEventRegister}
              onEventUnregister={handleEventUnregister}
              societies={societies}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {societies.map((society) => (
                <SocietyCard
                  key={society.id}
                  society={society}
                  onClick={() => handleSocietyClick(society.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
