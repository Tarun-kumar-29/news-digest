import React, { useState, useEffect } from 'react';
import { NhostProvider } from '@nhost/react';
import { Toaster } from 'react-hot-toast';
import nhost from '../nhostConfig';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Preferences from './components/Preferences';
import SavedArticles from './components/SavedArticles';
import EmailVerification from './components/EmailVerification';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    const checkAuthentication = async () => {
      const { isAuthenticated } = await nhost.auth.getAuthenticationStatus();

      if (isAuthenticated) {
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      } else {
        setIsLoggedIn(false);
        setCurrentPage('home');
      }
    };

    checkAuthentication();
  }, []);

  const renderPage = () => {
    if (!isLoggedIn) {
      if (currentPage === 'verify-email') {
        return (
          <EmailVerification 
            email={verificationEmail}
            setCurrentPage={setCurrentPage}
            setIsLoggedIn={setIsLoggedIn}
          />
        );
      }
      return (
        <Auth 
          setIsLoggedIn={setIsLoggedIn} 
          setCurrentPage={setCurrentPage}
          setVerificationEmail={setVerificationEmail}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return <Dashboard />;
      case 'saved':
        return <SavedArticles />;
      case 'preferences':
        return <Preferences setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NhostProvider nhost={nhost}>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="container mx-auto px-4 py-8">
          {renderPage()}
        </main>
        <Toaster position="top-right" />
      </div>
    </NhostProvider>
  );
}

export default App;