import { SceneDataState } from '@/app/admin/(admin)/scenes/page'
import { promiseFunction } from '@/lib/admin/promise'
import { deleteHotspot, deleteScene, updateInitialViewParametersScene } from '@/lib/admin/scene'
import useAdminScene from '@/stores/admin/adminScene'
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider } from '@mui/material'
import { Button, Menu, MenuItem } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from 'react'

const AdminSceneControl = ({
  scenes, sceneId, setSceneId, setOpenModalAdd, tabCurrentHotspot, setTabCurrentHotspot,
  editHotspotModal, setEditHotspotModal, openHotspotModal, setOpenHotspotModal
}: {
  scenes: SceneDataState[],
  setOpenModalAdd: (data: SceneDataState | null) => void,
  sceneId?: string, 
  setSceneId: Dispatch<SetStateAction<string>>
  tabCurrentHotspot: 'link' | 'info',
  setTabCurrentHotspot: Dispatch<SetStateAction<'link' | 'info'>>;
  editHotspotModal: any | null,
  setEditHotspotModal: Dispatch<SetStateAction<any>>
  openHotspotModal: boolean,
  setOpenHotspotModal: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()

  // list hotspot in scene
  const [anchorElHotspot, setAnchorElHotspot] = React.useState<null | HTMLElement>(null)
  const openHotspot = Boolean(anchorElHotspot)
  const handleShowHotspots = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElHotspot(event.currentTarget);
  }
  const handleCloseHotspot = () => {
    setAnchorElHotspot(null)
  }

  const [currentScene, setCurrentScene] = useState<SceneDataState | null>(scenes.find(v => v.id == sceneId) || null)

  useEffect(() => {
    setCurrentScene(scenes.find(v => v.id == sceneId) || null)
  })

  const findSceneDataById = (id: string ) => scenes.find(v => v.id == id)

  // delete scene
  const [loading, setLoading] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const handelCloseModal = (data: boolean) => {
    if (loading) return
    setOpenDeleteModal(data)
  }

  const handelDeleteScene = async () => {
    if (!currentScene) return
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        await deleteScene({id: currentScene.id})

        if (scenes.length > 1) {
          setSceneId(scenes[0].id)
        }

        router.refresh()
        setOpenDeleteModal(false)
      }
    })
  }

  // delete hotspot
  const [openDeleteHotspotModal, setOpenDeleteHotspotModal] = useState(false)

  const handelOpenHotspotModal = (data: any, type: 'link' | 'info') => {
    if (loading) return
    setEditHotspotModal(data)
    setTabCurrentHotspot(type)
    setOpenDeleteHotspotModal(true)
  }

  const getHotspotDeleteName = () => {
    if (!editHotspotModal) return ""

    if (tabCurrentHotspot == "link") {
      return findSceneDataById(editHotspotModal?.target)?.name || ''
    }
    else {
      return editHotspotModal?.title || ''
    }
  }

  const handelCloseHotspotModal = (data: boolean) => {
    if (loading) return
    setOpenDeleteHotspotModal(data)
  }

  const handelDeleteHotspot = async () => {
    if (!editHotspotModal) return
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        await deleteHotspot({id: editHotspotModal.id, type: tabCurrentHotspot})

        router.refresh()
        setOpenDeleteHotspotModal(false)
      }
    })
  }

  // edit hotspot
  const handelOpenEditHotspotModal = (data: any, type: 'link' | 'info') => {
    if (loading) return
    setEditHotspotModal(data)
    setTabCurrentHotspot(type)
    setOpenHotspotModal(true)
  }

  // update coordinates
  const viewer = useAdminScene(state => state.viewer)
  const handelUpdateInitial = async (e: MouseEvent) => {
    e.preventDefault()
    if (!currentScene) return
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        if (!viewer) throw "Không tìm thấy viewer"

        let _params = viewer.getPosition()

        const initialViewParameters = JSON.stringify({ pitch: _params.pitch, yaw: _params.yaw, zoom: viewer.getZoomLevel() })

        await updateInitialViewParametersScene({
          id: currentScene.id,
          initialViewParameters: initialViewParameters
        })
      }
    })
  }

  return (
    <>
      <div className="absolute top-0 right-0 p-4 z-10">
        <Button variant='contained' onClick={handleShowHotspots}>Danh sách điểm nóng ({(currentScene?.linkHotspots.length || 0) + (currentScene?.infoHotspots.length || 0)})</Button>
        <Menu
          anchorEl={anchorElHotspot}
          open={openHotspot}
          onClose={handleCloseHotspot}
          MenuListProps={{
            sx: { width: '24rem' }
          }}
        >
          {currentScene?.linkHotspots.map((v,i)=>
            <MenuItem key={i} onClick={handleCloseHotspot}>
              <div className="hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center text-base font-semibold gap-2 cursor-auto">
                <span className="flex-none icon">my_location</span>
                <span className="flex-grow min-w-0 whitespace-pre-wrap text-sm">{findSceneDataById(v.target)?.name}</span> 
                <span className="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
                  onClick={() => handelOpenEditHotspotModal(v, 'link')}
                >edit</span>
                <span className="flex-none icon p-1 hover:text-red-600 cursor-pointer"
                  onClick={() => handelOpenHotspotModal(v, 'link')}
                >delete</span>
              </div>
            </MenuItem>
          )}

          { (currentScene?.linkHotspots.length || 0) > 0 && (currentScene?.infoHotspots.length || 0) > 0
           ? <Divider />
           : null
          }
          
          {currentScene?.infoHotspots.map((v,i)=>
            <MenuItem key={i} onClick={handleCloseHotspot}>
              <div className="hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center text-base font-semibold gap-2 cursor-auto">
                <span className="flex-none icon">info</span>
                <span className="flex-grow min-w-0 whitespace-pre-wrap text-sm">{v.title}</span> 
                <span className="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
                  onClick={() => handelOpenEditHotspotModal(v, 'info')}
                >edit</span>
                <span className="flex-none icon p-1 hover:text-red-600 cursor-pointer"
                  onClick={() => handelOpenHotspotModal(v, 'info')}
                >delete</span>
              </div>
            </MenuItem>
          )}

          { currentScene?.linkHotspots.length == 0 && currentScene?.infoHotspots.length == 0
           ? <div className='px-4 py-1.5'>Không có điểm nóng nào</div>
           : null
          }
        </Menu>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white select-none z-10">
        <div className="absolute left-0 top-0 flex-none flex divide-x divide-transparent">
          <span className="icon w-10 h-10 p-2 bg-sky-600 cursor-pointer"
            onClick={() => setOpenModalAdd(currentScene)}
          >
            <span className="material-symbols-outlined">edit</span>
          </span> 
          <span className="icon w-10 h-10 p-2 bg-red-600 cursor-pointer"
            onClick={() => setOpenDeleteModal(true)}
          >
            <span className="material-symbols-outlined">delete</span>
          </span>
        </div> 
        <div className="text-center p-2">{currentScene?.name}</div> 
          <div className="absolute right-0 top-0 flex-none flex divide-x divide-transparent">
            <button type="submit" className="icon w-10 h-10 p-2 bg-blue-500 hover:bg-blue-400 cursor-pointer"
              onClick={handelUpdateInitial}
            >
              <span className="material-symbols-outlined">save</span>
            </button>
        </div>
      </div>

      {/* dialog delete scene */}
      <Dialog
        open={openDeleteModal}
        keepMounted
        onClose={() => handelCloseModal(false)}
      >
        <DialogTitle>Xóa điểm chụp</DialogTitle>
        <DialogContent>
          Bạn có thực sự muốn xóa điểm chụp <span className="text-red-500">{currentScene?.name}</span>?
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={() => handelCloseModal(false)}>Hủy</Button>
          <Button disabled={loading} variant='contained' color='error' onClick={handelDeleteScene} startIcon={loading ? (
            <span className='icon animate-spin'>progress_activity</span>
          ) : null} >Tiếp tục</Button>
        </DialogActions>
      </Dialog>

      {/* dialog delete hotspot */}
      <Dialog
        open={openDeleteHotspotModal}
        keepMounted
        onClose={() => handelCloseHotspotModal(false)}
      >
        <DialogTitle>Xóa điểm nóng</DialogTitle>
        <DialogContent>
          Bạn có thực sự muốn xóa điểm nóng <span className="text-red-500">{getHotspotDeleteName()}</span>?
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={() => handelCloseHotspotModal(false)}>Hủy</Button>
          <Button disabled={loading} variant='contained' color='error' onClick={handelDeleteHotspot} startIcon={loading ? (
            <span className='icon animate-spin'>progress_activity</span>
          ) : null} >Tiếp tục</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AdminSceneControl