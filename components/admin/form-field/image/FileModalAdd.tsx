"use client"
import {useEffect, useState, memo} from 'react'
import { Box, Button, CircularProgress, Zoom } from '@mui/material';
import { uploadFiles } from '@/lib/admin/filesUpload';
import { FileTypeState } from '@/lib/admin/sample';
import { promiseFunction } from '@/lib/admin/promise';
import FileIcon from './FileIcon';
import { Backdrop } from '@mui/material';
import { Modal } from '@mui/material';
import { createPortal } from 'react-dom';

type AddModalFileState = {
  show: boolean,
  setShow: (data: boolean) => void,
  setData: (data: any) => void,
  tableName: string,
  folderFileId?: string,
  fileTypes?: FileTypeState
}

const AdminFileAdd= memo(({
  show, setShow, setData, tableName, folderFileId, fileTypes = ['image']
}: AddModalFileState) => {
  const [files, setFiles] = useState<{
    name: string,
    type: string,
    preview: string,
    file: File
  }[]>([])

  const [isAddFiles, setIsAddFiles] = useState(false)
  const [loading, setLoading] = useState(false)

  const changeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    let tmpFiles = e.target.files ?? []
    let newFiles: any = []
    Array.from(tmpFiles).map((v,i) => {
      if (files.findIndex(v2 => v2.name == v.name) < 0) {
        newFiles.push({
          name: v.name,
          type: v.type,
          preview: URL.createObjectURL(v),
          file: v
        })
      }
    })

    setFiles((state) => [...state, ...newFiles])
  }

  useEffect(() => {
    if (files.length > 0) {
      setIsAddFiles(true)
    }
    else {
      setIsAddFiles(false)
    }
  }, [files])

  const removeFileChange = (index: number) => {
    URL.revokeObjectURL(files[index].preview)
    setFiles(files.filter((v,i) => i != index))
  }

  const upload = async () => {
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        var formData = new FormData()

        files.map(v => {
          formData.append('files[]', v.file)
        })

        const { files: filesData } = await uploadFiles({
          formData: formData,
          tableName: tableName,
          folderFileId: folderFileId,
          fileTypes: fileTypes
        })

        files.forEach((v,i) => {
          URL.revokeObjectURL(files[i].preview)
        })
        setFiles([])

        setShow(false)
        setData(filesData)
      }
    })
   
  }

  useEffect(() => {
    return () => {
      files.forEach((v,i) => {
        URL.revokeObjectURL(files[i].preview)
      })
    }
  }, [])

  return (
    <>
      <Modal
        open={show}
        // keepMounted={true}
        onClose={() => setShow(false)}
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
            <div className="p-6 flex items-center justify-between">
              <span className='text-xl font-semibold'>Thêm tài sản mới</span>
              <span 
                className="w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                onClick={() => setShow(false)}
              >
                <span className="icon">close</span>
              </span>
            </div>

            <div className="py-6 pt-0 border-y">
              { isAddFiles
                ? <>
                  <div className="px-6 pt-6 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold">{files.length} tài sản đã sẵn sàng để tải lên</h5>
                      <p className="text-sm mt-1 text-gray-600">Quản lý tài sản trước khi thêm chúng vào thư viện phương tiện</p>
                    </div>
                    <Button variant="contained" onClick={(e) => setIsAddFiles(false)}>Thêm file</Button>
                  </div>
                  <div className="px-6 mt-6 grid gap-4 overflow-y-auto max-h-[60vh]" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))'}}>
                    { files.map((v,i) =>
                      <div className="rounded border overflow-hidden" key={i}>
                        <div className="relative w-full h-24 bg-make-transparent">
                          <FileIcon name={v.name} mime={v.type} url={v.preview}/>
                          <span
                            className="absolute top-2 right-2 icon w-8 h-8 !text-[18px] rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                            onClick={() => {removeFileChange(i)}}
                          >
                            delete
                          </span>
                        </div>
                        <div className="p-4 py-2 flex flex-col items-start space-y-2 text-xs">
                          <p className="font-semibold break-words">{v.name}</p>
                          <p className="uppercase text-[10px] p-1 py-0.5 font-semibold rounded bg-gray-100">{v.type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
                : <>
                  <div className="px-6 flex items-center border-b">
                    <div className="p-4 uppercase text-xs font-semibold text-blue-600 border-b border-blue-600">
                      <span>Từ máy tính của bạn</span>
                    </div> 
                  </div>
                  <div className="px-6 mt-6 overflow-y-auto max-h-[60vh] flex flex-col items-center justify-center w-full border border-dashed py-12 rounded bg-gray-50">
                    <span className="icon text-blue-600 !text-6xl">
                      attach_file_add
                    </span>
                    <span className="my-4 font-semibold">Bấm để thêm một tài sản</span>
                    <Button variant="contained" component="label">
                      Chọn file
                      <input hidden type="file" name="fileUpload" id="fileUpload" 
                        multiple={true} accept={fileTypes.includes('all') ? '*' : fileTypes.map(v => `${v}/*`).toString()} 
                        onChange={(e) => changeFiles(e)} 
                      />
                    </Button>
                  </div>
                </>
              }
            </div>

            <div className="p-6 bg-gray-100 flex items-center">
              <Button variant="outlined" size='small' color='inherit' onClick={() => setShow(false)}>
                Hủy bỏ
              </Button>

              <Button className='!ml-auto' variant="contained" size='small' color='primary'
                onClick={upload}
              >
                Tải tài sản lên
              </Button>
            </div>
          </Box>
        </Zoom>
      </Modal>

      {createPortal(
        <Backdrop
          sx={{ color: '#fff', zIndex: 99999 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>,
        document.body
      )}
    </>
  )
})

export default AdminFileAdd