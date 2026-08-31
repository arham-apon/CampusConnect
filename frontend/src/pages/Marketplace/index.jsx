import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GoBackButton from '../../components/GoBackButton';
import { API_BASE_URL } from '../../config/api';

const CATEGORIES = [
    'All',
    'Home items',
    'Laptop, PC and PC parts',
    'Books, Study materials',
    'Bikes and cycles',
    'Clothing',
    'Others'
];

const BASE_URL = `${API_BASE_URL}/api/marketplace`;

export default function MarketplaceFeed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let url = BASE_URL;
            const params = new URLSearchParams();
            if (category !== 'All') params.append('category', category);
            if (search) params.append('search', search);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await axios.get(url, config);
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load marketplace items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []); // Re-fetch when category changes but for search only on button click or blur

    const handleSearch = () => {
        fetchPosts();
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Header showMenuButton={false} />
            <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <GoBackButton />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Campus Marketplace</h1>
                                <p className="mt-1 text-sm text-gray-600">Buy and sell items within the campus community</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/marketplace/my-orders" className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none shadow-md">
                                My Orders
                            </Link>
                            <Link to="/marketplace/my-posts" className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none shadow-md">
                                My Posts
                            </Link>
                            <Link to="/marketplace/create" className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none shadow-md">
                                + Add Post
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="input input-bordered w-full sm:w-1/2 focus:border-[#8b0018] focus:ring-[#8b0018]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="select select-bordered w-full sm:w-1/4 focus:border-[#8b0018]"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            // Wait for state to update then fetch
                            setTimeout(() => fetchPosts(), 0);
                        }}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={handleSearch}
                        className="btn bg-gradient-to-r from-[#e50914] to-[#b00020] hover:opacity-90 text-white border-none w-full sm:w-1/4"
                    >
                        Search
                    </button>
                    </div>

                    {/* Feed Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            <div className="text-center py-20 col-span-full">
                                <span className="loading loading-spinner loading-lg text-[#e50914]"></span>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 col-span-full">
                                <h3 className="text-xl text-gray-500 font-medium">No items found</h3>
                                <p className="text-gray-400 mt-2">Try adjusting your search or category filters.</p>
                            </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post._id}
                                onClick={() => navigate(`/marketplace/${post._id}`)}
                                className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
                            >
                                <figure className="h-48 bg-gray-200">
                                    {post.images && post.images.length > 0 ? (
                                        <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                </figure>
                                <div className="card-body p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="card-title text-lg font-bold text-gray-800 line-clamp-1" title={post.title}>
                                            {post.title}
                                        </h2>
                                    </div>
                                    <div className="badge badge-outline text-[#8b0018] border-[#8b0018] mb-2">{post.category}</div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 h-10">{post.description}</p>

                                    <div className="card-actions justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                        <div className="text-xl font-bold text-gray-900">৳ {post.price}</div>
                                        <button className="btn btn-sm bg-gradient-to-r from-[#e50914] to-[#b00020] text-white border-none hover:opacity-90 transition-all">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
