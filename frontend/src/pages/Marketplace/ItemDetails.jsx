import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GoBackButton from '../../components/GoBackButton';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

const BASE_URL = `${API_BASE_URL}/api/marketplace`;

export default function MarketplaceItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { User } = AuthContext();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(null); // Track which pre-order is being verified
    const [collectLoading, setCollectLoading] = useState(null); // Track which pre-order is being marked collected
    const [markReadyLoading, setMarkReadyLoading] = useState(false);
    const [togglePreOrderLoading, setTogglePreOrderLoading] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [userPreOrder, setUserPreOrder] = useState(null);
    const [showPreOrderModal, setShowPreOrderModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [collectionLocation, setCollectionLocation] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const currentUserId = User?.users_id;

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`${BASE_URL}/${id}`, config);
            if (res.data.success) {
                setPost(res.data.post);
                // Check if user has a pre-order
                if (res.data.post.preOrders) {
                    const myPreOrder = res.data.post.preOrders.find(po => po.userId === currentUserId);
                    setUserPreOrder(myPreOrder);
                }
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            toast.error('Failed to load item details');
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handlePreOrderSubmit = async (e) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            toast.error('Please enter your bKash transaction ID');
            return;
        }
        
        // Validate size if size specifications exist
        if (post.sizeSpecifications && post.sizeSpecifications.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }

        if (quantity < 1) {
            toast.error('Quantity must be at least 1');
            return;
        }

        try {
            setActionLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = { 
                transactionId,
                selectedSize: selectedSize || null,
                quantity: quantity
            };

            const res = await axios.post(`${BASE_URL}/${id}/pre-order`, payload, config);
            if (res.data.success) {
                toast.success('Pre-order submitted successfully! Waiting for verification.');
                fetchPost(); // Refresh to get updated data
                setTransactionId('');
                setSelectedSize('');
                setQuantity(1);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit pre-order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyPreOrder = async (preOrderId) => {
        try {
            setVerifyLoading(preOrderId);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${BASE_URL}/${id}/pre-order/${preOrderId}/verify`, {}, config);
            toast.success('Pre-order verified!');
            fetchPost(); // Refresh to get updated data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify pre-order');
        } finally {
            setVerifyLoading(null);
        }
    };

    const handleMarkCollected = async (preOrderId, isCollected) => {
        try {
            setCollectLoading(preOrderId);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${BASE_URL}/${id}/pre-order/${preOrderId}/collect`, {}, config);
            toast.success(isCollected ? 'Marked as not collected' : 'Marked as collected!');
            fetchPost(); // Refresh to get updated data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update collection status');
        } finally {
            setCollectLoading(null);
        }
    };

    const handleMarkReady = async () => {
        setShowCollectionModal(true);
    };

    const handleSubmitCollection = async (e) => {
        e.preventDefault();
        if (!collectionLocation.trim()) {
            toast.error('Please enter collection location');
            return;
        }
        try {
            setMarkReadyLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${BASE_URL}/${id}/mark-ready`, { collectionLocation }, config);
            toast.success('Product marked as ready!');
            setShowCollectionModal(false);
            setCollectionLocation('');
            fetchPost(); // Refresh to get updated data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark product as ready');
        } finally {
            setMarkReadyLoading(false);
        }
    };

    const handleTogglePreOrder = async () => {
        try {
            setTogglePreOrderLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${BASE_URL}/${id}/toggle-preorder`, {}, config);
            toast.success(res.data.message);
            fetchPost(); // Refresh to get updated data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update pre-order status');
        } finally {
            setTogglePreOrderLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
                <Header showMenuButton={false} />
                <main className="flex-1 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-[#e50914]"></span>
                </main>
                <Footer />
            </div>
        );
    }

    if (!post) return null;

    // Ensure both IDs are compared as numbers to avoid type mismatch
    const isSeller = Number(currentUserId) === Number(post.sellerId);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Header showMenuButton={false} />
            <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6">
                        <GoBackButton />
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* Image Section */}
                        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8 min-h-[300px]">
                            {post.images && post.images.length > 0 ? (
                                <img src={post.images[0]} alt={post.title} className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <span>No image provided</span>
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="md:w-1/2 p-6 lg:p-10 flex flex-col">
                            <div className="mb-2 flex justify-between items-start">
                                <span className="badge bg-red-50 text-[#8b0018] border-[#8b0018]">{post.category}</span>
                                <div className="flex gap-2 items-center">
                                    {isSeller && (
                                        <button
                                            onClick={() => navigate(`/marketplace/edit/${id}`)}
                                            className="btn btn-sm btn-ghost text-[#8b0018] hover:bg-red-50"
                                            title="Edit post"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                    <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                                {isSeller && post.preOrderEnabled && post.productStatus !== 'ready' && (
                                    <button
                                        onClick={handleMarkReady}
                                        className="btn btn-sm btn-info text-white ml-2"
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {isSeller && post.preOrderEnabled && post.productStatus === 'ready' && (
                                    <span className="badge badge-success ml-2">Product Ready</span>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-[#8b0018] mb-6">৳ {post.price}</div>

                            <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-line flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                <p>{post.description}</p>
                            </div>

                            {/* Size Specifications Display */}
                            {post.sizeSpecifications && post.sizeSpecifications.length > 0 && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                        </svg>
                                        Available Sizes
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {post.sizeSpecifications.map((spec, index) => (
                                            <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                                                <div>
                                                    <span className="font-bold text-lg text-gray-900">{spec.size}</span>
                                                    <p className="text-sm text-gray-600 mt-1">{spec.measurement}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold w-32">Username:</span>
                                    <span>{post.sellerUsername || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold w-32">Email:</span>
                                    <a href={`mailto:${post.sellerEmail}`} className="text-[#8b0018] hover:underline">
                                        {post.sellerEmail || 'N/A'}
                                    </a>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold w-32">Department:</span>
                                    <span>{post.sellerDept || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold w-32">Batch:</span>
                                    <span>{post.sellerBatch || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold w-32">Contact:</span>
                                    <div className="flex flex-col">
                                        <a href={`tel:${post.phone_number}`} className="text-[#8b0018] font-medium hover:underline">{post.phone_number}</a>
                                        <span className="text-xs text-gray-500 mt-0.5">(WhatsApp available)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto border-t pt-6">
                                {post.preOrderEnabled ? (
                                    // Pre-order flow
                                    <>
                                        {isSeller ? (
                                            // Seller view - show button to open pre-orders modal
                                            <div className="space-y-3">                                                {post.productStatus === 'ready' && post.collectionLocation && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                                                        <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                            </svg>
                                                            Collection Location Set:
                                                        </p>
                                                        <p className="text-gray-700 text-sm">{post.collectionLocation}</p>
                                                    </div>
                                                )}
                                                {post.preOrderStopped && (
                                                    <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-3">
                                                        <p className="font-semibold text-orange-900 text-sm flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            Pre-orders are currently stopped
                                                        </p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setShowPreOrderModal(true)}
                                                    className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none w-full shadow-lg"
                                                >
                                                    View Pre-Orders ({post.preOrders?.length || 0})
                                                </button>
                                                <button
                                                    onClick={handleTogglePreOrder}
                                                    disabled={togglePreOrderLoading}
                                                    className={`btn btn-outline w-full ${
                                                        post.preOrderStopped 
                                                            ? 'btn-success' 
                                                            : 'btn-warning'
                                                    }`}
                                                >
                                                    {togglePreOrderLoading ? (
                                                        <span className="loading loading-spinner loading-sm"></span>
                                                    ) : post.preOrderStopped ? (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            Resume Pre-Orders
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            Stop Pre-Orders
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : userPreOrder ? (
                                            // User has submitted a pre-order
                                            <div className="space-y-3">
                                                {userPreOrder.collected ? (
                                                    // Order marked as collected by seller
                                                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                                                        <div className="font-bold flex items-center justify-center gap-2 mb-3">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                            Order Collected!
                                                        </div>
                                                        <p className="text-sm text-center mb-2">
                                                            This order has been marked as collected.
                                                        </p>
                                                        {userPreOrder.collectedAt && (
                                                            <p className="text-xs text-center text-green-600 font-medium">
                                                                Collected on: {new Date(userPreOrder.collectedAt).toLocaleString()}
                                                            </p>
                                                        )}
                                                        <div className="bg-white border border-green-300 rounded-lg p-3 mt-3">
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">Transaction ID:</span> 
                                                                <span className="font-mono ml-1">{userPreOrder.transactionId}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : userPreOrder.verified && post.productStatus === 'ready' ? (
                                                    // Product is verified and ready - show collection notice only
                                                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                                                        <div className="font-bold flex items-center justify-center gap-2 mb-3">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            Product Ready for Collection!
                                                        </div>
                                                        <p className="text-sm text-center mb-3">
                                                            Your order has been verified and is ready to collect.
                                                        </p>
                                                        {post.collectionLocation && (
                                                            <div className="bg-white border border-green-300 rounded-lg p-3 mt-3">
                                                                <p className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                                    Collection Location:
                                                                </p>
                                                                <p className="text-gray-700">{post.collectionLocation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    // Still pending or preparing
                                                    <>
                                                        <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-lg p-4">
                                                            <div className="font-bold flex items-center justify-between mb-2">
                                                                <span>Pre-Order Submitted</span>
                                                                {userPreOrder.verified ? (
                                                                    <span className="badge badge-success">✓ Verified</span>
                                                                ) : (
                                                                    <span className="badge badge-warning">Pending Verification</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm mb-1">Transaction ID: <span className="font-mono font-semibold">{userPreOrder.transactionId}</span></p>
                                                            {userPreOrder.selectedSize && (
                                                                <p className="text-sm mb-1">Size: <span className="font-semibold">{userPreOrder.selectedSize}</span></p>
                                                            )}
                                                            {userPreOrder.quantity && (
                                                                <p className="text-sm mb-1">Quantity: <span className="font-semibold">{userPreOrder.quantity}</span> <span className="text-xs">(Total: ৳{(post.price * userPreOrder.quantity).toFixed(2)})</span></p>
                                                            )}
                                                            {!userPreOrder.verified && (
                                                                <p className="text-xs mt-2">Waiting for seller to verify your payment.</p>
                                                            )}
                                                        </div>
                                                        {userPreOrder.verified && (
                                                            <div className="bg-yellow-50 border-yellow-200 text-yellow-800 border rounded-lg p-4">
                                                                <div className="font-bold flex items-center justify-center gap-2 mb-1">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                    Preparing Your Order
                                                                </div>
                                                                <p className="text-sm text-center">
                                                                    The seller will notify when product is ready.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            // Pre-order form for buyers
                                            !isSeller && (
                                                post.preOrderStopped ? (
                                                    // Pre-orders stopped message
                                                    <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 text-orange-900">
                                                        <div className="font-bold flex items-center justify-center gap-2 mb-2">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            Pre-Orders Closed
                                                        </div>
                                                        <p className="text-sm text-center">
                                                            The seller is no longer accepting pre-orders for this item.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handlePreOrderSubmit} className="space-y-3">
                                                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-blue-900">
                                                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                Pre-Order Available
                                                            </h3>
                                                            <p className="text-sm">Pay ৳{post.price} via bKash to <strong>{post.phone_number}</strong>, then enter your transaction ID below.</p>
                                                        </div>

                                                        {/* Size Selection */}
                                                        {post.sizeSpecifications && post.sizeSpecifications.length > 0 && (
                                                            <div className="form-control">
                                                                <label className="label">
                                                                    <span className="label-text font-medium">Select Size</span>
                                                                </label>
                                                                <select
                                                                    value={selectedSize}
                                                                    onChange={(e) => setSelectedSize(e.target.value)}
                                                                    className="select select-bordered focus:border-[#8b0018] w-full"
                                                                    required
                                                                >
                                                                    <option value="">Choose a size...</option>
                                                                    {post.sizeSpecifications.map((spec, index) => (
                                                                        <option key={index} value={spec.size}>
                                                                            {spec.size} - {spec.measurement}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        {/* Quantity Selection */}
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text font-medium">Quantity</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={quantity}
                                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                                                className="input input-bordered focus:border-[#8b0018] w-full"
                                                                required
                                                            />
                                                            <label className="label">
                                                                <span className="label-text-alt text-gray-500">Total: ৳{(post.price * quantity).toFixed(2)}</span>
                                                            </label>
                                                        </div>

                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text font-medium">bKash Transaction ID</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={transactionId}
                                                                onChange={(e) => setTransactionId(e.target.value)}
                                                                placeholder="Enter transaction ID"
                                                                className="input input-bordered focus:border-[#8b0018] w-full"
                                                                required
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={actionLoading}
                                                            className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none w-full shadow-lg"
                                                        >
                                                            {actionLoading ? <span className="loading loading-spinner"></span> : 'Submit Pre-Order'}
                                                        </button>
                                                    </form>
                                                )
                                            )
                                        )}
                                    </>
                                ) : (
                                    // Regular item - contact seller directly
                                    <div className="text-center text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        {isSeller ? (
                                            <div>
                                                <p className="font-medium mb-1">You are the seller of this item</p>
                                                <p className="text-sm text-gray-600">Buyers will contact you directly via phone to arrange payment and meet-up</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium mb-2 text-[#8b0018]">Contact seller to arrange purchase</p>
                                                <p className="text-sm text-gray-600">Contact the seller using the phone number above to discuss payment and meet-up location</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </main>

            {/* Pre-Order Modal */}
            {showPreOrderModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-4xl">
                        <h3 className="font-bold text-xl mb-4 text-gray-900">Pre-Order Management</h3>
                        
                        {post.preOrders && post.preOrders.length > 0 ? (
                            (() => {
                                // Filter pre-orders based on search query
                                const filteredPreOrders = post.preOrders.filter(preOrder => {
                                    if (!searchQuery.trim()) return true;
                                    const query = searchQuery.toLowerCase();
                                    const userName = (preOrder.userName || '').toLowerCase();
                                    const userEmail = (preOrder.userEmail || '').toLowerCase();
                                    const transactionId = (preOrder.transactionId || '').toLowerCase();
                                    return userName.includes(query) || userEmail.includes(query) || transactionId.includes(query);
                                });
                                
                                return (
                            <>
                                {/* Search Bar */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or transaction ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="input input-bordered w-full pl-10 pr-10 focus:border-[#8b0018]"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                title="Clear search"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {searchQuery && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Found {filteredPreOrders.length} of {post.preOrders.length} orders
                                        </p>
                                    )}
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">{post.preOrders.length}</p>
                                        <p className="text-xs text-gray-600">Total Orders</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {post.preOrders.filter(po => po.verified).length}
                                        </p>
                                        <p className="text-xs text-gray-600">Verified</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {post.preOrders.filter(po => po.collected).length}
                                        </p>
                                        <p className="text-xs text-gray-600">Collected</p>
                                    </div>
                                </div>

                                {/* Orders List */}
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                    {filteredPreOrders.length > 0 ? (
                                        filteredPreOrders.map(preOrder => (
                                        <div 
                                            key={preOrder._id} 
                                            className={`p-4 rounded-lg border-2 ${
                                                preOrder.collected 
                                                    ? 'bg-green-50 border-green-300' 
                                                    : preOrder.verified 
                                                        ? 'bg-blue-50 border-blue-200' 
                                                        : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-lg">{preOrder.userName}</p>
                                                            {preOrder.userEmail && (
                                                                <p className="text-xs text-gray-500">{preOrder.userEmail}</p>
                                                            )}
                                                        </div>
                                                        {preOrder.collected && (
                                                            <span className="badge badge-success badge-sm">✓ Collected</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <span className="font-medium">Transaction ID:</span> 
                                                        <span className="font-mono font-semibold ml-2 bg-white px-2 py-1 rounded">{preOrder.transactionId}</span>
                                                    </p>
                                                    {preOrder.selectedSize && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            <span className="font-medium">Size:</span> 
                                                            <span className="ml-2 font-semibold">{preOrder.selectedSize}</span>
                                                        </p>
                                                    )}
                                                    {preOrder.quantity && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            <span className="font-medium">Quantity:</span> 
                                                            <span className="ml-2 font-semibold">{preOrder.quantity}</span>
                                                            <span className="text-xs text-gray-500 ml-2">(Total: ৳{(post.price * preOrder.quantity).toFixed(2)})</span>
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Ordered: {new Date(preOrder.createdAt).toLocaleString()}
                                                    </p>
                                                    {preOrder.collected && preOrder.collectedAt && (
                                                        <p className="text-xs text-green-600 mt-1 font-medium">
                                                            Collected: {new Date(preOrder.collectedAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex flex-col gap-2">
                                                    {!preOrder.verified ? (
                                                        <button
                                                            onClick={() => handleVerifyPreOrder(preOrder._id)}
                                                            disabled={verifyLoading === preOrder._id}
                                                            className="btn btn-success btn-sm text-white"
                                                        >
                                                            {verifyLoading === preOrder._id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                'Verify Payment'
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <span className="badge badge-success">✓ Verified</span>
                                                            {post.productStatus === 'ready' && (
                                                                <button
                                                                    onClick={() => handleMarkCollected(preOrder._id, preOrder.collected)}
                                                                    disabled={collectLoading === preOrder._id}
                                                                    className={`btn btn-sm ${
                                                                        preOrder.collected 
                                                                            ? 'btn-outline btn-warning' 
                                                                            : 'btn-outline btn-primary bg-blue-50 hover:bg-blue-100'
                                                                    }`}
                                                                >
                                                                    {collectLoading === preOrder._id ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : preOrder.collected ? (
                                                                        'Undo'
                                                                    ) : (
                                                                        'Mark Collected'
                                                                    )}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                            <p className="font-medium">No orders found</p>
                                            <p className="text-sm">Try a different search term</p>
                                        </div>
                                    )}
                                </div>
                            </>
                                );
                            })()
                        ) : (
                            <p className="text-gray-600 text-center py-8">No pre-orders yet.</p>
                        )}
                        
                        <div className="modal-action">
                            <button onClick={() => {
                                setShowPreOrderModal(false);
                                setSearchQuery(''); // Reset search when closing
                            }} className="btn">Close</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowPreOrderModal(false)}></div>
                </div>
            )}

            {/* Collection Location Modal */}
            {showCollectionModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-xl mb-4 text-gray-900">Set Collection Location</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please specify where buyers can collect their orders. This will be shown to all verified pre-order customers.
                        </p>
                        
                        <form onSubmit={handleSubmitCollection}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Collection Location</span>
                                </label>
                                <textarea
                                    value={collectionLocation}
                                    onChange={(e) => setCollectionLocation(e.target.value)}
                                    placeholder="e.g., Main Campus Gate, Near Cafeteria, South Hall Room 302"
                                    className="textarea textarea-bordered focus:border-[#8b0018] h-24"
                                    required
                                />
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">Be specific so buyers can easily find you</span>
                                </label>
                            </div>
                            
                            <div className="modal-action">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCollectionModal(false);
                                        setCollectionLocation('');
                                    }}
                                    className="btn btn-ghost"
                                    disabled={markReadyLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={markReadyLoading}
                                    className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none"
                                >
                                    {markReadyLoading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        'Confirm & Mark Ready'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => !markReadyLoading && setShowCollectionModal(false)}></div>
                </div>
            )}

            <Footer />
        </div>
    );
}
