import React, { useEffect } from 'react';
import { LuCheck } from "react-icons/lu";
import { MdDeleteOutline } from 'react-icons/md';

export const Toast = ({ isShown, message, type, onClose }) => {

  useEffect(() => {
    if (isShown) {
      const timeOutId = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timeOutId); // Cleanup timer on unmount
    }
  }, [isShown, onClose]);  

  return (
    <div className={`fade ${isShown ? "opacity-100" : "opacity-0"}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000, // Ensure it's above other elements
      }}
    >
      <div 
        className={`d-flex gap-3 p-4 px-4 align-items-center border shadow  rounded ${
          type === "delete" ? "bg-light text-danger" : "bg-light text-success"
        }`}
        style={{
          minWidth: '250px',
        }}
      >
        {type === 'delete' ? <MdDeleteOutline className="text-danger" size={30} /> : <LuCheck size={30} /> } 
        <h6 className='m-0'>{message}</h6>
      </div>
    </div>
  );
};
