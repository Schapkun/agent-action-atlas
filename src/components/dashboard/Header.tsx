
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HeaderActions } from './HeaderActions';
import { getViewTitle } from '@/utils/viewTitles';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const { title, description } = getViewTitle(location.pathname + location.search);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <MobileMenuButton onClick={onMobileMenuToggle} />
          
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            <p className="text-sm text-gray-500 truncate mt-1 hidden sm:block">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
};
