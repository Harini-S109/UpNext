import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="position-relative w-100">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        style = {{padding: "12px 15px"}}
        className="form-control border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
      />
      <span
        className="position-absolute end-0 top-50 translate-middle-y pe-3 cursor-pointer text-gray-500"
        onClick={toggleShowPassword}
        style={{ cursor: "pointer" }}
      >
        {isShowPassword ? <FaRegEye size={22} /> : <FaRegEyeSlash size={22} />}
      </span>
    </div>
  );
};

export default PasswordInput;
