import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GoBackButton from '../../components/GoBackButton';
import { API_BASE_URL } from '../../config/api';

const BASE_URL = `${API_BASE_URL}/api/marketplace`;

export default function MyMarketplacePosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`${BASE_URL}/my-posts`, config);
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error('Error fetching my posts:', error);
            toast.error('Failed to load your posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${BASE_URL}/${id}`, config);
            toast.success('Post deleted');
            setPosts(posts.filter(p => p._id !== id));
        } catch (error) {
            toast.error('Failed to delete post');
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
                            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Posts</h1>
                            <p className="mt-1 text-sm text-gray-600">Manage your marketplace listings</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <span className="loading loading-spinner loading-lg text-[#e50914]"></span>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-100">
                            <h3 className="text-xl text-gray-500 font-medium">You haven't posted any items</h3>
                            <button onClick={() => navigate('/marketplace/create')} className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none mt-4">
                                Add Post
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map(post => (
                                <div key={post._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start">
                                            <h2 className="card-title text-lg font-bold text-gray-800">{post.title}</h2>
                                            <div className="flex flex-col gap-1">
                                                {post.preOrderEnabled && (
                                                    <div className="badge badge-info text-white">Pre-Order</div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-2">৳ {post.price} • {post.category}</p>

                                        {post.preOrderEnabled && post.preOrders && post.preOrders.length > 0 && (
                                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-2 border border-blue-200">
                                                <strong>Pre-Orders: {post.preOrders.length}</strong>
                                                <p className="text-xs mt-1">Click "View" to manage pre-orders</p>
                                            </div>
                                        )}

                                        <div className="card-actions justify-end mt-4 border-t pt-4">
                                            <button
                                                onClick={() => navigate(`/marketplace/${post._id}`)}
                                                className="btn btn-sm btn-outline border-gray-300"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                className="btn btn-sm btn-error text-white"
                                            >
                                                Delete
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
