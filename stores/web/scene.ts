import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import { Viewer } from "@photo-sphere-viewer/core"
import { GroupScene } from "@prisma/client"
import { create } from "zustand"

type State = {
  start: boolean,
  viewer?: Viewer,
  scenes: SceneDataState[],
  groups: GroupScene[]
  videoShow?: string,
  showListScene: boolean
}

type Actions = {
  setStart: (data: boolean) => void
  setViewer: (data: Viewer) => void,
  setScenes:( data: SceneDataState[]) => void,
  setGroups:( data: GroupScene[]) => void,
  setVideoShow: (data: string | undefined) => void
  setShowListScene: (data?: boolean) => void
}

const useScene = create<State & Actions>(set => ({
  start: false,
  setStart: (data) => set({
    start: data
  }),

  videoShow: undefined,
  setVideoShow: (data) => set({
    videoShow: data
  }),

  viewer: undefined,
  setViewer: (data) => set({
    viewer: data
  }),
  
  scenes: [],
  setScenes: (data) => set({
    scenes: data
  }),

  groups: [],
  setGroups: (data) => set({
    groups: data
  }),

  showListScene: true,
  // setShowListScene: (data) => set({
  //   showListScene: data
  // }),
  setShowListScene: (data) => set((state) => ({
    showListScene: data ? data : !state.showListScene
  })),

  // allowedPlayAudio: false,
  // setAllowedPlayAudio: (data) => set({
  //   allowedPlayAudio: data
  // }),
})
)

export default useScene