import React, { useState, useEffect } from 'react';
import { useSignInEmailPassword, useSignUpEmailPassword, useAuthenticated, useUserData } from '@nhost/react';
import nhost from '/home/project/nhostConfig.js';

interface AuthProps {
  setIsLoggedIn: (value: boolean) => void;
  setCurrentPage: (page: string) => void;
  setVerificationEmail: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ setIsLoggedIn, setCurrentPage, setVerificationEmail }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emoji, setEmoji] = useState('😊');

  const { signInEmailPassword, isLoading: isSignInLoading } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: isSignUpLoading } = useSignUpEmailPassword();
  const isAuthenticated = useAuthenticated();
  const user = useUserData();

  const isLoading = isSignInLoading || isSignUpLoading;

  // Auto Sign-In using token if available
  useEffect(() => {
    const autoSignIn = async () => {
      try {
        if (isAuthenticated) {
          setIsLoggedIn(true);
          setCurrentPage('home');
        } else {
          const refreshToken = localStorage.getItem('nhostRefreshToken');
          if (refreshToken) {
            const { error } = await nhost.auth.refreshSession();
            if (error) throw new Error(error.message);
            setIsLoggedIn(true);
            setCurrentPage('home');
          }
        }
      } catch (error) {
        console.error('Error during auto sign-in:', error);
        // setErrorMessage((error as Error).message);
      }
    };

    autoSignIn();
  }, [isAuthenticated]);

  // Check email verification
  const checkEmailVerification = async () => {
    const user = await nhost.auth.getUser();
    if (user?.emailVerified) {
      setIsLoggedIn(true);
      setCurrentPage('home');
    } else {
      setVerificationEmail(user?.email || '');
      setCurrentPage('verify-email');
    }
  };

  // Sign-in handler
  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await signInEmailPassword(email, password);
      if (error) throw new Error(error.message || 'Sign-in failed.');
      await checkEmailVerification();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        setErrorMessage(error.message);
      }
    }
  };

  // Sign-up handler
  const handleSignUp = async () => {
    try {
      const { error } = await signUpEmailPassword(email, password, {
        displayName: name,
        metadata: { name }
      });
      if (error) throw new Error(error.message || 'Sign-up failed.');
      setVerificationEmail(email);
      setCurrentPage('verify-email');
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        setErrorMessage(error.message);
      }
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isLogin && !name.trim()) {
      return setErrorMessage('Name is required for sign-up.');
    }

    if (isAuthenticated) {
      setCurrentPage('home');
      return setErrorMessage('User is already signed in. Redirecting to home...');
    }

    isLogin ? await handleSignIn(email, password) : await handleSignUp();
  };

  useEffect(() => {
    setEmoji(isLogin ? '👋' : '🌟');
  }, [isLogin]);

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-6xl text-center mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:text-blue-600 text-sm">
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
