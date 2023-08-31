import { create } from "zustand";

type AppConfigType = {
  name: string
  phone: string
}

const useAppConfig = create<AppConfigType>(set => ({
  name: "Việt Hùng Store",
  phone: "0399633237"
}))

export default useAppConfig