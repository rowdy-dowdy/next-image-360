"use client"
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react'

export const NavigationEvents = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = `${pathname}?${searchParams}`
    console.log(url)
    // You can now use the current URL
    // ...
  }, [pathname, searchParams])

  return null
};

export const AfterNavigationEvents = () => {

  useEffect(() => {
    console.log('start')
    // ...
  }, [])

  return null
};

// const ProgressBar = () => {
//   const lineProcess = useRef<HTMLDivElement>(null)
//   const pathname = usePathname();

//   useNavigationEvent(() => {
//     console.log(1)
//   })

//   return (
//     <div className="fixed w-full h-0.5 top-0 left-0 z-50">
//       {pathname}
//       <div ref={lineProcess} className="absolute w-0 h-full bg-blue-600 ease-in-out"></div>
//     </div>
//   )
// }