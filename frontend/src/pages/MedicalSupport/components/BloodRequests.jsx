import { useState, useEffect, useMemo } from 'react'
import { AlertCircle, Phone, MapPin, Calendar, X, Trash2, Filter, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRecieverContext } from '../../../context/RecieverContext'
import { useDonorContext } from '../../../context/DonorContext'
import { AuthContext } from '../../../context/AuthContext'
import Loading from '../../../components/Loading'
import axios from 'axios'
import { API_BASE_URL } from '../../../config/api';

export default function BloodRequests() {
    const { User } = AuthContext();
    const currentUserEmail = User?.email || User?.user?.email;

    const {
        recievers: contextRequests,
        recieverLoading,
        recieverError,
        fetchRecievers
    } = useRecieverContext()

    const { isRegisteredDonor } = useDonorContext()

    const [selectedBloodGroup, setSelectedBloodGroup] = useState('all');
    const [searchLocation, setSearchLocation] = useState('');
    const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
    const [minDueDate, setMinDueDate] = useState('');

    const [filteredRequests, setFilteredRequests] = useState([]);

    const [isCancelling, setIsCancelling] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];


    useEffect(() => {
        if (!contextRequests || contextRequests.length === 0) {
            fetchRecievers()
        }
    }, [fetchRecievers])

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        const processedList = (contextRequests ?? []).filter(request => {
            
            const matchesBloodGroup = selectedBloodGroup === 'all' || request.blood_group === selectedBloodGroup;
            
            const locationMatch = request.location 
                ? request.location.toLowerCase().includes(searchLocation.toLowerCase())
                : false;
                
            const matchesEmergency = !showEmergencyOnly || request.is_emergency;

            const matchesDueDate = !minDueDate || (request.deadline && request.deadline >= minDueDate);
            
            
            const isFutureOrToday = !request.due_date || request.due_date >= today;

            return matchesBloodGroup && locationMatch && matchesEmergency && matchesDueDate && isFutureOrToday;
        });

        setFilteredRequests(processedList);
    }, [contextRequests, selectedBloodGroup, searchLocation, showEmergencyOnly, minDueDate]);

    const handleCancelRequest = async (requestId) => {
        setRequestToDelete(requestId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;

        setIsCancelling(requestToDelete);
        setShowDeleteConfirm(false);
        
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required to cancel request.');
            setIsCancelling(null);
            setRequestToDelete(null);
            return;
        }

        try {
            console.log("Cancelling request with ID:", requestToDelete);
            
            await axios.delete(`${API_BASE_URL}/api/request/cancel/${requestToDelete}`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            toast.success('Blood request cancelled successfully!');

            await fetchRecievers();

        } catch (error) {
            console.error("Error cancelling request:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to cancel request. Please try again.');
        } finally {
            setIsCancelling(null);
            setRequestToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setRequestToDelete(null);
    };

    const handleCopyPhone = (phoneNumber) => {
        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                toast.success('Phone number copied!');
            })
            .catch(() => {
                toast.error('Failed to copy phone number');
            });
    };

    if (recieverLoading) {
        return <Loading text="Loading blood requests" />
    }

    if (recieverError) {
        return <div className="text-center py-12 text-lg font-semibold text-red-600">Error fetching requests: {recieverError}</div>
    }

    return (
        <div className="space-y-6">
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Confirm Cancellation</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this blood request? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                No, Keep it
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                            >
                                Yes, Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Blood Requests</h2>

                <div className="rounded-2xl bg-white p-4 shadow-md flex flex-wrap gap-4 items-center">
                    <Filter className="h-5 w-5 text-gray-500" />
                    
                    <select
                        value={selectedBloodGroup}
                        onChange={(e) => setSelectedBloodGroup(e.target.value)}
                        className="rounded-lg text-black bg-gray-300 border border-gray-300 px-3 py-1.5 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                    >
                        {bloodGroups.map(group => (
                            <option key={group} value={group}>
                                {group === 'all' ? 'All Groups' : group}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Location..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="rounded-lg text-black bg-gray-300 border border-gray-300 px-3 py-1.5 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 w-32 sm:w-auto"
                    />

                    <input
                        type="date"
                        value={minDueDate}
                        onChange={(e) => setMinDueDate(e.target.value)}
                        className="rounded-lg border text-black bg-gray-300 px-3 py-1.5 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 w-32 sm:w-auto"
                        title="Filter by Minimum Due Date"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="emergencyFilter"
                            checked={showEmergencyOnly}
                            onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-400 bg-gray-300 text-black
                   focus:ring-2 focus:ring-gray-400
                   checked:bg-gray-300 checked:text-black"
                        />
                        <label
                            htmlFor="emergencyFilter"
                            className="cursor-pointer text-sm font-medium text-gray-700"
                        >
                            Emergency
                        </label>
                    </div>

                </div>
            </div>

            <div className="text-sm text-gray-600">
                {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
            </div>

            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-lg text-gray-600">No blood requests found matching your filters.</p>
                    </div>
                ) : (
                    filteredRequests.map((request) => {
                        const isCurrentUserRequest = request.email === currentUserEmail;

                        const reqId = request.requestId; 
                        const currentlyCancelling = isCancelling === reqId;
                        const dueDate = request.deadline ? new Date(request.deadline).toLocaleDateString
                        ('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        }) : '';


                        return (
                          <div
    key={reqId}
    className={`group relative overflow-hidden rounded-2xl border-l-4 p-6 shadow-md transition-all duration-300 hover:shadow-xl ${
        request.is_emergency
            ? 'border-[#e50914] bg-gradient-to-br from-red-500 to-white'
            : 'border-red-500 bg-gradient-to-br from-red-50 to-white'
    }`}
>
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
            {/* Badge Section */}
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-lg bg-[#e50914] px-4 py-1.5 text-xl font-black text-white shadow-sm">
                    {request.blood_group}
                </span>
                {request.is_emergency && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5" />
                        EMERGENCY
                    </span>
                )}
            </div>

            {/* Requester Info */}
            <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    {request.user_name || request.requester}
                    {isCurrentUserRequest && (
                        <span className="ml-2 inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                            Your Request
                        </span>
                    )}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                    {request.timePosted || 'Recently posted'}
                </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                    <Phone className="h-4 w-4 text-[#e50914]" />
                    <span>{request.phone_number || request.contact}</span>
                    <button
                        onClick={() => handleCopyPhone(request.phone_number || request.contact)}
                        className="ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#e50914] transition-colors"
                        title="Copy phone number"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                </div>
                
                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                    <MapPin className="h-4 w-4 text-[#e50914]" />
                    <span className="truncate">{request.location}</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100 md:col-span-2">
                    <Calendar className="h-4 w-4 text-[#e50914]" />
                    <span>Needed by: <span className="font-bold text-gray-900">{dueDate}</span></span>
                </div>
            </div>
        </div>

        {/* Action Button */}
        {isCurrentUserRequest && (
            <div className="flex items-center justify-end sm:block">
                <button
                    onClick={() => handleCancelRequest(reqId)}
                    disabled={currentlyCancelling}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {currentlyCancelling ? (
                        <span className="flex items-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            Cancelling...
                        </span>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                            Cancel Request
                        </>
                    )}
                </button>
            </div>
        )}
    </div>
</div>
                        );
                    })
                )}
            </div>
        </div>
    )
}