"use client"
import { useClickOutside } from '@/lib/clickOutside'
import React, { useEffect, useRef, useState } from 'react'

const Collapse = ({className = "", children, show = false, setShow}: any) => {
  const ref = useRef<HTMLDivElement>(null)

  const [firstShow, setFirstShow] = useState(show)

  let time: ReturnType<typeof setTimeout>

  const collapse = (show: boolean) => {
    if (!ref.current) return
    // el.style.transition = 'height .3s ease'
    clearTimeout(time)

    if (show) {
      ref.current.style.height = ref.current.scrollHeight + 'px'

      time = setTimeout(() => {
        if (!ref.current) return
        ref.current.style.height = "auto"
      }, 300);
    }
    else {
      ref.current.style.height = ref.current.clientHeight + 'px'

      time = setTimeout(() => {
        if (!ref.current) return
        ref.current.style.height = "0px"
      }, 0);
    }
  }

  useEffect(() => {
    collapse(show)
  },[show])

  useClickOutside(ref, () => {
    console.log('click outside')
    if (typeof setShow === 'function')
      setShow(false)
  })

  return (
    <div 
      ref={ref}
      style={{height: !firstShow ? "0px" : ""}}
      className={`overflow-hidden transition-all z-50 ${className}`}
    >
      {children}
    </div>
  )
}

export default Collapse