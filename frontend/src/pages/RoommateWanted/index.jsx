import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import GoBackButton from '../../components/GoBackButton'
import ConfirmationModal from '../../components/ConfirmationModal'
import RoommateCard from './components/RoommateCard'
import PostRoommateForm from './components/PostRoommateForm'
import Loading from '../../components/Loading'
import { AuthContext } from '../../context/AuthContext' // Corrected import
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api';

export default function RoommateWanted() {
  const { User, setUser } = AuthContext(); // Use the global Auth state
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false)
  const [showGenderModal, setShowGenderModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [listings, setListings] = useState([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })
  const [editingListing, setEditingListing] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'my'
  console.log(User)

  const fetchAllListings = async () => {
    try {
      setIsLoadingListings(true)
      const token = sessionStorage.getItem('authToken')
      const response = await axios.get(`${API_BASE_URL}/api/bookRoom/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(response.data)
      if (response.data.success) {
        setListings(response.data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setIsLoadingListings(false)
    }
  }

  
  useEffect(() => {
    fetchAllListings()
  }, [])

  useEffect(() => {
    if (User && User.gender === null) {
      console.log('Gender is null, showing modal')
      setShowGenderModal(true)
    }
  }, [User])
  const handlePostAdClick = () => {
    setEditingListing(null)
    setShowForm(true)
  }

  const handleGenderUpdate = async (selectedGender) => {
    setIsUpdating(true);
    try {
      const token = sessionStorage.getItem('authToken');

      const res = await axios.put(
        `${API_BASE_URL}/api/auth/update-profile`,
        { gender: selectedGender },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        setShowGenderModal(false);
        // Don't automatically open the form
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Could not update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddListing = async (newListingData) => {
    try {
      const token = sessionStorage.getItem('authToken');

      if (editingListing) {
        // Update existing listing
        const res = await axios.put(
          `${API_BASE_URL}/api/bookRoom/update/${editingListing.id}`,
          newListingData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          toast.success('Ad updated successfully!');
          fetchAllListings();
          setShowForm(false);
          setEditingListing(null);
        }
      } else {
        // Create new listing
        const res = await axios.post(
          `${API_BASE_URL}/api/bookRoom/create`,
          newListingData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          toast.success('Ad posted successfully!');
          fetchAllListings();
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Could not save ad');
    }
  };

  // Filter listings based on user gender and isGirlsOnly preference
  const filteredListings = listings.filter((listing) => {
    if (!User?.gender) return true

    // If user is Female, show all listings
    if (User.gender === 'Female') {
      return true
    }

    // If user is Male, only show listings where isGirlsOnly is false
    if (User.gender === 'Male') {
      return !listing.isGirlsOnly
    }

    return true
  })

  // Filter by active tab
  const tabFilteredListings = activeTab === 'my'
    ? filteredListings.filter((listing) => listing.postedBy === User?.users_id)
    : filteredListings

  const sortedListings = [...tabFilteredListings].sort((a, b) =>
    new Date(b.postedDate) - new Date(a.postedDate)
  )

  // Count my listings
  const myListingsCount = listings.filter((listing) => listing.postedBy === User?.users_id).length
  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setShowForm(true);
  };

  const handleCancelListing = (listingId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Advertisement',
      message: 'Are you sure you want to remove this ad? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
        try {
          const token = sessionStorage.getItem('authToken');
          const res = await axios.delete(`${API_BASE_URL}/api/bookRoom/delete/${listingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.success) {
            toast.success('Ad removed successfully!');
            fetchAllListings();
          }
        } catch (error) {
          console.error("Delete failed:", error);
          toast.error(error.response?.data?.message || "Could not delete ad");
        }
      }
    })
  };

  if (isLoadingListings) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <Loading text="Loading listings" fullScreen={true} />
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GoBackButton />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Non-Residential Support</h1>
                <p className="mt-1 text-sm text-gray-600">Find your perfect roommate or post your available room</p>
              </div>
            </div>

            <button
              onClick={handlePostAdClick}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancel' : 'Post Ad'}
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-white p-2 shadow-md">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Listings</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                }`}>
                  {listings.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === 'my'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My Listings</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === 'my' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                }`}>
                  {myListingsCount}
                </span>
              </div>
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {sortedListings.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
                  <svg className="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {activeTab === 'my' ? 'No listings posted yet' : 'No listings available'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {activeTab === 'my' 
                      ? 'Click "Post Ad" to create your first roommate listing'
                      : 'Be the first to post a roommate listing'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedListings.map((listing) => (
                    <RoommateCard 
                      key={listing.id} 
                      listing={listing} 
                      onCancel={handleCancelListing}
                      onEdit={handleEditListing}
                      showActions={activeTab === 'my'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- STEP 1: GENDER UPDATE MODAL --- */}
      {showGenderModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
              <p className="text-gray-500 mt-2">Please select your gender to access roommate listings.</p>
            </div>

            <div className="space-y-3">
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  disabled={isUpdating}
                  onClick={() => handleGenderUpdate(g)}
                  className="w-full py-4 px-6 text-left border-2 border-gray-100 rounded-2xl hover:border-[#e50914] hover:bg-red-50 transition-all font-semibold text-gray-700 flex justify-between items-center group"
                >
                  {g}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#e50914]">Select →</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full text-gray-400 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 2: POSTING FORM MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <PostRoommateForm
              onSubmit={handleAddListing}
              onCancel={() => {
                setShowForm(false);
                setEditingListing(null);
              }}
              initialData={editingListing}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

      <Footer />
    </div>
  )
}