import React, { useState, useEffect } from 'react';
import { useAuthenticationStatus,useUserData } from '@nhost/react';
import { Mail, RefreshCw } from 'lucide-react';
import nhost from '/home/project/nhostConfig.js';
import { getUserId} from '/home/project/src/components/api/api.ts';

interface EmailVerificationProps {
  email: string;
  setCurrentPage: (page: string) => void;
  setIsLoggedIn: (value: boolean) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email, setCurrentPage, setIsLoggedIn }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const [resendCooldown, setResendCooldown] = useState(0);
  const user = useUserData();

  // // Check Authentication Every 45 Seconds
  // // useEffect(() => {
  // //   const interval = setInterval(() => {
  // //     if (isAuthenticated) {
  // //       console.log("Authenticated! Redirecting to preferences.");
  // //       setIsLoggedIn(true);
  // //       setCurrentPage('preferences');
  // //       clearInterval(interval);
  // //     }
  // //   }, 4500);

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, [isAuthenticated, setCurrentPage, setIsLoggedIn]);

  // Countdown Timer for Resend Email
  useEffect(() => {
    const timer = setInterval(() => {
      if (resendCooldown > 0) {
        setResendCooldown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Resend Verification Email
  const handleResendEmail = async () => {
    try {
      await nhost.auth.sendVerificationEmail({ email });
      setResendCooldown(60); // Set cooldown to 60 seconds
      console.log('Verification email resent');
    } catch (error) {
      console.error('Error resending verification email:', error);
    }
  };

  // Navigate Back to Signup Page
  const handleBackToSignup = () => {
    setCurrentPage('auth');
  };

  // Loading Indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <Mail className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 dark:text-white">Verify Your Email</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a verification email to:
          <br />
          <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check your email for the verification link.
            Click it to verify your account and return to sign in.
            The link expires in 1 hour.
          </p>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 
                ${resendCooldown > 0
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {resendCooldown > 0
                ? `Resend email (${resendCooldown}s)`
                : 'Resend verification email'
              }
            </button>
          </div>

          <button
            onClick={handleBackToSignup}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Back to signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
