import React, { useState, useEffect, useContext } from 'react';
import axios from "axios";
import { signInWithGoogle, auth } from '../../config.js';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { AlertTriangle, X, LoaderIcon } from 'lucide-react';
import '../index.css'
import { API_BASE_URL } from '../config/api';

const ErrorToast = ({ isVisible, message, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const visibilityClasses = isVisible
    ? 'translate-x-0 opacity-100'
    : 'translate-x-full opacity-0 pointer-events-none';

  return (
    <div
      className={`fixed top-6 right-6 z-[999] p-4 max-w-sm w-full 
                        bg-white border-l-4 border-red-600 rounded-lg shadow-xl 
                        transform transition-all duration-500 ease-in-out ${visibilityClasses}`}
      role="alert"
    >
      <div className="flex items-start">

        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />

        <div className="ml-3 flex-1">
          <p className="text-sm font-bold text-red-800">Authentication Error</p>
          <p className="mt-1 text-sm text-gray-700 font-semibold">
            {message}
          </p>
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 rounded-md inline-flex text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const BACKEND_URL = `${API_BASE_URL}/api/auth/verify-domain`;
const ADMINISTRATOR_URL = `${API_BASE_URL}/api/administrator/login`;

export default function Login() {
  const { User, setUser, fetchCurrentUser } = AuthContext()
  const [loading, setloading] = useState(false)
  const [isAdministratorMode, setIsAdministratorMode] = useState(false)
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  if (loading === true) {
    return (
      <div className='absolute inset-0 flex flex-col justify-center items-center w-full h-screen bg-white'>
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(176,0,32,0.15)_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden="true" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 animate-[fade-in_500ms_ease-out]">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-50 bg-[#e50914] rounded-full animate-pulse" />
            <LoaderIcon size={56} className='text-[#b00020] animate-spin relative' />
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#b00020] tracking-tight">
              Logging you in...
            </h2>
            <p className="text-[#b00020]/70 text-sm font-medium">
              Please wait while we verify your credentials
            </p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <div className="w-2 h-2 bg-[#b00020] rounded-full animate-[bounce_1s_ease-in-out_0s_infinite]" />
            <div className="w-2 h-2 bg-[#b00020] rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
            <div className="w-2 h-2 bg-[#b00020] rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    setloading(true)
    try {

      const userCredential = await signInWithGoogle();
      console.log(userCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();

      // Choose endpoint based on mode
      const endpoint = isAdministratorMode ? ADMINISTRATOR_URL : BACKEND_URL;

      const response = await axios.post(endpoint, {
        token: firebaseIdToken
      });

      const token = response.data.user.token;
      const user = response.data.user;

      console.log(response?.data);

      sessionStorage.setItem('authToken', token);
      
      // Navigate based on mode
      if (isAdministratorMode) {
        setloading(false)
        navigate('/administrator');
      } else {
        await fetchCurrentUser();
        setloading(false)
        navigate('/dashboard');
      }

    } catch (error) {
      const backendErrorMsg = error.response?.data?.message;
      const msg = backendErrorMsg || error.message || 'An unknown sign-in error occurred.';
      setloading(false)
      console.log(msg);
      setErrorMessage(msg);
    }
  };

  const clearError = () => {
    setErrorMessage('');
  };

  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-white md:grid-cols-2">
      <ErrorToast isVisible={!!errorMessage} message={errorMessage} onClose={clearError} />
      <section className="relative flex items-center justify-center bg-gradient-to-br from-[#e50914] via-[#b00020] to-[#8b0018] p-8 text-white">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md animate-[pop-in_550ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            {isAdministratorMode ? 'Administrator Sign in' : 'Sign in'}
          </h2>

          <button
            onClick={handleSubmit}
            type="button"
            aria-label="Login with Google"
            className="inline-flex w-full items-center gap-3 rounded-xl border-2 border-white bg-white px-4 py-3 text-[#b00020] shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 active:scale-[0.98]"
          >
            <span aria-hidden="true" className="grid h-5 w-5 place-items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.04 12.261c0-.851-.076-1.669-.218-2.452H12v4.642h6.202c-.267 1.438-1.078 2.655-2.292 3.469v2.882h3.712c2.173-2.002 3.418-4.957 3.418-8.543z" fill="#4285F4" />
                <path d="M12 24c3.096 0 5.69-1.026 7.587-2.782l-3.712-2.882c-1.033.695-2.352 1.104-3.875 1.104-2.982 0-5.51-2.013-6.413-4.72H1.779v2.968C3.665 21.44 7.512 24 12 24z" fill="#34A853" />
                <path d="M5.587 14.72A7.246 7.246 0 014.96 12c0-.948.164-1.866.451-2.72V6.312H1.779A11.972 11.972 0 000 12c0 1.93.46 3.754 1.279 5.388l4.308-2.668z" fill="#FBBC05" />
                <path d="M12 4.749c1.682 0 3.19.58 4.378 1.717l3.284-3.284C17.686 1.245 15.092 0 12 0 7.512 0 3.665 2.56 1.279 6.612l4.308 2.668C6.49 6.762 9.018 4.749 12 4.749z" fill="#EA4335" />
              </svg>
            </span>
            <span className="font-bold">Login with Google</span>
          </button>

          {/* Administrator Mode Toggle */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <button
              onClick={() => setIsAdministratorMode(!isAdministratorMode)}
              type="button"
              className="w-full px-4 py-2 rounded-lg border-2 border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all"
            >
              {isAdministratorMode ? '← Back to Regular Login' : '🔐 Login as Administrator'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[12px]  font-bold uppercase tracking-[0.2em] text-white">
              Institutional Access Only
            </p>
            <p className="mt-1 text-[11px] font-medium text-white">
              Authentication restricted to @iut-dhaka.edu domains
            </p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-white p-8 text-[#b00020]">
        <div className="animate-[fade-up_700ms_ease-out_both] max-w-xl text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-wide capitalize md:text-6xl [text-shadow:0_0_0_rgba(176,0,32,0)] animate-[glow_3s_ease-in-out_infinite]">
            welcome to the iutians portal
          </h1>
          <div className="mx-auto mt-4 h-1 w-40 rounded-full bg-gradient-to-r from-[#e50914] to-[#b00020]" />
        </div>
      </section>

      <style>{`
        @keyframes pop-in { 0% { opacity: 0; transform: scale(0.92);} 100% { opacity: 1; transform: scale(1);} }
        @keyframes fade-up { 0% { opacity: 0; transform: translateY(12px);} 100% { opacity: 1; transform: translateY(0);} }
        @keyframes fade-in { 0% { opacity: 0;} 100% { opacity: 1;} }
        @keyframes glow { 0% { text-shadow: 0 0 0 rgba(176,0,32,0); } 50% { text-shadow: 0 6px 24px rgba(176,0,32,0.25); } 100% { text-shadow: 0 0 0 rgba(176,0,32,0);} }
      `}</style>
    </main>
  )
}