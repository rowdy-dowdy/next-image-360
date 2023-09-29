"use client"

import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import { GroupScene } from "@prisma/client"
import ScenesScreen from "../scenes/ScenesScreen"
import { Children, useEffect, useRef, useState } from "react"
import useSettings from "@/stores/settings"
import Image from "next/image"
import { Button } from "@mui/material"
import useScene from "@/stores/web/scene"
import { motion } from "framer-motion"
import { io, Socket } from "socket.io-client"

const SceneContent = ({
  defaultScenes = [], defaultGroups = [], children
}: {
  defaultScenes: SceneDataState[],
  defaultGroups: GroupScene[],
  children: React.ReactNode
}) => {
  const {findSettingByName} = useSettings()

  const  {start, setStart, setScenes, setGroups} = useScene()

  const willMount = useRef(true)

  if (willMount.current) {
    setScenes(defaultScenes)
    setGroups(defaultGroups)
    willMount.current = false
  }

  const [startCompleted, setStartCompleted] = useState(false)

  // socket io
  const socketRef = useRef<Socket>()

  const socketInitializer = async () => {
    // await fetch('/api/socket')
    
    socketRef.current = io(process.env.NEXT_PUBLIC_SITE_URL|| "", {
      path: '/api/socket',
      addTrailingSlash: false,
    })

    socketRef.current.on('connect', () => {
      console.log('Connected', socketRef.current?.id)
    })
  }

  useEffect(() => {
    socketInitializer()
  }, [])

  return (
    <>
      <style global jsx>
        {`html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }`}
      </style>

      { defaultScenes.length > 0
        ? <ScenesScreen />
        : <div className="fixed w-full h-screen top-0 left-0 grid place-items-center">
          Không có bối cảnh nào
        </div>
      }

      { !start
        ? <motion.div 
            className="fixed w-full h-screen top-0 left-0 z-[100] bg-white"
            animate={{
              scale: startCompleted ? 2 : 1,
              opacity: startCompleted ? 0 : 1
            }}
            initial={false}
            transition={{ type: "tween", duration: 0.7}}
            onAnimationComplete={() => {
              setStart(true)
            }}
          >
          <Image 
            src={findSettingByName('banner')?.url || ''} 
            alt="banner website"
            width={1920}
            height={1080}
            priority={true}
            loading="eager"
            className="w-full h-full object-cover"
          />

          <div className="absolute w-full h-full left-0 top-0 flex flex-col items-center justify-center gap-8">
            <button 
              className="!rounded-full !bg-gradient-to-r !from-cyan-500 !to-blue-500 px-6 py-3 text-white md:text-lg shadow" 
              onClick={(e) => setStartCompleted(true)}
            >Bắt đầu tham quan</button>
          </div>
        </motion.div>
        : null
      }

      { children }
    </>
  )
}

export default SceneContent