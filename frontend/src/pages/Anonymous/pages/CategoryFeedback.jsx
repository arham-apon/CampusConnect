// src/pages/CategoryFeedback.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFeedbackByCategory } from "../api/feedbackApi";
import FeedbackList from "../Components/FeedbackList";
import FeedbackModal from "../Components/FeedbackModal";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import GoBackButton from "../../../components/GoBackButton";
import Loading from "../../../components/Loading";

export default function CategoryFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { category } = useParams();

    useEffect(() => {
        setIsLoading(true);
        getFeedbackByCategory(category)
            .then(res => {
                setFeedbacks(res.data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [category]);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Header showMenuButton={false} />

            <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <GoBackButton />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{category}</h1>
                                <p className="mt-1 text-sm text-gray-600">View all feedback for this category</p>
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

                    {isLoading ? (
                        <Loading text="Loading feedback" />
                    ) : (
                        <FeedbackList feedbacks={feedbacks} />
                    )}
                </div>
            </main>

            <Footer />
            
            <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
