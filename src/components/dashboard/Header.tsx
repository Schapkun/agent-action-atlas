import React from 'react';
import { useLocation } from 'react-router-dom';
import { FilterSelector } from './FilterSelector';
import { HeaderActions } from './HeaderActions';
import { getViewTitle } from '@/utils/viewTitle';
import { MemberFilter } from './MemberFilter';

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getViewTitle(location.pathname)}
          </h1>
          
          <div className="flex items-center space-x-4">
            <FilterSelector />
            <MemberFilter />
          </div>
        </div>
        
        <HeaderActions />
      </div>
    </header>
  );
};

export default Header;
