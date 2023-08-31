"use client"
import { Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, Fade, Menu, Modal, Tab, Tabs, TextField, } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from 'react'
import { GroupSetting, InfoHotspot, LinkHotspot } from '@prisma/client';
import { promiseFunction } from '@/lib/admin/promise';
import AdminFormFieldRelation from '../form-field/AdminFormFieldRelation';
import AdminFormFieldSelect from '../form-field/AdminFormFieldSelect';
import AdminFormFieldText from '../form-field/AdminFormFieldText';
import AdminFormFieldRichText from '../form-field/AdminFormFieldRichText';
import { createEditHotspot } from '@/lib/admin/scene';
import { SceneDataState } from '@/app/admin/(admin)/scenes/page';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

const HotspotAddModal = ({
  sceneId, coordinates, data, open, setOpen, tabCurrentHotspot, setTabCurrentHotspot,
  scenes
}: {
  scenes: SceneDataState[],
  sceneId?: string,
  coordinates: {
    yaw: number;
    pitch: number;
  },
  data?: any | null,
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>;
  tabCurrentHotspot: 'link' | 'info',
  setTabCurrentHotspot: Dispatch<SetStateAction<'link' | 'info'>>;
}) => {
  const router = useRouter()

  const [target, setTarget] = useState<any>(null)
  const [type, setType] = useState<string>('1')
  const [title, setTitle] = useState('')
  const [video, setVideo] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (data) {
      if (data.target) {
        const tempData = scenes.find(v => v.id == data.target)
        setTarget(tempData || undefined)
      }
      setType(data.type || '1')
      setTitle(data.title || '')
      setVideo(data.video || '')
      setDescription(data.description || '')
    }
    else {
      setTarget(null)
      setType('1')
      setTitle('')
      setVideo('')
      setDescription('')
    }
  }, [data])

  const handleClose = () => {
    if (loading) return
    setOpen(false)
  }

  const handleChangeTab = (event: React.SyntheticEvent, newValue: 'link' | 'info') => {
    setTabCurrentHotspot(newValue)
  };

  // const [infoType, setInfoType] = useState('1')

  const [loading, setLoading] = useState(false)
  const handelSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await promiseFunction({
      loading: loading,
      setLoading: setLoading,
      callback: async () => {
        const formData = new FormData(e.target as HTMLFormElement)

        await createEditHotspot(formData)

        router.refresh()
        setOpen(false)
      }
    })
  }

  return (
    <>
      <Modal
        open={open}
        // keepMounted={true}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style} className='w-[600px] max-w-[100vw] rounded shadow bg-white outline-none'>
            <form onSubmit={handelSubmit}>
              <input type="hidden" name="id" value={data?.id || ''} />
              <input type="hidden" name="sceneId" value={sceneId || ''} />
              <input type="hidden" name="hotspotType" value={tabCurrentHotspot} />
              <input type="hidden" name="yaw" value={data ? data.yaw : (coordinates.yaw || '')} />
              <input type="hidden" name="pitch" value={data ? data.pitch : (coordinates.pitch || '')} />
              <div className="px-6 pt-4 flex items-center justify-between">
                <span className='text-xl font-semibold'>{data ? 'Sửa' : 'Thêm'} điểm nóng mới</span>
                <span
                  className="w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                  onClick={() => setOpen(false)}
                >
                  <span className="icon">close</span>
                </span>
              </div>
              <div className="px-6">
                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={tabCurrentHotspot}
                    onChange={handleChangeTab}
                  >
                    <Tab value="link" label="Liên kết" icon={(<span className='icon'>my_location</span>)} iconPosition="start" />
                    <Tab value="info" label="Thông tin" icon={(<span className='icon'>info</span>)} iconPosition="start" />
                  </Tabs>
                </Box>
              </div>
              <div className="px-6 border-y max-h-[calc(100vh-220px)] overflow-y-auto">
                
                { tabCurrentHotspot == "link"
                  ? <div className="mt-4 rounded bg-gray-50 p-4 flex flex-col space-y-4">
                      <TextField variant="standard" disabled label="Tọa độ" value={JSON.stringify(data ? {yaw: data.yaw, pitch: data.pitch} : coordinates)} />
                      <AdminFormFieldRelation 
                        label='Chọn điểm chụp' 
                        name='target' 
                        details={{tableNameRelation: 'scene', titleRelation: 'name', typeRelation: 'many-to-one'}} 
                        required={true} 
                        value={target}
                        onChange={(v) => setTarget(v)}
                      />
                      <AdminFormFieldSelect label='loại' name='type' details={{list: [
                        {title: 'Cơ bản', value: '1'},
                        {title: 'Trên cao', value: '2'},
                        {title: 'Mặt đất', value: '3'},
                        {title: 'Thông tin', value: '4'}
                      ]}} required={true} value={type} onChange={v => setType(v.target.value)} />
                    </div>
                  : <div className="mt-4 rounded bg-gray-50 p-4 flex flex-col space-y-4">
                      <TextField variant="standard" disabled label="Tọa độ" value={JSON.stringify(data ? {yaw: data.yaw, pitch: data.pitch} : coordinates)} />
                      <AdminFormFieldText 
                        label='Tiêu đề' 
                        name='title' 
                        required={true} 
                        value={title}
                        onChange={(v) => setTitle(v.target.value)}
                      />
                      <AdminFormFieldSelect label='loại' name='type' details={{list: [
                        {title: 'Cơ bản', value: '1'},
                        {title: 'Video', value: '2'},
                      ]}} required={true} value={type} onChange={v => setType(v.target.value)} />
                      {
                        type == "2"
                        ? <AdminFormFieldText 
                          label='Video' 
                          name='video' 
                          required={true} 
                          value={video}
                          onChange={(v) => setVideo(v.target.value)}
                        />
                        : <AdminFormFieldRichText 
                          placeholder='eg. NrkWdRHKfZE' 
                          label='Nội dung' 
                          name='description' 
                          required={true} 
                          value={description}
                          onChange={(v) => setDescription(v)}
                        />
                      }
                  
                    </div>
                }
                
              </div>
              <div className="p-6 bg-gray-100 flex items-center">
                <Button disabled={loading} variant="outlined" size='small' color='inherit' onClick={() => setOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type='submit' disabled={loading} className='!ml-auto' variant='contained' size='small' color='primary' startIcon={loading ? (
                  <span className='icon animate-spin'>progress_activity</span>
                ) : null} >Tiếp tục</Button>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default HotspotAddModal