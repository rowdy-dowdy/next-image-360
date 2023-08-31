import { create } from "zustand";

type ModalType = {
  modalShow: string
  changeModalShow: (data: string) => void
}

const useModal = create<ModalType>(set => ({
  modalShow: "",
  changeModalShow: (data: string) => set(state => ({
    modalShow: data
  }))
}))

export default useModal