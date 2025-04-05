import React from 'react'
import { getInitials } from '../utils/helper'
import "../App.css";

const ProfileInfo = ({userInfo}) => {  
  return (
    <div className='d-flex flex-row gap-3 align-items-baseline'>
        <h6>{userInfo.fullName}</h6>
        <div className='rounded-circle p-2 px-3 text-light'style={{  backgroundColor:"#7161EF" }}>{getInitials(userInfo.fullName)}</div>
    </div>
  )
}

export default ProfileInfo