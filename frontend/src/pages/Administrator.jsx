import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Calendar, MessageSquare, Building2, UserCheck, Clock, CheckCircle, XCircle, Plus, Trash2, ChevronDown, ChevronUp, UserMinus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GoBackButton from '../components/GoBackButton';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const BACKEND_URL = `${API_BASE_URL}/api/administrator/dashboard`;
const ADMIN_REQUESTS_URL = `${API_BASE_URL}/api/administrator/admin-requests`;
const SOCIETIES_URL = `${API_BASE_URL}/api/administrator/societies`;

export default function Administrator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [adminRequests, setAdminRequests] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showAddSocietyForm, setShowAddSocietyForm] = useState(false);
  const [expandedSocieties, setExpandedSocieties] = useState({});
  const [newSociety, setNewSociety] = useState({
    name: '',
    logo: '',
    coverPhoto: '',
    description: '',
    establishedYear: '',
    email: '',
    facebook: '',
    website: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchAdminRequests();
    fetchSocieties();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(BACKEND_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDashboardData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard');
      setLoading(false);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        return;
      }

      const response = await axios.get(ADMIN_REQUESTS_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAdminRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin requests:', error);
    }
  };

  const handleApproveRequest = async (requestId, societyId) => {
    try {
      setProcessingRequest(requestId);
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        `${API_BASE_URL}/api/administrator/admin-requests/approve`,
        { requestId, societyId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchAdminRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId, societyId) => {
    try {
      setProcessingRequest(requestId);
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        `${API_BASE_URL}/api/administrator/admin-requests/reject`,
        { requestId, societyId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchAdminRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const fetchSocieties = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        return;
      }

      const response = await axios.get(SOCIETIES_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSocieties(response.data.societies);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const handleAddSociety = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        SOCIETIES_URL,
        newSociety,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Society added successfully');
        setNewSociety({
          name: '',
          logo: '',
          coverPhoto: '',
          description: '',
          establishedYear: '',
          email: '',
          facebook: '',
          website: ''
        });
        setShowAddSocietyForm(false);
        fetchSocieties();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error adding society:', error);
      toast.error(error.response?.data?.message || 'Failed to add society');
    }
  };

  const handleDeleteSociety = async (societyId, societyName) => {
    if (!window.confirm(`Are you sure you want to delete "${societyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axios.delete(
        `${SOCIETIES_URL}/${societyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchSocieties();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting society:', error);
      toast.error(error.response?.data?.message || 'Failed to delete society');
    }
  };

  const toggleSocietyExpanded = (societyId) => {
    setExpandedSocieties(prev => ({
      ...prev,
      [societyId]: !prev[societyId]
    }));
  };

  const handleRemoveAdmin = async (societyId, societyName, adminEmail) => {
    if (!window.confirm(`Remove admin access for ${adminEmail} from "${societyName}"?`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        `${SOCIETIES_URL}/${societyId}/remove-admin`,
        { adminEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchSocieties();
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error(error.response?.data?.message || 'Failed to remove admin');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header showMenuButton={false} />
        <main className="container mx-auto flex flex-1 items-center justify-center p-4">
          <div className="text-2xl font-bold text-gray-700">Loading Dashboard...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header showMenuButton={false} />
        <main className="container mx-auto flex flex-1 items-center justify-center p-4">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-lg text-gray-700">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 rounded-lg bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-2 font-bold text-white transition hover:shadow-lg"
            >
              Back to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Societies',
      value: dashboardData?.totalSocieties || 0,
      icon: Building2,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Events',
      value: dashboardData?.totalEvents || 0,
      icon: Calendar,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Feedback',
      value: dashboardData?.totalFeedback || 0,
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header showMenuButton={false} handlelogout={handleLogout} />

      <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <GoBackButton />
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-r from-[#e50914] to-[#b00020] p-3 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
                    Administrator Dashboard
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Manage your CampusConnect platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('societies')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                activeTab === 'societies'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-5 w-5" />
              Society
              {adminRequests.length > 0 && (
                <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-gray-900">
                  {adminRequests.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    >
                      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-1 text-sm font-medium text-gray-600">{stat.title}</h3>
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">System Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Shield className="h-6 w-6 text-[#e50914]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Role</p>
                      <p className="font-semibold text-gray-900">System Administrator</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Access Level</p>
                      <p className="font-semibold text-gray-900">Full Access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Platform</p>
                      <p className="font-semibold text-gray-900">CampusConnect - IUT Portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'societies' && (
            <div className="space-y-8">
              {/* Add Society Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddSocietyForm(!showAddSocietyForm)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#e50914] to-[#b00020] px-4 py-2 font-semibold text-white transition hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  {showAddSocietyForm ? 'Cancel' : 'Add Society'}
                </button>
              </div>

              {/* Add New Society Form */}
              {showAddSocietyForm && (
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                  <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <Plus className="h-7 w-7 text-[#e50914]" />
                    Add New Society
                  </h3>
                  <form onSubmit={handleAddSociety} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Society Name *</label>
                        <input
                          type="text"
                          required
                          value={newSociety.name}
                          onChange={(e) => setNewSociety({ ...newSociety, name: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="Enter society name"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Logo URL *</label>
                        <input
                          type="url"
                          required
                          value={newSociety.logo}
                          onChange={(e) => setNewSociety({ ...newSociety, logo: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Cover Photo URL</label>
                        <input
                          type="url"
                          value={newSociety.coverPhoto}
                          onChange={(e) => setNewSociety({ ...newSociety, coverPhoto: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Established Year</label>
                        <input
                          type="number"
                          value={newSociety.establishedYear}
                          onChange={(e) => setNewSociety({ ...newSociety, establishedYear: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                        <input
                          type="email"
                          value={newSociety.email}
                          onChange={(e) => setNewSociety({ ...newSociety, email: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="society@example.com"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Facebook</label>
                        <input
                          type="url"
                          value={newSociety.facebook}
                          onChange={(e) => setNewSociety({ ...newSociety, facebook: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="https://facebook.com/society"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Website</label>
                        <input
                          type="url"
                          value={newSociety.website}
                          onChange={(e) => setNewSociety({ ...newSociety, website: e.target.value })}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                          placeholder="https://society.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Description *</label>
                      <textarea
                        required
                        value={newSociety.description}
                        onChange={(e) => setNewSociety({ ...newSociety, description: e.target.value })}
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition focus:border-[#e50914] focus:outline-none"
                        rows="4"
                        placeholder="Enter society description"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-3 font-bold text-white transition hover:shadow-xl"
                    >
                      Create Society
                    </button>
                  </form>
                </div>
              )}

              {/* All Societies Section */}
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Building2 className="h-7 w-7 text-[#e50914]" />
                  All Societies ({societies.length})
                </h3>
                
                {societies.length === 0 ? (
                  <div className="py-12 text-center">
                    <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">No societies yet</p>
                    <p className="mt-2 text-sm text-gray-600">Add your first society to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Society</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Followers</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admins</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {societies.map((society) => (
                          <React.Fragment key={society._id}>
                            <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-lg border-2 border-gray-200 bg-white overflow-hidden">
                                    {society.logo && society.logo.trim() !== '' && !society.logo.includes('placeholder') ? (
                                      <img
                                        src={society.logo}
                                        alt={society.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-white"></div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{society.name}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{society.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-gray-700">
                                {society.memberCount || 0}
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  onClick={() => toggleSocietyExpanded(society._id)}
                                  className="flex items-center gap-1 text-sm font-semibold text-[#e50914] transition hover:underline"
                                >
                                  {society.admins?.length || 0} admin{(society.admins?.length || 0) !== 1 ? 's' : ''}
                                  {expandedSocieties[society._id] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteSociety(society._id, society.name)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </td>
                            </tr>
                            {expandedSocieties[society._id] && (
                              <tr className="bg-gray-50">
                                <td colSpan="5" className="px-4 py-4">
                                  <div className="ml-16">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-700">Society Admins:</h4>
                                    {society.admins && society.admins.length > 0 ? (
                                      <div className="space-y-2">
                                        {society.admins.map((adminEmail, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2"
                                          >
                                            <div className="flex items-center gap-2">
                                              <UserCheck className="h-4 w-4 text-green-600" />
                                              <span className="text-sm text-gray-700">{adminEmail}</span>
                                            </div>
                                            <button
                                              onClick={() => handleRemoveAdmin(society._id, society.name, adminEmail)}
                                              className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-orange-600"
                                            >
                                              <UserMinus className="h-3 w-3" />
                                              Remove Admin
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No admins assigned yet</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Admin Requests Section */}
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <UserCheck className="h-7 w-7 text-[#e50914]" />
                  Pending Society Admin Requests
                </h3>
                
                {adminRequests.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                    <p className="text-lg font-semibold text-gray-900">No pending admin requests</p>
                    <p className="mt-2 text-sm text-gray-600">All requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminRequests.map((request) => (
                      <div
                        key={request.requestId}
                        className="rounded-xl border-2 border-gray-100 bg-white p-6 transition-all hover:border-[#e50914] hover:shadow-xl"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex flex-1 items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="h-16 w-16 rounded-lg border-2 border-gray-200 bg-white overflow-hidden shadow-md">
                                {request.societyLogo && request.societyLogo.trim() !== '' && !request.societyLogo.includes('placeholder') ? (
                                  <img
                                    src={request.societyLogo}
                                    alt={request.societyName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-white"></div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="mb-1 text-lg font-bold text-gray-900">
                                {request.societyName}
                              </h4>
                              <p className="mb-2 text-gray-700">
                                <span className="font-semibold">Requester:</span> {request.userName}
                              </p>
                              <p className="mb-2 text-sm text-gray-600">
                                <span className="font-semibold">Email:</span> {request.userEmail}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Requested on {new Date(request.requestedAt).toLocaleDateString()} at{' '}
                                  {new Date(request.requestedAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 lg:flex-col">
                            <button
                              onClick={() => handleApproveRequest(request.requestId, request.societyId)}
                              disabled={processingRequest === request.requestId}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.requestId, request.societyId)}
                              disabled={processingRequest === request.requestId}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
