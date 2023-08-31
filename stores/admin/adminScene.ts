import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import { Viewer } from "@photo-sphere-viewer/core"
import { create } from "zustand"

type State = {
  viewer?: Viewer,
  scenes: SceneDataState[],
}

type Actions = {
  setViewer: (data: Viewer) => void
}

const useAdminScene = create<State & Actions>(set => ({
  scenes: [],
  viewer: undefined,
  setViewer: (data) => set({
    viewer: data
  })
})
)

export default useAdminScene