"use client"
import {useEffect, useState} from 'react'
import { Backdrop, Box, Button, Dialog, DialogContent, Zoom } from '@mui/material';
import { FolderFile } from '@prisma/client';
import AdminFormFieldText from '../AdminFormFieldText';
import moment from 'moment';
import { createEditFolder, deleteFolder } from '@/lib/admin/filesUpload';
import { promiseFunction } from '@/lib/admin/promise';
import { Modal } from '@mui/material';
import { createPortal } from 'react-dom';
import { DialogTitle } from '@mui/material';
import { DialogActions } from '@mui/material';

type AddModalType = {
  show: boolean,
  setShow: (data: boolean) => void,
  data: FolderFile | null
  setData: (data: FolderFile) => void,
  parentId?: string,
  tableName: string,
  dataDelete: FolderFile | null,
  setDataDelete: (data: FolderFile) => void,
}

const AdminFileModalAddFolder: React.FC<AddModalType> = ({
  show, setShow, data, setData, tableName, parentId,
  dataDelete, setDataDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    setName(data?.name || '')
  }, [data])

  const handelClose = () => {
    if (!loading) {
      setShow(false)
    }
  }

  const handelSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        const { folder } = await createEditFolder({
          folderId: data?.id,
          name: name,
          tableName: tableName,
          parentId: data ? data.parentId : parentId
        })
  
        setShow(false)
        setData(folder)
      }
    })
  }

  // delete
  const [deletePopup, setDeletePopup] = useState(false)

  const handelDeleteFolder = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    if (!data) return

    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        await deleteFolder({
          folderId: data.id
        })
  
        setDeletePopup(false)
        setShow(false)
        setDataDelete(data)
      }
    })
  }

  return (
    <div>
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
          <Box className='w-[42rem] max-w-[100vw] absolute left-1/2 top-1/2 
            !-translate-x-1/2 !-translate-y-1/2 rounded shadow bg-white outline-none'
          >
            <div className="p-6 flex items-center space-x-4">
              <span className='text-xl font-semibold'>{data ? 'Sửa' : 'Thêm'} thư mục mới</span>
              <div className="!ml-auto"></div>
              { data
                ? <Button variant="contained" size='small' color='error' 
                  startIcon={<span className='icon'>delete</span>}
                  onClick={() => setDeletePopup(true)}
                >
                  Xóa
                </Button>
                : null
              }
              <span 
                className="w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                onClick={handelClose}
              >
                <span className="icon">close</span>
              </span>
            </div>

            <div className="p-6 border-y">
              { data
                ? <div className="p-4 rounded bg-gray-50 flex space-x-4 text-xs text-gray-800 mb-4">
                  <div className='w-1/2'>
                    <p className="uppercase">Creation Date</p>
                    <p>{moment(data.createdAt).format('DD/MM/YYYY')}</p>
                  </div>
                  <div className='w-1/2'>
                    <p className="uppercase">Update Date</p>
                    <p>{moment(data.updatedAt).format('DD/MM/YYYY')}</p>
                  </div>
                </div>
                : null
              }

              <AdminFormFieldText label='Tên' name='name' value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="p-6 bg-gray-100 flex items-center">
              <Button variant="outlined" size='small' color='inherit' disabled={loading} onClick={handelClose}>
                Hủy bỏ
              </Button>

              <Button className='!ml-auto' variant="contained" disabled={loading} size='small' color='primary'
                startIcon={loading ? (<span className='icon animate-spin'>progress_activity</span>) : null}
                onClick={handelSubmit}
              >
                Tạo mới
              </Button>
            </div>
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
          <DialogTitle>Bạn chắc chắn xóa thư mục tài sản này</DialogTitle>
          <DialogContent>
            Việc xóa thư mục tài sản sẽ xóa vĩnh viễn chúng và tất cả tài sản con ra khỏi cơ sở dữ liệu và không thể khôi phục được
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} onClick={() => setDeletePopup(false)}>Hủy</Button>
            <Button disabled={loading} variant='contained' color='error' onClick={handelDeleteFolder} startIcon={loading ? (
              <span className='icon animate-spin'>progress_activity</span>
            ) : null} >Tiếp tục</Button>
          </DialogActions>
        </Dialog>,
        document.body
      )}
    </div>
  )
}

export default AdminFileModalAddFolder