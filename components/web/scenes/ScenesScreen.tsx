"use client"

import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import InfoHotSpot from "@/components/admin/scenes/hotspots/InfoHotSpot"
import InfoHotSpot2 from "@/components/admin/scenes/hotspots/InfoHotSpot2"
import LinkHotSpot from "@/components/admin/scenes/hotspots/LinkHotSpot"
import LinkHotSpot4 from "@/components/admin/scenes/hotspots/LinkHotSpot4"
import useSettings from "@/stores/settings"
import useScene from "@/stores/web/scene"
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin"
import { Viewer, utils } from "@photo-sphere-viewer/core"
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter"
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin"
import { InfoHotspot, LinkHotspot } from "@prisma/client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { renderToString } from "react-dom/server"

import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/markers-plugin/index.css"
import styles from "./scenes.module.css";
import LeftSideScene from "./LeftSideScene"
import BarOptionsScene from "./BarOptionsScene"
import VideoShowScene from "./VideoShowScene"

import "./tinymce.css";

const ScenesScreen = () => {
  const router = useRouter()
  const pathname = usePathname()

  const isMounted = useRef(false)
  const { findSettingByName } = useSettings()
  const logo = findSettingByName('site logo')

  const { start, scenes, viewer, setViewer, videoShow, setVideoShow } = useScene()

  const [sceneSlug, setSceneSlug] = useState<string | undefined>(pathname?.split('/')[1])
  const viewerHTML = useRef<HTMLDivElement>(null)
  const markersPlugin = useRef<MarkersPlugin>()
  const autoRotate = useRef<AutorotatePlugin>()

  const [currentScene, setCurrentScene] = useState<SceneDataState | undefined>(
    sceneSlug ? scenes.find(v => v.slug == sceneSlug) || scenes[0] : scenes[0]
  )

  useEffect(() => {
    const slug = pathname?.split('/')[1]
    const tempScene = scenes.find(v => v.slug == slug)

    setSceneSlug(slug)
    setCurrentScene(tempScene || scenes[0])

    if (tempScene) {
      changeScene(tempScene)
    }
  }, [pathname])

  const changeScene = (scene: SceneDataState) => {
    if (!isMounted.current) return

    autoRotate.current?.setOptions({
      autorotatePitch: scene.initialViewParameters.pitch
    })
    switchScene(scene)
  }

  const findSceneDataById = (id: string) => scenes.find(v => v.id == id)

  async function switchScene(scene: SceneDataState) {
    toggleAutoRotate(false)

    await new Promise(res => {
      markersPlugin.current?.clearMarkers()
      res(1)
    })

    viewer?.setPanorama({
      width: scene.faceSize,
      cols: 16,
      rows: 8,
      baseUrl: `/storage/tiles/${scene.id}/low.jpg`,
      tileUrl: (col: number, row: number) => {
        return `/storage/tiles/${scene.id}/${row}_${col}.jpg`
      },
    }, {
      position: {
        pitch: scene.initialViewParameters.pitch,
        yaw: scene.initialViewParameters.yaw,
      },
      zoom: scene.initialViewParameters.zoom,
      showLoader: false,
      // transition: 100,
      // speed: '10rpm'

      // overlay: false
    }).then(v => {
      // markersPlugin.current?.clearMarkers()
      createLinkHotspotElements(scene.linkHotspots)
      createInfoHotspotElements(scene.infoHotspots)

      if (autoRotateCheck) {
        toggleAutoRotate(true)
      }
    })
  }
 
  function createLinkHotspotElements(hotspots: LinkHotspot[]) {
    hotspots.forEach(hotspot => {
      let tooltip = undefined,
        html = undefined,
        image = undefined,
        size = { width: 0, height: 0 }

      const scene = findSceneDataById(hotspot.target)

      if (!scene) return

      if (hotspot?.type == "2") {
        tooltip = scene?.name || ""
        image = '/images/flycam.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "3") {
        tooltip = scene?.name || ""
        image = '/images/arrow.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "4") {
        html = renderToString(LinkHotSpot4({title: scene?.name || ""}))
      }
      else {
        html = renderToString(LinkHotSpot({
          title: scene?.name || "", 
          image: `/storage/tiles/${hotspot.target}/fisheye.png`,
          logo: logo?.url
        }))
      }

      markersPlugin.current?.addMarker({
        id: hotspot.id,
        position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
        html: html,
        image: image,
        size: size,
        anchor: 'center',
        data: {
          type: 'link',
          target: scene?.slug
        },
        tooltip: tooltip,
        className: "psv-marker--custom"
      });
    })
  }

  function createInfoHotspotElements(hotspots: InfoHotspot[]) {
    hotspots.forEach(hotspot => {
      let tooltip = undefined,
        html = undefined,
        image = undefined,
        content = undefined

      if (hotspot?.type == "2") {
        tooltip = hotspot.title ?? ''
        html = renderToString(InfoHotSpot2())
      }
      else {
        tooltip = hotspot.title ?? ''
        content = hotspot.description ?? ''
        html = renderToString(InfoHotSpot())
      }

      markersPlugin.current?.addMarker({
        id: hotspot.id,
        position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
        html: html,
        image: image,
        size: { width: 40, height: 40 },
        anchor: 'center',
        content,
        data: {
          type: 'info',
          title: tooltip,
          video: hotspot.video
        },
        tooltip: tooltip
      });
    })
  }

  // toggle scene
  const [autoRotateCheck, setAutoRotateCheck] = useState(false)

  function toggleAutoRotate(value?: boolean) {
    if (value != undefined) {
      value ? autoRotate.current?.start() : autoRotate.current?.stop()
      setAutoRotateCheck(value)
      autoRotate.current?.setOptions({
        autostartOnIdle: value,
      });
      return
    }

    if (autoRotateCheck) {
      autoRotate.current?.stop()
      autoRotate.current?.setOptions({
        autostartOnIdle: false,
      });
      setAutoRotateCheck(false)
    } 
    else {
      autoRotate.current?.setOptions({
        autostartOnIdle: true,
      });
      autoRotate.current?.start()
      setAutoRotateCheck(true)
    }
  }

  // stop auto rotate in video show
  useEffect(() => {
    changeVideoShow(videoShow)
  }, [videoShow])

  let autoRotateAfterVideoShow = true
  const changeVideoShow = (videoShow: string | undefined) => {
    if (videoShow != null) {
      autoRotateAfterVideoShow = autoRotateCheck
      toggleAutoRotate(false)
    }
    else {
      if (autoRotateAfterVideoShow) { 
        toggleAutoRotate(true)
      }
    }
  }

  // start in tro
  useEffect(() => {
    if (start) {
      intro()
    }
  }, [start])

  let animatedValues = {
    pitch: { start: -Math.PI / 2, end: currentScene?.initialViewParameters.pitch || 0.2 },
    yaw: { start: ((currentScene?.initialViewParameters.yaw || 0) - 5), end: currentScene?.initialViewParameters.yaw || 0 },
    zoom: { start: 0, end: currentScene?.initialViewParameters.zoom || 50 },
    fisheye: { start: 2, end: 0 },
  }

  function intro() {
    autoRotate.current?.stop();
    // markersPlugin?.hideAllMarkers()

    new utils.Animation({
      properties: animatedValues,
      duration: 2500,
      easing: "inOutQuad",
      onTick: (properties) => {
        viewer?.setOption("fisheye", properties.fisheye);
        viewer?.rotate({ yaw: properties.yaw, pitch: properties.pitch });
        viewer?.zoom(properties.zoom);
      },
    }).then(() => {
      createLinkHotspotElements(currentScene?.linkHotspots || [])
      createInfoHotspotElements(currentScene?.infoHotspots || [])

      autoRotate.current?.setOptions({
        autorotatePitch: currentScene?.initialViewParameters.pitch,
        autostartDelay: 1000,
        autostartOnIdle: true,
      });
      autoRotate.current?.start();

      // markersPlugin?.showAllMarkers()
    });
  }

  useEffect(() => {
    if (!viewerHTML.current) return

    const tempViewer = new Viewer({
      container: viewerHTML.current,
      adapter: EquirectangularTilesAdapter,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: currentScene?.initialViewParameters.pitch,
          autorotateSpeed: '0.2rpm',
        }],
        MarkersPlugin
      ],

      defaultPitch: animatedValues.pitch.start,
      defaultYaw: animatedValues.yaw.start,
      defaultZoomLvl: animatedValues.zoom.start,
      fisheye: animatedValues.fisheye.start,

      // touchmoveTwoFingers: true,
      panorama: {
        width: currentScene?.faceSize || 8192,
        cols: 16,
        rows: 8,
        baseUrl: `/storage/tiles/${currentScene?.id}/low.jpg`,
        tileUrl: (col: number, row: number) => {
          return `/storage/tiles/${currentScene?.id}/${row}_${col}.jpg`
        },
      },
    })

    setViewer(tempViewer)

    markersPlugin.current = tempViewer.getPlugin(MarkersPlugin) as MarkersPlugin
    autoRotate.current = tempViewer.getPlugin(AutorotatePlugin) as AutorotatePlugin

    // if (scenes.length > 0) {
    //   createLinkHotspotElements(currentScene?.linkHotspots || [])
    //   createInfoHotspotElements(currentScene?.infoHotspots || [])
    // }

    markersPlugin.current.addEventListener('select-marker', ({ marker }) => {
      if (marker.data?.type == "link" && marker.data?.target) {
        if (marker.data?.target) {
          router.push(`/${marker.data.target}`)
        }
      }
      
      if (marker.data?.type == "info") {
        if (marker.data?.video) {
          setVideoShow(marker.data.video)
        }
      }
    })

    isMounted.current = true

    return () => {
      if(viewer) {
        viewer?.destroy()
        markersPlugin.current?.clearMarkers()
      }
    }
  }, [])

  return (
    <>
      <div id="viewer" ref={viewerHTML}  className={`w-full h-screen ${styles.viewer}`} />
      
      <LeftSideScene sceneSlug={sceneSlug} currentScene={currentScene} />
      <BarOptionsScene autoRotateCheck={autoRotateCheck} toggleAutoRotate={toggleAutoRotate} currentScene={currentScene} />
      <VideoShowScene />
    </>
  )
}

export default ScenesScreen