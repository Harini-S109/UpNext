import React from 'react'
import ProfileInfo from '../ProfileInfo'
import SearchBar from '../Searchbar/SearchBar'
import { useState } from 'react'
import "../../App.css";

const Navbar = ({name, userInfo, onSearchTask, handleClearSearch}) => {
  
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className='d-flex flex-row gap-1 align-items-baseline justify-content-between p-2 px-4 border-bottom '>
        <div><h5>{name}</h5></div>
        <SearchBar 
        value={searchQuery} 
        onChange={({target}) => {
                setSearchQuery(target.value);
            }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
        />
        <ProfileInfo userInfo={userInfo} />
    </div>
  )
}

export default Navbar