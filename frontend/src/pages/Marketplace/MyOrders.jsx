import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GoBackButton from '../../components/GoBackButton';
import { API_BASE_URL } from '../../config/api';

const BASE_URL = `${API_BASE_URL}/api/marketplace`;

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`${BASE_URL}/my-orders`, config);
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error('Error fetching my orders:', error);
            toast.error('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Header showMenuButton={false} />
            <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center gap-4">
                        <GoBackButton />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Orders</h1>
                            <p className="mt-1 text-sm text-gray-600">Track your pre-orders and purchases</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <span className="loading loading-spinner loading-lg text-[#e50914]"></span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-100">
                            <h3 className="text-xl text-gray-500 font-medium">You haven't made any orders yet</h3>
                            <button onClick={() => navigate('/marketplace')} className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none mt-4">
                                Browse Marketplace
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orders.map(order => (
                                <div key={order.postId} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                    {order.images && order.images.length > 0 ? (
                                        <figure className="h-48 bg-gray-100">
                                            <img 
                                                src={order.images[0]} 
                                                alt={order.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </figure>
                                    ) : (
                                        <figure className="h-48 bg-gray-100 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                        </figure>
                                    )}
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="card-title text-lg font-bold text-gray-800">{order.title}</h2>
                                            <span className="badge badge-sm bg-red-50 text-[#8b0018] border-[#8b0018]">{order.category}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-[#8b0018] mb-3">৳ {order.price}</p>

                                        {order.preOrder && (
                                            <div className="mb-3">
                                                {order.preOrder.collected ? (
                                                    <div className="space-y-2">
                                                        <div className="badge badge-success w-full py-3 gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                            Order Collected
                                                        </div>
                                                        {order.preOrder.collectedAt && (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
                                                                <p className="text-green-800 font-medium">
                                                                    Confirmed on: {new Date(order.preOrder.collectedAt).toLocaleDateString()} at {new Date(order.preOrder.collectedAt).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : order.preOrder.verified ? (
                                                    order.productStatus === 'ready' ? (
                                                        <div className="space-y-2">
                                                            <div className="badge badge-success w-full py-3 gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                </svg>
                                                                Ready for Collection
                                                            </div>
                                                            {order.collectionLocation && (
                                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                                                    <p className="font-semibold text-green-900 mb-1 flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                        </svg>
                                                                        Collection Point:
                                                                    </p>
                                                                    <p className="text-gray-700 text-xs">{order.collectionLocation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="badge badge-info w-full py-3 gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            Preparing Order
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="badge badge-warning w-full py-3 gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        Pending Verification
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="card-actions justify-end mt-auto border-t pt-4">
                                            <button
                                                onClick={() => navigate(`/marketplace/${order.postId}`)}
                                                className="btn btn-sm bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none w-full"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
