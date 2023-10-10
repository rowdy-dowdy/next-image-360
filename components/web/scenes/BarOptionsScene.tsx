"use client"

import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import styles from "./scenes.module.css";
import { useRouter } from "next/navigation";
import useScene from "@/stores/web/scene";
import useSettings from "@/stores/settings";
import { memo, useEffect, useRef, useState } from "react";
import { GroupScene } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion"
//@ts-ignore
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic'
import ClientOnly from "@/components/ClientOnly";
import { Tooltip } from "@mui/material";

const DynamicShareModal = dynamic(() => import('../ShareModal'), {
  loading: () => <p>Đang tải...</p>,
})

const BarOptionsScene = memo(({
  autoRotateCheck, toggleAutoRotate, currentScene
}: {
  autoRotateCheck: boolean,
  toggleAutoRotate: (data?: boolean) => void,
  currentScene?: SceneDataState
}) => {
  const router = useRouter()
  const { viewer, scenes, showListScene, setShowListScene, groups, start, videoShow } = useScene()
  const { findSettingByName } = useSettings()

  const mainAudio = useRef<HTMLAudioElement>(null)
  const sceneAudio = useRef<HTMLAudioElement>(null)

  const [fullScreen, setFullScreen] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }

  const exitHandler = () => {
    if (!document.fullscreenElement && !(document as any).webkitIsFullScreen && !(document as any).mozFullScreen && !(document as any).msFullscreenElement) {
      setFullScreen(false)
    }
    else {
      setFullScreen(true)
    }
  }

  const [mainAudioCheck, setMainAudioCheck] = useState(false)

  const toggleMainAudio = (play?: boolean) => {
    if (play != undefined) {
      play ? mainAudio.current?.play() : mainAudio.current?.pause()
      setMainAudioCheck(play)
      return
    }

    if (mainAudioCheck) {
      mainAudio.current?.pause()
      setMainAudioCheck(false)
    }
    else {
      mainAudio.current?.play()
      setMainAudioCheck(true)
    }
  }

  const [sceneAudioCheck, setSceneAudioCheck] = useState(false)
  const [sceneAudioEnded, setSceneAudioEnded] = useState(false)
  // let sceneAudioTime = 0
  // let sceneAudioDuration = 0

  const toggleSceneAudio = (play?: boolean) => {
    if (play != undefined) {
      play ? sceneAudio.current?.play() : sceneAudio.current?.pause()
      setSceneAudioCheck(play)
      return
    }

    if (sceneAudioCheck) {
      sceneAudio.current?.pause()
      setSceneAudioCheck(false)
    }
    else {
      sceneAudio.current?.play()
      setSceneAudioCheck(true)
    }
  }

  // $: if (sceneAudioEnded) {
  //   sceneAudioCheck = false
  // }

  useEffect(() => {
    if (currentScene) {
      watchChangeSceneAudio(sceneAudio.current, currentScene)
    }
  }, [sceneAudio.current, currentScene])

  useEffect(() => {
    watchChangeAllowedPlayAudio(start)
  }, [start])

  const watchChangeSceneAudio = (sceneAudio: HTMLAudioElement | null, currentScene: SceneDataState) => {
    if (!sceneAudio) return

    if (currentScene.audio) {
      if(start) {
        // sceneAudio.pause()
        sceneAudio.src = currentScene.audio.url
        sceneAudio.load()
        // if (sceneAudioCheck)
          toggleSceneAudio(true)
      }
    } else {
      sceneAudio.src = ''
      toggleSceneAudio(false)
    }
  }

  const watchChangeAllowedPlayAudio = (start: boolean) => {
    if(start) {
      toggleMainAudio(true)

      if (sceneAudio.current && currentScene?.audio) {
        sceneAudio.current.src = currentScene.audio.url
        sceneAudio.current.load()
        setTimeout(() => {
          toggleSceneAudio(true)
        }, 2500);
      }
    }
  }

  useEffect(() => {
    if (videoShow) {
      changeVideoShow(videoShow)
    }
  }, [videoShow])

  let mainAudioAfterVideoShow = true
  let sceneAudioAfterVideoShow = true
  const changeVideoShow = (videoShow: string | null) => {
    if (videoShow != null) {
      mainAudioAfterVideoShow = mainAudioCheck
      sceneAudioAfterVideoShow = sceneAudioCheck
      toggleMainAudio(false)
      toggleSceneAudio(false)
    }
    else {
      if (mainAudioAfterVideoShow) { 
        toggleMainAudio(true)
      }
      if (sceneAudioAfterVideoShow) { 
        toggleSceneAudio(true)
      }
    }
  }

  // share
  const [openShare, setOpenShare] = useState(false)

  // screen shot
  const screenShot = () => {
    viewer?.addEventListener('render', () => {
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      // @ts-ignore
      link.href = viewer?.renderer.renderer.domElement.toDataURL();
      link.click();
    }, { once: true });
    viewer?.needsUpdate();
  }

  // next scene
  const [prevScene, setPrevScene] = useState<SceneDataState>()
  const [nextScene, setNextScene] = useState<SceneDataState>()
  const [nextGroup, setNextGroup] = useState<GroupScene>()

  useEffect(() => {
    if (currentScene) {
      findNextScene(currentScene)
    }
  }, [currentScene])

  const findNextScene = (currentScene: SceneDataState) => {
    let index = scenes.findIndex(v => v.id == currentScene.id)

    const tempPrevScene = index > 0 ? scenes[index - 1] : undefined
    const tempNextScene = (index < scenes.length - 1) ? scenes[index + 1] : undefined

    setPrevScene(tempPrevScene)

    setNextScene(tempNextScene)

    if (currentScene?.groupId != tempNextScene?.groupId) {
      setNextGroup(groups.find(v => v.id == tempNextScene?.groupId) || undefined)
    }
    else {
      setNextGroup(undefined)
    }
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', exitHandler)
    document.addEventListener('webkitfullscreenchange', exitHandler)
    document.addEventListener('mozfullscreenchange', exitHandler)
    document.addEventListener('MSFullscreenChange', exitHandler)

    if (start) {
      if (sceneAudio.current && currentScene?.audio) {
        sceneAudio.current.pause()
        sceneAudio.current.src = currentScene.audio.url
        sceneAudio.current.load()
      }

      toggleMainAudio(true)
      // toggleSceneAudio(true)
    }

    let lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery a',
      // children: 'a',
      pswpModule: () => import('photoswipe'),
    })

    lightbox.init()

    return () => {
      document.removeEventListener('fullscreenchange', exitHandler)
      document.removeEventListener('webkitfullscreenchange', exitHandler)
      document.removeEventListener('mozfullscreenchange', exitHandler)
      document.removeEventListener('MSFullscreenChange', exitHandler)
    }
  }, [])

  return (
    <div className={styles.baroptions}>
      <audio src={findSettingByName("main audio")?.url} ref={mainAudio} className="sr-only" loop></audio>
      <audio ref={sceneAudio} onEnded={(e) => setSceneAudioCheck(false)} className="sr-only"></audio>

      <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col justify-center items-center space-y-2">
          { nextScene
            ? <>
              { nextGroup
                ? <Tooltip title="Điểm đến tiếp" arrow placement="top">
                  <Link href={`/${nextScene.slug}`} className="px-4 py-2 rounded-full shadow flex items-center
                    bg-gradient-to-t from-gray-400 via-gray-200 to-gray-100 text-sm font-semibold"
                  >
                    {nextGroup.name}
                    <span className="icon !-mr-2">
                      navigate_next
                    </span>
                  </Link>
                </Tooltip>
              : <Tooltip title="Điểm đến tiếp" arrow placement="top">
                  <Link href={`/${nextScene.slug}`} className="block">
                    <Image src="/images/tien.svg" alt="icon tien" width={32} height={32} className="w-8 h-8" />
                  </Link>
                </Tooltip>
              }
            </>
            : null
          }

          { prevScene
            ? <Tooltip title="Điểm đến trước" arrow placement="bottom">
              <Link href={`/${prevScene.slug}`} className="block">
                  <Image src="/images/lui.svg" alt="icon tien" width={32} height={32} className="w-8 h-8" />
                </Link>
            </Tooltip>
            : null
          }
        </div>
      </div>

      { nextScene
        ? <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Link href={`/${nextScene.slug}`} className="w-36 md:w-40 p-2 pr-0.5 rounded-l-lg bg-black/40 text-white 
            flex space-x-2 items-center text-xs md:text-sm">
            <div className="flex-grow min-w-0 flex flex-col items-center justify-center text-center space-y-1">
              <p>Điểm đến tiếp:</p>
              <p className="font-semibold line-clamp-3">{nextScene.name}</p>
            </div>
            <div className="flex-none w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 text-white flex items-center justify-center">
              <span className="icon text-2xl md:!text-3xl">
                arrow_forward
              </span>
            </div>
          </Link>
        </div>
        : null
      }

      <div className="absolute left-0 right-0 bottom-0 z-10 p-2 pointer-events-none">
        <AnimatePresence>
          { showDescription
            ? <motion.div 
              initial={{ y: 200, opacity: 0, scale: 1 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{duration: .3}}
              className="absolute w-screen right-0 bottom-0 sm:right-4 sm:bottom-16 sm:w-80 max-h-[24rem] z-10 rounded bg-gray-50 shadow-sm flex flex-col items-center pointer-events-auto text-white"
            >
              <div className="w-full flex-grow min-h-0 py-4 px-4 overflow-y-auto whitespace-pre-wrap custom-bar text-[#222]"
                dangerouslySetInnerHTML={{__html: currentScene?.description || "Chưa có mô tả"}}
              >
              </div>

              <div className="w-full p-2 flex items-center justify-center cursor-pointer text-black bg-gray-100 border-t hover:bg-gray-200 rounded-b"
                onClick={() => setShowDescription(false)}
              >
                <span className="icon">
                  expand_more
                </span>
              </div>
            </motion.div>
            : null
          }
        </AnimatePresence>

        <div className="flex space-x-4 items-end">
          <Tooltip title={showListScene ? 'Ẩn menu' : 'Hiện menu'} arrow placement="top-end">
            <div className="bar-icon"
              onClick={() => setShowListScene()}
            >
              <span className="icon">
                {showListScene ? 'menu' : 'menu_open'}
              </span>
            </div>
          </Tooltip>
          <Tooltip title="Chia sẻ" arrow placement="top">
            <div className="bar-icon"
              onClick={() => setOpenShare(true)}
            >
              <span className="icon">share</span>
            </div>
          </Tooltip>

          <div className="!ml-auto"></div>

          <div className="relative w-20 h-20 sm:w-32 sm:h-32 select-none pointer-events-auto">
            <Tooltip title={sceneAudioCheck ? 'Tắt giọng đọc': 'Mở giọng đọc'} arrow placement="top">
              <button className="w-full h-full rounded-full"
                onClick={() => toggleSceneAudio()}
              >
                <Image
                  src={`/images/${sceneAudioCheck ? 'voice_on.png' : 'voice_off.png'}`}
                  width={128}
                  height={128}
                  alt="ảnh bật tắt âm thanh"
                  className="w-full h-full"
                />
              </button>
            </Tooltip>

            <Tooltip title='Xem mô tả' arrow placement="top">
              <div className="bar-icon absolute top-0 left-0 border-2 border-white"
                onClick={() => setShowDescription(state => !state)}
              >
                <span className="icon">
                  info_i
                </span>
              </div>
            </Tooltip>
          </div>

          <div className="flex flex-col space-y-2 select-none">
            <div id="gallery" className={`flex flex-col space-y-2 opacity-0 invisible translate-y-11 transition-all 
              ${showMoreOptions ? '!opacity-100 !visible !translate-y-0' : ''}`}>
              <Tooltip title="Xem bản đồ" arrow placement="left">
                <a href={findSettingByName("so do")?.url} className="bar-icon block"
                  data-pswp-width="10000"
                  data-pswp-height="10000"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="icon">
                    location_on
                  </span>
                </a>
              </Tooltip>

              <Tooltip title="Chụp ảnh" arrow placement="left">
                <div className="bar-icon"
                  onClick={() => screenShot()}
                >
                  <span className="icon">
                    photo_camera
                  </span>
                </div>
              </Tooltip>

              <Tooltip title={mainAudioCheck ? 'Tắt nhạc nền' : 'Bật nhạc nền'} arrow placement="left">
                <div className="bar-icon"
                  onClick={() => toggleMainAudio()}
                >
                  <span className="icon">
                    {mainAudioCheck ? 'volume_up' : 'no_sound'}
                  </span>
                </div>
              </Tooltip>

              <Tooltip title={autoRotateCheck ? 'Tắt tự động xoay' : 'Bật tự động xoay'} arrow placement="left">
                <div className="bar-icon"
                  onClick={() => toggleAutoRotate()}
                >
                  <span className="icon">
                    {autoRotateCheck ? 'sync' : 'sync_disabled'}
                  </span>
                </div>
              </Tooltip>

              <Tooltip title={fullScreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} arrow placement="left">
                <div className="bar-icon"
                  onClick={() => toggleFullScreen()}
                >
                  <span className="icon">
                    {fullScreen ? 'zoom_out_map' : 'zoom_in_map'}
                  </span>
                </div>
              </Tooltip>
            </div>

            <Tooltip title={showMoreOptions ? 'Thu gọn' : 'Mở rộng'} arrow placement={showMoreOptions ? "left" : 'top-end'}>
              <div className="bar-icon"
                onClick={() => setShowMoreOptions(state => !state)}
              >
                <span className="icon">
                  more_horiz
                </span>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      
      <DynamicShareModal open={openShare} setOpen={setOpenShare} />
    </div>
  )
})

export default BarOptionsScene