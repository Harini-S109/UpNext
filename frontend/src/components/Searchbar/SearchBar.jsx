import React, { useState, useEffect } from 'react';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import "../../App.css";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsExpanded(!mobile); // Open by default on desktop, closed on mobile
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSearch = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    } else if (value) {
      handleSearch();
    }
  };

  const handleClear = () => {
    onClearSearch();
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`search-container ${isExpanded ? 'expanded' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
      {isExpanded && (
        <>
          <input
            type="text"
            placeholder="Search task"
            value={value}
            onChange={onChange}
            className="search-input"
            autoFocus={isMobile}
          />
          
          {value && (
            <IoMdClose className="search-icon clear-icon" onClick={handleClear} />
          )}
        </>
      )}
      
      <FaMagnifyingGlass 
        className="search-icon search-trigger" 
        onClick={toggleSearch} 
      />
    </div>
  );
};

export default SearchBar;