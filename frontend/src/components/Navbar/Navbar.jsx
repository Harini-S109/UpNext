import React from 'react'
import ProfileInfo from '../ProfileInfo'
import SearchBar from '../Searchbar/SearchBar'
import { useState, useEffect } from 'react'
import "../../App.css";

const Navbar = ({name, userInfo, onSearchTask, handleClearSearch}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = () => {
    if(searchQuery){
      onSearchTask(searchQuery)
    }
  }

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch()
  }

  return (
    <div className="navbar-container d-flex flex-row align-items-center justify-content-between p-2 px-4 border-bottom">
    {/* Left side */}
    <div className={isMobile ? 'mobile-title' : ''}>
      <h5 className="m-0">{name}</h5>
    </div>
  
    {/* Right side */}
    <div className="navbar-controls d-flex align-items-center ms-auto gap-3">
      <SearchBar 
        value={searchQuery} 
        onChange={({target}) => setSearchQuery(target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />
      <ProfileInfo userInfo={userInfo} />
    </div>
  </div>
  
  )
}

export default Navbar