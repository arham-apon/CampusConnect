import { X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { AuthContext } from '../../../../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../../../../config/api';

export default function AddDonorModal({ isOpen, onClose, onSubmit, donorToEdit }) {

    const { User } = AuthContext()

    const isUpdateMode = !!donorToEdit;

    const getInitialFormData = (user, donor) => {
        return {
            blood_group: donor?.blood_group || '',
            phone_number: donor?.phone_number || user?.phone_number || user?.user?.phone_number || '',
            last_donated: donor?.last_donated?.split('T')[0] || '',
            location: donor?.location || '',
        };
    };

    const [formData, setFormData] = useState(() => getInitialFormData(User, donorToEdit));
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData(User, donorToEdit));
            setStatusMessage({ message: '', type: '' });
            setIsSubmitting(false);
        }
    }, [isOpen, donorToEdit, User]);


    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setStatusMessage({ message: '', type: '' });
    }

    const handleSubmit = async (e) => {
        console.log('hoist')
        e.preventDefault()
        setStatusMessage({ message: '', type: '' });
        setIsSubmitting(true);

        const endpoint = isUpdateMode
            ? `${API_BASE_URL}/api/donor/update`
            : `${API_BASE_URL}/api/donor/register`;

        const method = isUpdateMode ? axios.put : axios.post;

        const token = sessionStorage.getItem('authToken');
        if (!token) {
            setStatusMessage({ message: 'Authentication required. Please log in again.', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await method(endpoint, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setStatusMessage({ message: response.data.message || 'Success!', type: 'success' });

            if (onSubmit) {
                await onSubmit();
            }

            setTimeout(() => {
                onClose()
            }, 500);

        } catch (error) {
            const message = error.response?.data?.message || `Failed to ${isUpdateMode ? 'update' : 'register'}.`;
            setStatusMessage({ message, type: 'error' });
            console.error(`${isUpdateMode ? 'Update' : 'Registration'} failed:`, message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const modalTitle = isUpdateMode ? "Update Donor Profile" : "Add New Donor Details";
    const buttonText = isUpdateMode ? (isSubmitting ? 'Updating...' : 'Update Donor') : (isSubmitting ? 'Registering...' : 'Register Donor');


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-[#e50914]">{modalTitle}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        disabled={isSubmitting}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {statusMessage.message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'
                        }`}>
                        {statusMessage.message}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Blood Group
                        </label>
                        <select
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                            required
                        >
                            <option value="">--- Select Group ---</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="e.g. 1234567890"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Last Donation Date
                        </label>
                        <input
                            type="date"
                            name="last_donated"
                            value={formData.last_donated}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Area"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border-2 border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-full bg-gradient-to-r from-[#e50914] to-[#b00020] py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}