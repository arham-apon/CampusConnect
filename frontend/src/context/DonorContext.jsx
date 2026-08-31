import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; 
import { API_BASE_URL } from '../config/api';

const DonorContext = createContext(null);

export const useDonorContext = () => {
    return useContext(DonorContext);
};

const DonorProvider = ({ children }) => {
    const { User } = AuthContext();
    
    const currentUserEmail = User?.email || User?.user?.email;

    const [donors, setDonors] = useState([]);
    const [isRegisteredDonor, setIsRegisteredDonor] = useState(false);
    const [donorLoading, setDonorLoading] = useState(true);
    const [donorError, setDonorError] = useState(null);

    const fetchDonorsAndCheckStatus = useCallback(async () => {
        
        if (!currentUserEmail) {
            setDonorLoading(false);
            return;
        }

        setDonorLoading(true);
        setDonorError(null);
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            setDonorLoading(false);
            return;
        }
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/donor/getAllDonors`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            const donorList = response.data.donors;
            console.log('Fetched Donors:', donorList);
            
            const isDonor = donorList.some(
                donor => (donor.email || donor.user?.email || donor.contact?.email) === currentUserEmail
            );

            setDonors(donorList);
            setIsRegisteredDonor(isDonor);
            setDonorLoading(false);
            
        } catch (error) {
            setDonorError(error.response?.data?.message || 'Failed to fetch donor list');
            setDonorLoading(false);
            setDonors([]);
            setIsRegisteredDonor(false);
        }
    }, [currentUserEmail]); 
    
    const toggleDonorStatus = useCallback(async () => {
        
        if (!currentUserEmail) {
            throw new Error("Cannot toggle status: User not logged in.");
        }

        setDonorLoading(true);
        setDonorError(null);
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            setDonorLoading(false);
            throw new Error("Cannot toggle status: No authentication token found.");
        }
        
        try {
            const response = await axios.put(`${API_BASE_URL}/api/donor/toggleDonorStatus`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            await fetchDonorsAndCheckStatus(); 
            console.log('Toggled Donor Status:', response.data);
            
            return response.data;

        } catch (error) {
            setDonorLoading(false);
            const msg = error.response?.data?.message || 'Failed to toggle status';
            setDonorError(msg);
            throw new Error(msg);
        }
    }, [fetchDonorsAndCheckStatus, currentUserEmail]); 

    useEffect(() => {
        if (currentUserEmail) {
            fetchDonorsAndCheckStatus();
        } else {
            setDonors([]);
            setIsRegisteredDonor(false);
            setDonorLoading(false);
        }
    }, [currentUserEmail, fetchDonorsAndCheckStatus]);

    return (
        <DonorContext.Provider 
            value={{
                donors,
                isRegisteredDonor,
                donorLoading,
                donorError,
                fetchDonorsAndCheckStatus,
                toggleDonorStatus,
                setDonors
            }}
        >
            {children}
        </DonorContext.Provider>
    );
};

export default DonorProvider;