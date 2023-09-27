"use client"
import React, { useRef } from 'react'

type State = {
  label?: string | null,
  name?: string
  required?: boolean,
  className?: string,
  placeholder?: string
}

const AdminFormFieldDateTime: React.FC<State> = ({
  label,
  name,
  required = false,
  className = '',
  placeholder
}) => {
  return (
    <div className={`rounded px-3 py-2 bg-gray-200 focus-within:bg-gray-300 select-none ${className}`}>
      { label
        ? <p className="text-sm font-medium mb-1 capitalize">{label} { required && <span className="text-red-500">*</span> }</p>
        : null
      }
      <input type="text" name={name}
        className="w-full border-none !bg-transparent" 
        required={required} placeholder={placeholder}
      />
    </div>
  )
}

export default AdminFormFieldDateTime