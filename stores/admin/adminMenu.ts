import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

type State = {
  open: boolean,
  width: string,
}

type Actions = {
  toggle: (data?: boolean) => void
}

const NAME = "admin-menu"

const useAdminMenu = create(
  persist<State & Actions>(
    (set, get) => ({
      open: false,
      width: "16rem",
      toggle: (data) => set({
        open: data ? data : !get().open
      })
    }),
    {
      name: NAME,
      storage: createJSONStorage(() => sessionStorage),
      // getStorage: () => localStorage
      onRehydrateStorage: () => (state) => {
        // let data = JSON.parse(sessionStorage.getItem(NAME) as any)
        // console.log(data)
        // state?.toggle(false)
        // setTimeout(() => state?.toggle(false))
      }
    }
  )
)

// const useAdminMenu = () => {
//   const adminMenu = useAdminMenu2()
//   const [admin, setadmin] = useState(second)
// }

export default useAdminMenu