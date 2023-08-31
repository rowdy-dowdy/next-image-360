import { SceneDataState } from "@/app/admin/(admin)/scenes/page"
import { Viewer } from "@photo-sphere-viewer/core"
import { create } from "zustand"

type State = {
  settings: any[]
}

type Actions = {
  setSettings: (data: any[]) => void,
  findSettingByName: (name: string) => any
}

const useSettings = create<State & Actions>((set, get) => ({
  settings: [],
  setSettings: (data) => set({
    settings: data
  }),
  findSettingByName: (name) => {
    return get().settings.find(v => v.name == name)?.value || undefined
  }
})
)

export default useSettings