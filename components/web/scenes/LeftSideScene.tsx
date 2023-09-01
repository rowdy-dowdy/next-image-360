"use client"

import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import styles from "./scenes.module.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useScene from "@/stores/web/scene";
import { GroupScene } from "@prisma/client";
import Image from "next/image";
import useSettings from "@/stores/settings";
import { motion, AnimatePresence } from "framer-motion"
import { ClickAwayListener } from "@mui/base";
import Link from "next/link";
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import ResizeObserver from 'resize-observer-polyfill';

const LeftSideScene = ({
  sceneSlug, currentScene
}: {
  sceneSlug?: string, currentScene?: SceneDataState
}) => {
  const router = useRouter()
  const { scenes, showListScene, groups, start } = useScene()
  const { findSettingByName } = useSettings()

  let listScene = useRef(null)

  const [showSceneDemo, setShowSceneDemo] = useState(false)
  const [showSceneDemImage, setShowSceneDemImage] = useState('')
  const [groupSelect, setGroupSelect] = useState<string>()
  const [showGroupScene, setShowGroupScene] = useState(false)

  const sceneFilter = groupSelect ? scenes.filter(v => v.groupId == groupSelect) : scenes

  const enterSceneTitle = (group: GroupScene) => {
    let firstScene = scenes.find(v => v.groupId == group.id)

    if (firstScene) {
      setShowSceneDemImage(`/storage/tiles/${firstScene.id}/front.jpg`)
      setShowSceneDemo(true)
    }
  }

  const leaveSceneTitle = () => {
    setShowSceneDemo(false)
  }

  const clickSceneTitle = (group: GroupScene) => {
    if (showGroupScene) {
      setGroupSelect(group.id)
    }
    else {
      let tempScenes = scenes.filter(v => v.groupId == group.id)

      if (tempScenes.length == 1) {
        setShowSceneDemo(false)
        router.push(`/${tempScenes[0].slug}`)
      }
      else {
        setGroupSelect(group.id)
        setShowGroupScene(true)
      }
    }
  }

  const clickGroupScene = (slug: string) => {
    setShowGroupScene(false)
    router.push(`/${slug}`)
  }

  useEffect(() => {
    // if (listScene.current) {
    //   new SimpleBar(listScene.current)
    // }

    // window.ResizeObserver = ResizeObserver
  }, [])

  return (
    <div className={styles.leftside}>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/10 via-transparent to-black/10 z-10 pointer-events-none"></div>

      <AnimatePresence>
        { showSceneDemo || showGroupScene
          ? <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r 
            from-black/60 via-transparent to-black/60 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            { showSceneDemo
              ? <div className="hidden w-full h-full md:flex items-center justify-center">
                <div className="w-3/4 max-w-3xl border-4 border-white bg-white">
                  <Image 
                    src={showSceneDemImage} 
                    alt="Ảnh demo điểm chụp" 
                    width={1000}
                    height={1000}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 70vw, 100vw"
                    className="w-full h-full aspect-[5/3] object-cover" 
                  />
                </div>
              </div>
              : null
            }
          </motion.div>
          : null
        }
      </AnimatePresence>

      <div className="absolute top-0 left-0 w-full h-full p-6 pointer-events-none overflow-hidden select-none flex flex-col z-10">
        <div className="flex-none md:pl-6 lg:pl-12 mb-12">
          <AnimatePresence>
            { start && showListScene
              ? <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="block w-20 h-20 md:w-32 md:h-32 pointer-events-auto rounded-full border-2 border-white"
                  style={{boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}
                  // animate={{ scale: start ? 1 : 0, opacity: start ? 1 : 0 }}
                  // initial={false}
                >
                  <Link href="/">
                    <Image
                      src={findSettingByName('site logo')?.url || '/logo.png'}
                      width={100}
                      height={100}
                      alt="logo Bắc Hà"
                      className="w-full h-full object-contain"
                    />
                  </Link>
                </motion.div>
                : null
              }
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          { start && showListScene
            ? <ClickAwayListener onClickAway={() => setShowGroupScene(false)}>
              <motion.div 
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="flex-grow min-h-0 w-full max-w-[280px] relative text-sm md:text-base"
              >
                <AnimatePresence>
                  {showGroupScene
                    ? <motion.div
                      initial={{ x: -280 }}
                      animate={{ x: 0 }}
                      exit={{ x: -280 }}
                      className="w-full h-full flex flex-col"
                    >
                      <div className="w-full pointer-events-auto overflow-y-auto">
                        <div className="flex flex-col text-white divide-y divide-black/20">
                          { sceneFilter.length > 0
                            ? sceneFilter.map(v =>
                              <div key={v.id} className={`flex py-0.5 md:py-2 space-x-2 items-center cursor-pointer pointer-events-auto
                                hover:text-teal-300 ${sceneSlug == v.slug ? 'text-teal-300' : ''}`}
                                onClick={() => clickGroupScene(v.slug)}
                              >
                                <span className="flex-grow" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{v.name}</span>
                                <span className="flex-none material-symbols-outlined">
                                  chevron_right
                                </span>
                              </div>
                            )
                            : <div className="py-0.5 md:py-2">Không có bối cảnh nào</div>
                          }
                        </div>
                      </div>
                    </motion.div>
                    : null
                  }
                </AnimatePresence>

                <div className={`w-full h-full absolute top-0 left-0 transition-all ease-linear flex flex-col ${showGroupScene ? '!left-[300px]' : ''}`}>
                  <div className="w-full overflow-x-hidden overflow-y-auto pointer-events-auto">
                    <div ref={listScene} className="w-full overflow-hidden">
                      <div className="flex flex-col text-white"
                        onMouseLeave={() => leaveSceneTitle()}
                      >
                        {/* { new Array(5).fill(0).map((v,i) =>
                          <div key={i} className="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.2] pointer-events-auto"
                            onMouseEnter={() => enterSceneTitle(v)}
                            onClick={() => clickSceneTitle(v)}
                          >
                            <div className={`w-1 h-7 md:h-9 bg-white group-hover:bg-sky-600 ${currentScene?.groupId == v ? '!bg-sky-600' : ''}`}></div>
                            <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{v}</span>
                          </div>
                        )} */}
                        { groups.map(v =>
                          <div key={v.id} className="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.2] pointer-events-auto"
                            onMouseEnter={() => enterSceneTitle(v)}
                            onClick={() => clickSceneTitle(v)}
                          >
                            <div className={`w-1 h-7 md:h-9 bg-white group-hover:bg-sky-600 ${currentScene?.groupId == v.id ? '!bg-sky-600' : ''}`}></div>
                            <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{v.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ClickAwayListener>
            : null
          }
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LeftSideScene