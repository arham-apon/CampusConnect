import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../../context/AuthContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import GoBackButton from '../../components/GoBackButton'
import ConfirmationModal from '../../components/ConfirmationModal'
import CreateEventModal from './components/CreateEventModal'
import EditMemberModal from './components/EditMemberModal'
import EditEventModal from './components/EditEventModal'
import EditUpcomingEventModal from './components/EditUpcomingEventModal'
import EditSocietyModal from './components/EditSocietyModal'
import EventDrawer from './components/EventDrawer'
import { API_BASE_URL } from '../../config/api';

export default function SocietyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { User } = AuthContext()
  const [society, setSociety] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRequestStatus, setAdminRequestStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('about')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditSocietyModal, setShowEditSocietyModal] = useState(false)
  const [showEditMemberModal, setShowEditMemberModal] = useState(false)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [showEditUpcomingEventModal, setShowEditUpcomingEventModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editingUpcomingEvent, setEditingUpcomingEvent] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)
  
  // Get user email from auth context
  const userEmail = User?.email

  useEffect(() => {
    fetchSociety()
    fetchUpcomingEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userEmail])

  const fetchSociety = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/societies/${id}?userEmail=${userEmail}`)
      if (response.data.success) {
        setSociety(response.data.society)
        setIsFollowing(response.data.society.isFollowing)
        setIsAdmin(response.data.society.isAdmin)
        setAdminRequestStatus(response.data.society.adminRequestStatus)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching society:', error)
      toast.error('Failed to load society')
      setIsLoading(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      const url = `${API_BASE_URL}/api/events?societyId=${id}&upcoming=true${userEmail ? `&userEmail=${userEmail}` : ''}`
      const response = await axios.get(url)
      if (response.data.success) {
        setUpcomingEvents(response.data.events)
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
    }
  }

  const handleFollowToggle = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/societies/${id}/follow`, {
        userEmail
      })
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing)
        toast.success(response.data.message)
        // Refetch society to get updated member count
        fetchSociety()
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleJoinAsAdmin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/societies/${id}/join-admin`, {
        userEmail,
        userName: User?.user_name || User?.email?.split('@')[0]
      })
      if (response.data.success) {
        setAdminRequestStatus(response.data.adminRequestStatus)
        toast.success(response.data.message)
        // Refetch society to get updated data
        fetchSociety()
      }
    } catch (error) {
      console.error('Error requesting admin:', error)
      toast.error(error.response?.data?.message || 'Failed to send admin request')
    }
  }

  const handleCreateEvent = async (eventData) => {
    try {
      // Prepare data, converting image file to base64 if present
      const dataToSend = { ...eventData, societyId: id, userEmail }
      
      if (eventData.image instanceof File) {
        const reader = new FileReader()
        reader.readAsDataURL(eventData.image)
        await new Promise((resolve) => {
          reader.onloadend = () => {
            dataToSend.imageUrl = reader.result
            delete dataToSend.image
            resolve()
          }
        })
      } else {
        delete dataToSend.image
      }

      const response = await axios.post(`${API_BASE_URL}/api/events`, dataToSend)
      if (response.data.success) {
        toast.success('Event created successfully!')
        setShowCreateModal(false)
        fetchUpcomingEvents()
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    }
  }

  const handleDeleteMember = (memberId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Panel Member',
      message: 'Are you sure you want to delete this panel member? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/societies/${id}/panel-members/${memberId}`, {
            data: { userEmail }
          })
          if (response.data.success) {
            toast.success('Panel member deleted')
            fetchSociety()
          }
        } catch (error) {
          console.error('Error deleting member:', error)
          toast.error(error.response?.data?.message || 'Failed to delete member')
        }
      }
    })
  }

  const handleDeleteEvent = (eventId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Past Event',
      message: 'Are you sure you want to delete this past event? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/societies/${id}/past-gallery/${eventId}`, {
            data: { userEmail }
          })
          if (response.data.success) {
            toast.success('Past event deleted')
            fetchSociety()
          }
        } catch (error) {
          console.error('Error deleting event:', error)
          toast.error(error.response?.data?.message || 'Failed to delete event')
        }
      }
    })
  }

  const handleDeleteUpcomingEvent = (eventId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Upcoming Event',
      message: 'Are you sure you want to delete this upcoming event? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/events/${eventId}`)
          if (response.data.success) {
            toast.success('Upcoming event deleted')
            fetchUpcomingEvents()
          }
        } catch (error) {
          console.error('Error deleting upcoming event:', error)
          toast.error(error.response?.data?.message || 'Failed to delete event')
        }
      }
    })
  }

  const handleEventClick = (event) => {
    // Add society name to event object
    const eventWithSociety = {
      ...event,
      id: event._id,
      societyName: society.name
    }
    setSelectedEvent(eventWithSociety)
    setEventDrawerOpen(true)
  }

  const handleEventRegister = async (eventId) => {
    try {
      if (!userEmail) {
        toast.error('Please login to register for events')
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, {
        userEmail
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Registration successful!')
        // Close drawer and refresh events
        setEventDrawerOpen(false)
        fetchUpcomingEvents()
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      toast.error(error.response?.data?.message || 'Failed to register for event')
    }
  }

  const handleEventUnregister = async (eventId) => {
    try {
      if (!userEmail) {
        toast.error('Please login to cancel registration')
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/unregister`, {
        userEmail
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Registration cancelled successfully!')
        // Close drawer and refresh events
        setEventDrawerOpen(false)
        fetchUpcomingEvents()
      }
    } catch (error) {
      console.error('Error cancelling registration:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel registration')
    }
  }

  // Helper function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to generate consistent color for initials
  const getColorForName = (name) => {
    const colors = [
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#e50914]"></div>
          <p className="mt-4 text-gray-600">Loading society...</p>
        </div>
      </div>
    )
  }

  if (!society) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Society not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header showMenuButton={false} />

      <main className="flex-1">
        {/* Cover Photo Section */}
        <div className="relative h-64 overflow-hidden bg-gray-100 md:h-96">
          {society.coverPhoto && society.coverPhoto.trim() !== '' && !society.coverPhoto.includes('placeholder') ? (
            <img
              src={society.coverPhoto}
              alt={society.name}
              className="h-full w-full object-cover opacity-80"
            />
          ) : (
            <div className="h-full w-full bg-gray-100"></div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Back Button */}
          <div className="absolute left-4 top-4 md:left-8 md:top-8">
            <GoBackButton theme="light" />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Society Header Card */}
          <div className="relative -mt-20 mb-8">
            <div className="rounded-2xl bg-white p-6 shadow-2xl md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Logo and Info */}
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                  {/* Logo */}
                  <div className="relative -mt-16 md:-mt-20">
                    <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl md:h-40 md:w-40">
                      {society.logo && society.logo.trim() !== '' && !society.logo.includes('placeholder') ? (
                        <img
                          src={society.logo}
                          alt={`${society.name} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-white"></div>
                      )}
                    </div>
                  </div>

                  {/* Society Info */}
                  <div className="text-center md:text-left">
                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                        {society.name}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 md:justify-start">
                      <div className="flex items-center gap-1">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-semibold">{society.memberCount} followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Est. {society.establishedYear}</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="mt-3 flex justify-center gap-3 md:justify-start">
                      <a
                        href={society.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-[#e50914] hover:text-white"
                        title="Facebook"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      {society.website && (
                        <a
                          href={society.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-[#e50914] hover:text-white"
                          title="Website"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                      {society.email && (
                        <a
                          href={`mailto:${society.email}`}
                          className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-[#e50914] hover:text-white"
                          title="Email"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <button
                    onClick={handleFollowToggle}
                    className={`rounded-xl px-6 py-3 font-bold shadow-lg transition-all hover:scale-105 ${
                      isFollowing
                        ? 'border-2 border-[#e50914] bg-white text-[#e50914] hover:bg-[#e50914] hover:text-white'
                        : 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white hover:shadow-xl'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow Society'}
                  </button>
                  
                  {!isAdmin && adminRequestStatus === 'pending' && (
                    <span className="flex items-center gap-2 rounded-xl bg-yellow-100 px-6 py-3 text-sm font-semibold text-yellow-700">
                      <svg className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Admin Request Pending
                    </span>
                  )}
                  
                  {!isAdmin && adminRequestStatus !== 'pending' && (
                    <button
                      onClick={handleJoinAsAdmin}
                      className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-700 shadow-lg transition-all hover:scale-105 hover:border-[#e50914] hover:text-[#e50914]"
                    >
                      Request Admin Access
                    </button>
                  )}
                  
                  {isAdmin && (
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      Admin
                      </span>
                      <button
                        onClick={() => setShowEditSocietyModal(true)}
                        className="flex items-center gap-2 rounded-xl border-2 border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-500 hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Info
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto rounded-full bg-white p-2 shadow-lg">
              <button
                onClick={() => setActiveTab('about')}
                className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition-all ${
                  activeTab === 'about'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => setActiveTab('panel')}
                className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition-all ${
                  activeTab === 'panel'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Panel Members
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {/* About Us Tab */}
            {activeTab === 'about' && (
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">About Us</h2>
                <p className="leading-relaxed text-gray-700">{society.description}</p>
              </div>
            )}

            {/* Panel Members Tab */}
            {activeTab === 'panel' && (
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Panel Members</h2>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingMember({ name: '', position: '', department: '', batch: '' })
                        setShowEditMemberModal(true)
                      }}
                      className="flex items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#b00020]"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Member
                    </button>
                  )}
                </div>
                <div className="space-y-8">
                  {/* Group panel members by batch in descending order */}
                  {Object.entries(
                    society.panelMembers.reduce((acc, member) => {
                      const batch = member.batch || 'Unknown';
                      if (!acc[batch]) {
                        acc[batch] = [];
                      }
                      acc[batch].push(member);
                      return acc;
                    }, {})
                  )
                    .sort(([batchA], [batchB]) => {
                      // Sort batches in ascending order (oldest first)
                      if (batchA === 'Unknown') return 1;
                      if (batchB === 'Unknown') return -1;
                      return parseInt(batchA) - parseInt(batchB);
                    })
                    .map(([batch, members]) => (
                      <div key={batch} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <h3 className="mb-4 text-xl font-bold text-[#e50914]">Batch {batch}</h3>
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member._id}
                              className="group flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${getColorForName(member.name)}`}>
                                  {getInitials(member.name)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{member.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {member.position} • {member.department}
                                  </p>
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    onClick={() => {
                                      setEditingMember(member)
                                      setShowEditMemberModal(true)
                                    }}
                                    className="rounded-lg bg-blue-500 p-2 text-white transition hover:bg-blue-600"
                                    title="Edit"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMember(member._id)}
                                    className="rounded-lg bg-red-500 p-2 text-white transition hover:bg-red-600"
                                    title="Delete"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Events Tab */}
            {activeTab === 'upcoming' && (
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  {isAdmin && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#b00020]"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Event
                    </button>
                  )}
                </div>
                {upcomingEvents.length === 0 ? (
                  <div className="py-12 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No upcoming events scheduled</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event._id}
                        onClick={() => handleEventClick(event)}
                        className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                      >
                        {isAdmin && (
                          <div className="absolute right-2 top-2 z-10 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingUpcomingEvent(event)
                                setShowEditUpcomingEventModal(true)
                              }}
                              className="rounded-lg bg-blue-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-600 group-hover:opacity-100"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteUpcomingEvent(event._id)
                              }}
                              className="rounded-lg bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          {event.imageUrl && event.imageUrl.trim() !== '' && !event.imageUrl.includes('placeholder') ? (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100"></div>
                          )}
                          <div className="absolute left-3 top-3">
                            <span className="rounded-full bg-[#e50914] px-3 py-1 text-xs font-semibold text-white">
                              {event.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="mb-2 font-bold text-gray-900">{event.title}</h3>
                          <div className="mb-3 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{event.venue}</span>
                            </div>
                          </div>
                          <p className="mb-3 flex-1 text-sm leading-relaxed text-gray-700">
                            {event.description}
                          </p>
                          {(event.maxParticipants || event.registrationDeadline) && (
                            <div className="flex items-center justify-between border-t pt-3 text-xs text-gray-500">
                              {event.maxParticipants && (
                                <span>{event.currentParticipants || 0} / {event.maxParticipants} registered</span>
                              )}
                              {event.registrationDeadline && (
                                <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Past Events Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Past Events Gallery</h2>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingEvent({ title: '', date: '', image: '', description: '' })
                        setShowEditEventModal(true)
                      }}
                      className="flex items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#b00020]"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Event
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {society.pastGallery.map((event) => (
                    <div
                      key={event._id}
                      className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
                    >
                      {isAdmin && (
                        <div className="absolute right-2 top-2 z-10 flex gap-1">
                          <button
                            onClick={() => {
                              setEditingEvent(event)
                              setShowEditEventModal(true)
                            }}
                            className="rounded-lg bg-blue-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-600 group-hover:opacity-100"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="rounded-lg bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="mb-2 font-bold text-gray-900">{event.title}</h3>
                        <p className="mb-3 text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="flex-1 text-sm leading-relaxed text-gray-700">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>



      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          societies={[society]}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}

      {/* Edit Panel Member Modal */}
      {showEditMemberModal && (
        <EditMemberModal
          member={editingMember}
          societyId={id}
          userEmail={userEmail}
          onClose={() => {
            setShowEditMemberModal(false)
            setEditingMember(null)
          }}
          onSuccess={fetchSociety}
        />
      )}

      {/* Edit Past Event Modal */}
      {showEditEventModal && (
        <EditEventModal
          event={editingEvent}
          societyId={id}
          userEmail={userEmail}
          onClose={() => {
            setShowEditEventModal(false)
            setEditingEvent(null)
          }}
          onSuccess={fetchSociety}
        />
      )}

      {/* Edit Upcoming Event Modal */}
      {showEditUpcomingEventModal && (
        <EditUpcomingEventModal
          event={editingUpcomingEvent}
          userEmail={userEmail}
          onClose={() => {
            setShowEditUpcomingEventModal(false)
            setEditingUpcomingEvent(null)
          }}
          onSuccess={fetchUpcomingEvents}
        />
      )}

      {/* Edit Society Modal */}
      {showEditSocietyModal && (
        <EditSocietyModal
          society={society}
          userEmail={userEmail}
          onClose={() => setShowEditSocietyModal(false)}
          onSuccess={fetchSociety}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

      {/* Event Drawer */}
      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          isOpen={eventDrawerOpen}
          onClose={() => {
            setEventDrawerOpen(false)
            setTimeout(() => setSelectedEvent(null), 300)
          }}
          onRegister={handleEventRegister}
          onUnregister={handleEventUnregister}
        />
      )}

      <Footer />
    </div>
  )
}
