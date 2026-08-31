import axios from 'axios'
import React from 'react'
import { API_BASE_URL } from '../config/api';

const AContext = React.createContext(null)
export const AuthContext = () => { return React.useContext(AContext) }

const AutoAuth = ({ children }) => {

    const [User, setUser] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

    const logout = React.useCallback(() => {
        sessionStorage.removeItem('authToken') 
        setUser(null)
        setLoading(false)
    }, [])

    const fetchCurrentUser = React.useCallback(async () => {
        setLoading(true);
        const token = sessionStorage.getItem('authToken'); 
        
        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }
        console.log(token)
        try {
            console.log(token)
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            console.log(response)
            const verifiedUser = response.data.user;

            if (verifiedUser) {
                setUser(verifiedUser);
                return verifiedUser;
            } else {
                logout(); 
                return null;
            }
        } catch (error) {
            console.error("Failed to fetch current user:", error);
            logout();
            return null;
        } finally {
            setLoading(false);
        }
    }, [logout]);

    React.useEffect(() => {
        fetchCurrentUser();
        console.log(User)
    }, [fetchCurrentUser])


    return (
        <AContext.Provider value={{ loading, setLoading, User, setUser, logout, fetchCurrentUser }} >{children}</AContext.Provider>
    )
}

export default AutoAuth