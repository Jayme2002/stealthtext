import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export const EmailVerification = () => {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');
  const checkEmailVerification = useAuthStore((state) => state.checkEmailVerification);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleVerificationCheck = async () => {
    setChecking(true);
    setError('');
    
    try {
      const isVerified = await checkEmailVerification();
      
      if (isVerified) {
        setVerified(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Your email has not been confirmed yet. Please check your inbox and click the verification link.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while checking verification status');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/icons/noun-ninja.svg" 
              className="w-8 h-8"
              alt="StealthText Logo"
            />
            <span className="font-bold text-2xl">StealthText</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verify your email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {verified ? (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-5 rounded-lg text-sm text-center">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <p className="font-medium text-lg">Email verified successfully!</p>
                <p className="mt-1">Redirecting you to the dashboard...</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-5 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">Verification email sent</h3>
                  </div>
                  <p className="mt-2 text-sm">
                    <strong>A verification link has been sent to {email}.</strong> Please check your inbox and spam/junk folder to complete the verification process.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={handleVerificationCheck}
                    disabled={checking}
                    className="flex w-full justify-center items-center rounded-lg border border-transparent bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {checking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        I've verified my email
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Didn't receive the email? Check your spam folder.
                  </p>
                  <Link to="/login" className="text-sm text-purple-600 hover:text-purple-800">
                    Return to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 