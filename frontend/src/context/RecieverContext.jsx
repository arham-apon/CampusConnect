import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const RecieverContext = createContext(null);

export const useRecieverContext = () => {
    return useContext(RecieverContext);
};

const RecieverProvider = ({ children }) => {
    
    const AuthContextValue = AuthContext();
    if (!AuthContextValue) {
        return null;
    }
    const { User } = AuthContextValue;
    const currentUserEmail = User?.email || User?.user?.email;

    const [recievers, setRecievers] = useState([]);
    const [recieverLoading, setRecieverLoading] = useState(true);
    const [recieverError, setRecieverError] = useState(null);

    const fetchRecievers = useCallback(async () => {
        setRecieverLoading(true);
        setRecieverError(null);
        
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            setRecieverLoading(false);
            return;
        }
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/request/all`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            const requestList = response.data.requests;
            console.log(requestList); 
            
            setRecievers(requestList); 
            setRecieverLoading(false);
            
        } catch (error) {
            setRecieverError(error.response?.data?.message || 'Failed to fetch blood requests list');
            setRecieverLoading(false);
            setRecievers([]);
        }
    }, []); 
    
    const createReciever = useCallback(async (requestData) => {
        setRecieverLoading(true);
        setRecieverError(null);
        console.log('Creating reciever with data:', requestData);
        
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            setRecieverLoading(false);
            throw new Error("Cannot create request: No authentication token found.");
        }
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/request/create`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            console.log('Reciever created:', response.data);
            
            await fetchRecievers(); 
            
            return response.data;

        } catch (error) {
            setRecieverLoading(false);
            const msg = error.response?.data?.message || 'Failed to create request';
            setRecieverError(msg);
            throw new Error(msg);
        }
    }, [fetchRecievers]); 

    useEffect(() => {
        if (currentUserEmail) {
            fetchRecievers();
        } else {
            setRecievers([]);
            setRecieverLoading(false);
        }
    }, [currentUserEmail, fetchRecievers]);

    return (
        <RecieverContext.Provider 
            value={{
                recievers,
                recieverLoading,
                recieverError,
                fetchRecievers,
                createReciever,
            }}
        >
            {children}
        </RecieverContext.Provider>
    );
};

export default RecieverProvider;