// src/components/Logout.tsx
import React from 'react';
import nhost from '/home/project/nhostConfig.js'; // Assuming nhost is initialized
import { LogOut } from 'lucide-react';

interface LogoutProps {
  setIsLoggedIn: (value: boolean) => void;
}

const Logout: React.FC<LogoutProps> = ({ setIsLoggedIn }) => {
  const handleLogout = async () => {
    try {
      await nhost.auth.signOut();
      setIsLoggedIn(false);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200"
    >
      <LogOut className="w-5 h-5" />
      <span>Logout</span>
    </button>
  );
};

export default Logout;
