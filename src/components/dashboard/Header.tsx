
import React from 'react';
import { useLocation } from 'react-router-dom';
import { FilterSelector } from './FilterSelector';
import { HeaderActions } from './HeaderActions';
import { getViewTitleFromPath } from '@/utils/viewTitles';
import { MemberFilter } from './MemberFilter';

interface HeaderProps {
  currentView?: string;
  onToggleSidebar?: () => void;
}

const Header = ({ currentView, onToggleSidebar }: HeaderProps) => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getViewTitleFromPath(location.pathname)}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <FilterSelector />
          <MemberFilter />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
};

export default Header;
