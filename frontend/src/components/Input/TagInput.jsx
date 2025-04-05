import React, { useState } from 'react';
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({tags, setTags}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }
  }

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div>
      {tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="badge p-2 d-flex align-items-center" style={{backgroundColor:"#7161EF", color:"#ffff"}}>
              {tag}
              <button 
                className="border-0 bg-transparent ms-2" 
                style={{color:"#ffff"}}
                onClick={() => removeTag(index)}
              >
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="d-flex gap-2 my-1">
        <input
          type="text"
          placeholder="Add a tag"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="form-control"
        />

        <button 
          onClick={addNewTag}
          className="btn "
          style={{color:"#ffff", backgroundColor:"#7161EF"}}
        >
          <MdAdd />
        </button>
      </div>
    </div>
  );
}

export default TagInput;
