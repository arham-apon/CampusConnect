import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from '../config/api';

export default function ProfileSidebar({ user, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        user_name: "",
        phone_number: "",
        image: "",
        gender: "",
        dept: "",
        batch: "",
        student_id: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrl, setImageUrl] = useState("");

    // Check if user already has a gender set in the database
    const hasExistingGender = !!user?.gender;

    useEffect(() => {
        if (user) {
            setFormData({
                user_name: user.user_name || "",
                phone_number: user.phone_number || "",
                image: user.image || "",
                gender: user.gender || "",
                dept: user.dept || "",
                batch: user.batch || "",
                student_id: user.student_id || "",
            });
            setImageUrl(user.image || "");
            setImagePreview(user.image || null);
        }
    }, [user, isOpen]);

    const uploadToImgBB = async (base64Image) => {
        setIsUploadingImage(true);
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=0f10a53e4adf77920126b0d4c1685fdb`, {
                method: 'POST',
                body: new URLSearchParams({
                    image: base64Image
                })
            });
            const data = await response.json();
            if (data.success) {
                const uploadedUrl = data.data.url;
                setImageUrl(uploadedUrl);
                setFormData(prev => ({ ...prev, image: uploadedUrl }));
                setImagePreview(uploadedUrl);
                toast.success("Image uploaded successfully!");
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('ImgBB upload error:', error);
            toast.error('Failed to upload image.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                const base64 = reader.result.split(',')[1];
                uploadToImgBB(base64);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please upload an image file');
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        const token = sessionStorage.getItem("authToken");

        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/auth/update-profile`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data.success) {
                toast.success("Profile updated successfully");
                onUpdate(res.data.user);
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-[slide-in-right_0.3s_ease-out]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
                        <p className="text-xs text-gray-500">Update your campus identity</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#e50914] to-[#b00020] p-1 shadow-lg">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-300">
                                            {formData.user_name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <label htmlFor="profile-image-input" className="absolute bottom-0 right-0 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:text-[#b00020] cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </label>
                            <input id="profile-image-input" type="file" accept="image/*" onChange={handleFileInput} disabled={isUploadingImage} className="hidden" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-800">{user?.email}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Display Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#b00020] outline-none transition-all"
                                value={formData.user_name}
                                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                            />
                        </div>

                        {/* Student ID Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Student ID</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#b00020] outline-none transition-all"
                                value={formData.student_id}
                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                placeholder="e.g., 210041XXX"
                            />
                        </div>

                        {/* Department Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Department</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#b00020] outline-none transition-all"
                                value={formData.dept}
                                onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                                placeholder="e.g., CSE, EEE, MCE"
                            />
                        </div>

                        {/* Batch Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Batch</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#b00020] outline-none transition-all"
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                placeholder="e.g., 2021, 2022"
                            />
                        </div>

                        {/* Gender Field - Locked if exists */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Gender</label>
                            {hasExistingGender ? (
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-500 uppercase">{formData.gender}</span>
                                    <span className="ml-auto text-[10px] text-gray-400 font-medium italic">Verified</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {["Male", "Female"].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: option })}
                                            className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${formData.gender === option
                                                    ? "bg-red-50 border-[#e50914] text-[#e50914]"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+88</span>
                                <input
                                    type="tel"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#b00020] outline-none transition-all"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <button
                        disabled={isLoading || isUploadingImage}
                        onClick={handleUpdate}
                        className="w-full bg-gradient-to-r from-[#e50914] to-[#b00020] text-white py-3.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : isUploadingImage ? (
                            <span>Uploading Image...</span>
                        ) : (
                            "Save Profile"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}