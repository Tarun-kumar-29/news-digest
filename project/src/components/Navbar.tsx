import React, { useState } from 'react';
import Logout from './Logout';
import { Menu, X, Sun, Moon, BookMarked, Home, Settings, LogOut } from 'lucide-react';
interface NavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isDarkMode, 
  setIsDarkMode, 
  isLoggedIn, 
  setIsLoggedIn,
  currentPage,
  setCurrentPage 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation('home')}
          >
            <BookMarked className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl">NewsDigest</span>
          </div>

          {isLoggedIn && (
            <div className="hidden md:flex items-center space-x-8">
              <NavLink 
                icon={<Home className="w-5 h-5" />} 
                text="Home" 
                isActive={currentPage === 'home'}
                onClick={() => handleNavigation('home')}
              />
              <NavLink 
                icon={<BookMarked className="w-5 h-5" />} 
                text="Saved" 
                isActive={currentPage === 'saved'}
                onClick={() => handleNavigation('saved')}
              />
              <NavLink 
                icon={<Settings className="w-5 h-5" />} 
                text="Preferences" 
                isActive={currentPage === 'preferences'}
                onClick={() => handleNavigation('preferences')}
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoggedIn && (
  <Logout setIsLoggedIn={setIsLoggedIn} />
)}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && isLoggedIn && (
          <div className="md:hidden pb-4 animate-slideDown">
            <NavLink 
              icon={<Home className="w-5 h-5" />} 
              text="Home" 
              isMobile 
              isActive={currentPage === 'home'}
              onClick={() => handleNavigation('home')}
            />
            <NavLink 
              icon={<BookMarked className="w-5 h-5" />} 
              text="Saved" 
              isMobile 
              isActive={currentPage === 'saved'}
              onClick={() => handleNavigation('saved')}
            />
            <NavLink 
              icon={<Settings className="w-5 h-5" />} 
              text="Preferences" 
              isMobile 
              isActive={currentPage === 'preferences'}
              onClick={() => handleNavigation('preferences')}
            />
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center space-x-2 text-red-500 hover:text-red-600 w-full p-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  isMobile?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, text, isMobile, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 transition-colors duration-200
      ${isMobile ? 'p-2 w-full' : ''}
      ${isActive 
        ? 'text-blue-500' 
        : 'hover:text-blue-500'
      }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default Navbar;