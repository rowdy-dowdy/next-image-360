"use client"
import { SceneDataState } from '@/app/admin/(admin)/scenes/page'
import { promiseFunction } from '@/lib/admin/promise'
import { sortScene } from '@/lib/admin/scene'
import { removeAccents } from '@/lib/utils/helper'
import { Button, TextField } from '@mui/material'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs';

const ListScene = ({
  scenes, setOpenModalAdd, sceneId, setSceneId
}: {
  scenes: SceneDataState[],
  setOpenModalAdd: (data: SceneDataState | null) => void,
  sceneId?: string, 
  setSceneId: Dispatch<SetStateAction<string>>
}) => {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const [scenesFilter, setScenesFilter] = useState<SceneDataState[]>(scenes)

  useEffect(() => {
    setScenesFilter(scenes.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0))
  }, [search])

  // sort scene
  const sortable = useRef<Sortable>()
  const listRef = useRef(null)
  const [stages, setStages] = useState(scenes.map(v => v.id))

  useEffect(() => {
    setScenesFilter(scenes.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0))
    setStages(scenes.map(v => v.id))
  }, [scenes])
  

  const checkSort = (scenesFilter.length == scenes.length) && (JSON.stringify(scenes.map(v => v.id)) != JSON.stringify(stages))

  const handleSort = (newIndex: number, oldIndex: number) => {
    let updatedItems = [...stages]
    let [movedItem] = updatedItems.splice(oldIndex, 1)
    updatedItems.splice(newIndex, 0, movedItem)
    setStages(updatedItems)
  };

  useEffect(() => {
    if (sortable.current) {
      sortable.current.options.onSort = (event: any) => {
        const { newIndex, oldIndex } = event;
        handleSort(newIndex, oldIndex)
      }
    }
  }, [stages, handleSort])

  const [loading, setLoading] = useState(false)

  const handelSortList = async () => {
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        await sortScene(stages)

        router.refresh()
      }
    })
  }

  useEffect(() => {
    if (listRef.current) {
      sortable.current = new Sortable(listRef.current, {
        animation: 150,
        handle: '.item-handel'
      })
    }

    return () => {
      sortable.current?.destroy()
    };
  }, [])


  return (
    <div className='w-full h-full flex flex-col space-y-4 py-4'>
      <div className="px-4">
        <TextField InputProps={{
            startAdornment: (
              <span className='icon'>search</span>
            )
          }} fullWidth={true} size='small' placeholder='Tìm kiếm...' 
          value={search}
          onChange={(e => setSearch(e.target.value))}
        />
      </div>

      <div className='border-b mx-4'></div>

      <div ref={listRef} className="flex-grow min-h-0 flex flex-col space-y-2 overflow-y-auto px-4">
        { scenesFilter.length > 0 ? scenesFilter.map(v =>
            <button key={v.id} className={`flex items-center space-x-4 rounded hover:bg-gray-200 px-2 py-2 group ${v.publish == "draft" ? 'text-gray-500' : ''} ${sceneId == v.id ? 'bg-gray-200' : ''}`}
              onClick={() => setSceneId(v.id)}
            >
              <span className="icon">location_on</span>
              <span className="flex-grow min-w-0 text-left">{v.name}</span> 
              <span className={`item-handel flex-none icon invisible pointer-events-none group-hover:visible 
                group-hover:pointer-events-auto !ml-auto text-teal-500 hover:text-teal-600 
                ${scenesFilter.length < scenes.length ? '!invisible !pointer-events-none' : ''}`}>
                drag_indicator
              </span>
            </button>
          )
          : <p className="p-2">Không tìm thấy điểm chụp nào</p>
        }
      </div>

      { checkSort
        ? <Button variant='contained' startIcon={loading ? (
          <span className='icon animate-spin'>progress_activity</span>
        ): <span className='icon'>save</span>} className='!mx-4' disabled={loading} onClick={handelSortList} >Lưu vị trí</Button>
       : null
      }

      <Button variant='outlined' startIcon={(
        <span className='icon'>add</span>
      )} className='!mx-4' onClick={() => setOpenModalAdd(null)} >Thêm bối cảnh mới</Button>

    </div>
  )
}

export default ListScene