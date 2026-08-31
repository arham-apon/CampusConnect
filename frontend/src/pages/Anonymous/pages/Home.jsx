// src/pages/Anonymous/pages/Home.jsx
import { useState, useEffect } from "react";
import { CATEGORIES } from "../constants/categories";
import FeedbackModal from "../Components/FeedbackModal";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import GoBackButton from "../../../components/GoBackButton";
import { getAllFeedback } from "../api/feedbackApi";
import FeedbackItem from "../Components/FeedbackItem";
import { Filter, Plus, RefreshCw } from "lucide-react";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredFeedbacks(feedbacks);
        } else {
            setFilteredFeedbacks(feedbacks.filter(f => f.category === selectedCategory));
        }
    }, [selectedCategory, feedbacks]);

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
            const response = await getAllFeedback();
            setFeedbacks(response.data);
            setFilteredFeedbacks(response.data);
        } catch (error) {
            console.error("Failed to fetch feedbacks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedbackUpdate = (updatedFeedback) => {
        setFeedbacks(prev => 
            prev.map(f => f._id === updatedFeedback._id ? updatedFeedback : f)
        );
    };

    const handleFeedbackSubmitted = () => {
        setIsModalOpen(false);
        fetchFeedbacks();
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header showMenuButton={false} />

            <main className="container mx-auto flex-1 px-4 py-6 max-w-4xl">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <GoBackButton />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Anonymous Feedback</h1>
                                <p className="text-sm text-gray-600">Share and discuss campus experiences</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Feedback
                        </button>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <Filter size={18} className="text-gray-600" />
                                <div className="relative flex-1">
                                    <button
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left flex items-center justify-between text-sm font-medium text-gray-700"
                                    >
                                        <span>{selectedCategory}</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {showFilterDropdown && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setShowFilterDropdown(false)}
                                            />
                                            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-20">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory("All");
                                                        setShowFilterDropdown(false);
                                                    }}
                                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                                                        selectedCategory === "All" ? "bg-red-50 text-red-600 font-semibold" : "text-gray-700"
                                                    }`}
                                                >
                                                    All Categories
                                                </button>
                                                {CATEGORIES.map((category) => (
                                                    <button
                                                        key={category}
                                                        onClick={() => {
                                                            setSelectedCategory(category);
                                                            setShowFilterDropdown(false);
                                                        }}
                                                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                                                            selectedCategory === category ? "bg-red-50 text-red-600 font-semibold" : "text-gray-700"
                                                        }`}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <button
                                onClick={fetchFeedbacks}
                                disabled={isLoading}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh feedbacks"
                            >
                                <RefreshCw size={18} className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                            {isLoading ? (
                                "Loading..."
                            ) : (
                                `Showing ${filteredFeedbacks.length} ${filteredFeedbacks.length === 1 ? 'feedback' : 'feedbacks'}`
                            )}
                        </div>
                    </div>
                </div>

                {/* Feedbacks Feed */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <RefreshCw size={40} className="animate-spin mb-3" />
                                <p>Loading feedbacks...</p>
                            </div>
                        </div>
                    ) : filteredFeedbacks.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <svg className="h-16 w-16 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-lg font-medium">No feedbacks found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {selectedCategory === "All" 
                                        ? "Be the first to share your feedback!" 
                                        : `No feedbacks in "${selectedCategory}" category yet.`
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredFeedbacks.map((feedback) => (
                            <div key={feedback._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <FeedbackItem 
                                    feedback={feedback} 
                                    onUpdate={handleFeedbackUpdate}
                                />
                            </div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
            
            <FeedbackModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleFeedbackSubmitted}
            />
        </div>
    );
}