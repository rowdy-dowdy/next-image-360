"use client"
import {Dispatch, FormEvent, SetStateAction, useState} from 'react'
import { File } from '@prisma/client';
import { Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, Tooltip, Zoom } from '@mui/material';
import { formatBytes, formatDate } from '@/lib/utils/helper';
import { promiseFunction } from '@/lib/admin/promise';
import { Modal } from '@mui/material';
import FileIcon from './FileIcon';
import { deleteFileData, editFileData } from '@/lib/admin/filesUpload';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { createPortal } from 'react-dom';

type EditModalType = {
  show: boolean,
  setShow: (data: boolean) => void,
  data: File | null,
  setData: (data: any) => void,
  setFiles: Dispatch<SetStateAction<File[]>>
}

const AdminFileEdit: React.FC<EditModalType> = ({show, setShow, data, setData, setFiles}) => {
  const [loading, setLoading] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)

  const handelClose = () => {
    if (loading) return
    setShow(false)
  }

  const handelUpdate = async (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!data) return
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        const {name, caption, height, width}: any = Object.fromEntries(
          new FormData(e.target as HTMLFormElement)
        )

        const {file} = await editFileData({
          id: data.id, 
          name, caption, height, width
        })

        setData(file)

        setFiles(state => state.map(v => {
          if (v.id == file.id) {
            return file
          }
          return v
        }))

        setShow(false)
      }
    })
  }

  const download = () => {
    if (typeof window === "undefined" || !data) return
    var a = document.createElement('a')
    a.href = data.url
    a.download = data.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const copy = () => {
    if (typeof window === "undefined" || !data) return
    navigator.clipboard.writeText(window.location.origin + data.url);
  }

  const deleteFile = async () => {
    if (!data) return
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        await deleteFileData({
          id: data.id, 
          url: data.url
        })

        setDeletePopup(false)
        setData(null)

        setFiles(state => state.filter(v => v.id != data.id))
        setShow(false)
      }
    })
  }

  return (
    <>
      <Modal
        open={show}
        // keepMounted={true}
        onClose={handelClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Zoom in={show} unmountOnExit>
          <Box className='w-[48rem] max-w-[100vw] absolute left-1/2 top-1/2 
            !-translate-x-1/2 !-translate-y-1/2 rounded shadow bg-white outline-none'
          >
            <form onSubmit={handelUpdate}>
              <div className="p-6 flex items-center justify-between">
                <span className='text-xl font-semibold'>Chi tiết hình tài sản</span>
                <span
                  className="w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                  onClick={handelClose}
                >
                  <span className="icon">close</span>
                </span>
              </div>
              <div className={`relative p-6 border-y overflow-y-auto max-h-[60vh] flex space-x-4 items-start ${deletePopup ? '!overflow-hidden': ''}`}>
                <div className="w-1/2 rounded border bg-gray-200">
                  <div className="p-2 flex justify-end space-x-2">
                    <Tooltip title="Xóa tài sản" placement="top">
                      <span className="icon w-8 h-8 !text-lg rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                        onClick={() => setDeletePopup(true)}
                      >
                        delete
                      </span>
                    </Tooltip>
                    <Tooltip title="Tải tài sản xuống" placement="top">
                      <span className="icon w-8 h-8 !text-lg rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                        onClick={download}
                      >
                        download
                      </span>
                    </Tooltip>
                    <Tooltip title="Sao chép liên kết" placement="top">
                      <span className="icon w-8 h-8 !text-lg rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                        onClick={copy}
                      >
                        content_copy
                      </span>
                    </Tooltip>
                  </div>
                  <div className="w-full h-36 bg-make-transparent">
                    { data
                     ? <FileIcon name={data.name} mime={data.mime} url={data.url} caption={data?.caption} width={data?.naturalWidth} height={data?.naturalHeight} />
                     : <p className="p2">Không tìm thấy ảnh</p>
                    }
              
                  </div>
                  <div className="p-6"></div>
                </div>
                <div className="w-1/2">
                  <div className="w-full rounded px-6 py-4 bg-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <p className="uppercase font-semibold">Kích cỡ</p>
                      <p className='mt-1'>{formatBytes(data?.size)}</p>
                    </div>
                    <div>
                      <p className="uppercase font-semibold">Kích thước</p>
                      <p className='mt-1'>{`${data?.naturalWidth}X${data?.naturalHeight}`}</p>
                    </div>
                    <div>
                      <p className="uppercase font-semibold">Ngày</p>
                      <p className='mt-1'>{formatDate(data?.createdAt)}</p>
                    </div>
                    <div>
                      <p className="uppercase font-semibold">Phần mở rộng</p>
                      <p className='mt-1'>{data?.mime || "Trống"}</p>
                    </div>
                    <div>
                      <p className="uppercase font-semibold">ID tài sản</p>
                      <p className='mt-1'>{data?.id || "Trống"}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col space-y-4">
                    <div className='flex flex-col'>
                      <label className="font-semibold text-xs mb-1">Tên tài sản</label>
                      <input type="text" className='rounded border px-4 py-2 bg-white focus:ring-2 ring-blue-500' name='name' defaultValue={data?.name} required />
                    </div>
                    <div className='flex flex-col'>
                      <label className="font-semibold text-xs mb-1">Mô tả</label>
                      <input type="text" className='rounded border px-4 py-2 bg-white focus:ring-2 ring-blue-500' name='caption' defaultValue={data?.caption || ""} />
                    </div>
                    <div className='flex flex-col'>
                      <label className="font-semibold text-xs mb-1">Độ dài tài sản hiện thị (chỉ hoạt động với ảnh)</label>
                      <input type="number" className='rounded border px-4 py-2 bg-white focus:ring-2 ring-blue-500' name='width' defaultValue={data?.width || ""} />
                    </div>
                    <div className='flex flex-col'>
                      <label className="font-semibold text-xs mb-1">Chiều cao tài sản hiện thị (chỉ hoạt động với ảnh)</label>
                      <input type="number" className='rounded border px-4 py-2 bg-white focus:ring-2 ring-blue-500' name='height' defaultValue={data?.height || ""} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-100 flex items-center">
                <Button variant="outlined" disabled={loading} size='small' color='inherit' onClick={handelClose}>
                  Hủy bỏ
                </Button>
                <Button className='!ml-auto' disabled={loading} type='submit' variant="contained" size='small' color='primary'
                  startIcon={loading ? <span className='icon animate-spin'>progress_activity</span> : null}
                >
                  Lưu
                </Button>
              </div>
            </form>
          </Box>
        </Zoom>
      </Modal>

      {createPortal(
        <Dialog
          open={deletePopup}
          keepMounted
          onClose={() => {
            if (!loading) {
              setDeletePopup(false)
            }
          }}
          sx={{zIndex: 99999}}
          maxWidth={'xs'}
        >
          <DialogTitle>Bạn chắc chắn xóa tài sản này</DialogTitle>
          <DialogContent>
            Việc xóa tài sản sẽ xóa vĩnh viễn chúng ra khỏi cơ sở dữ liệu và không thể khôi phục được
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} onClick={() => setDeletePopup(false)}>Hủy</Button>
            <Button disabled={loading} variant='contained' color='error' onClick={deleteFile} startIcon={loading ? (
              <span className='icon animate-spin'>progress_activity</span>
            ) : null} >Tiếp tục</Button>
          </DialogActions>
        </Dialog>,
        document.body
      )}
    </>
  )
}

export default AdminFileEdit