"use client"
import {useEffect, useState} from 'react'
import { FolderFile, File } from '@prisma/client';
import { Box, Button, Modal, Zoom } from '@mui/material';
import AdminFileAdd from './FileModalAdd';
import AdminFileEdit from './FileModalEdit';
import AdminFileModalAddFolder from './FileModalAddFolder';
import { getListFolderFile } from '@/lib/admin/filesUpload';
import { FileTypeState } from '@/lib/admin/sample';
import FileIcon from './FileIcon';
import { Backdrop } from '@mui/material';

type ModalType = {
  show: boolean,
  setShow: (data: boolean) => void,
  multiple?: boolean,
  data: File[]
  setData: (data: File[]) => void,
  tableName: string,
  onlyTable?: boolean,
  fileTypes?: FileTypeState
}

const AdminFileModal: React.FC<ModalType> = ({
  show, setShow, multiple, data, setData, tableName, onlyTable, fileTypes
}) => {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [folders, setFolders] = useState<FolderFile[]>([])
  const [folderParentId, setFolderParentId] = useState<string | undefined>(data.length > 0 ? (data[0].folderFileId || undefined) : undefined)
  const [folderParents, setFolderParents] = useState<FolderFile[]>([])

  // const [selects, setSelects] = useState<File[]>(data)
  const [checked, setChecked] = useState<string[]>(data.map(v => v.id))

  const [page, setPage] = useState(0)

  const [addModal, setAddModal] = useState(false)
  const [dataUpload, setDataUpload] = useState<File[]>([])

  const [editModal, setEditModal] = useState(false)
  const [dataEdit, setDataEdit] = useState<File | null>(null)

  const [addFolderModal, setAddFolderModal] = useState(false)
  const [dataFolderEdit, setDataFolderEdit] = useState<FolderFile | null>(null)
  const [dataFolderAdd, setDataFolderAdd] = useState<FolderFile | null>(null)

  // reload checked in open modal
  useEffect(() => {
    if (show) {
      setChecked(data.map(v => v.id))
    }
  }, [show])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { folderParents, folders, files: filesData } = await getListFolderFile({
        parentId: folderParentId,
        tableName: onlyTable ? tableName : undefined,
        fileTypes
      })

      setFiles(filesData)
      setFolders(folders)
      setFolderParents(folderParents)

    } catch (error) {
      return {data: []}
    } finally {
      setLoading(false)
    }
  }

  // reload data in folder
  useEffect(() => {
    fetchFiles()
  }, [folderParentId])

  // upload files
  useEffect(() => {
    if (dataUpload.length == 0) return

    fetchFiles()
    
    // checked
    var updatedList: string[] = []
    if (multiple) {
      updatedList = [...checked, ...dataUpload.map(v => v.id)]
      // setSelects(state => [...state, ...dataUpload])
    }
    else {
      updatedList = [dataUpload[0].id]
      // setSelects([dataUpload[0]])
    }

    setChecked(updatedList)
    setPage(1)

  }, [dataUpload])

  const editFile = (file: File) => {
    setDataEdit(file)
    setEditModal(true)
  }

  // add or edit folder
  useEffect(() => {
    if (dataFolderAdd) {
      let findDataFolder = folders.some(v => v.id == dataFolderAdd.id)

      if (findDataFolder) {
        setFolders(state => state.map(v => (v.id == dataFolderAdd.id) ? dataFolderAdd : v))
      }
      else {
        setFolders(state => [...state, dataFolderAdd])
      }
    }
  }, [dataFolderAdd])

  const handelAddEditFolder = (e: React.MouseEvent, dataEdit?: FolderFile) => {
    e.stopPropagation()
    if (dataEdit) {
      setDataFolderEdit(dataEdit)
    }
    else {
      setDataFolderEdit(null)
    }
    setAddFolderModal(true)
  }

  // delete folder
  const [dataFolderDelete, setDataFolderDelete] = useState<FolderFile | null>(null)

  useEffect(() => {
    setFolders(state => state.filter(v => v.id != dataFolderDelete?.id))
  }, [dataFolderDelete])

  // change folder parent
  const handelClickFolder = (id: string) => {
    setFolderParentId(id)
  }

  // Add/Remove checked item from list
  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    var updatedList: string[] = []

    if (multiple) {
      updatedList = [...checked]
      if (event.target.checked) {
        updatedList = [...checked, event.target.value]
      } else {
        updatedList.splice(checked.indexOf(event.target.value), 1)
      }
    }
    else {
      if (event.target.checked) {
        updatedList = [event.target.value]
      } else {
        updatedList = []
      }
    }
    
    var tempFiles: File[] = []

    updatedList.forEach(v => {
      let tmp = files.find(v2 => v2.id == v)
      if (tmp) {
        tempFiles.push(tmp)
      }
    })

    setChecked(updatedList)
    // setSelects(tempFiles)
  }

  const isChecked = (item: string) => checked.includes(item)

  const next = () => {
    setData(files.filter(v => checked.includes(v.id)))
    setShow(false)
  }

  return (
    <>
      <Modal
        open={show}
        // keepMounted={true}
        onClose={() => setShow(false)}
        closeAfterTransition
        keepMounted={true}
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
              <span className='text-xl font-semibold'>Danh sách tài sản</span>
              <span 
                className="w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                onClick={() => setShow(false)}
              >
                <span className="icon">close</span>
              </span>
            </div>

            <div className="border-y">
              <div className="px-6 flex items-center border-b">
                <div 
                  className={`p-4 uppercase text-xs font-semibold border-b hover:bg-blue-100 cursor-pointer border-transparent ${page == 0 ? 'text-blue-600 !border-blue-600' : ''}`}
                  onClick={() => setPage(0)}
                >
                  <span>Danh sách</span>
                  <span className="ml-1 px-1 py-0.5 bg-gray-100 rounded">{files.length}</span>
                </div>
                <div 
                  className={`p-4 uppercase text-xs font-semibold border-b hover:bg-blue-100 cursor-pointer border-transparent ${page == 1 ? 'text-blue-600 !border-blue-600' : ''}`}
                  onClick={() => setPage(1)}
                >
                  <span>Đã chọn</span>
                  <span className="ml-1 px-1 py-0.5 bg-gray-100 rounded">{checked.length}</span>
                </div>
                <Button className='!ml-auto' variant="outlined" size='small' color='primary'
                  onClick={(e) => handelAddEditFolder(e)}
                >
                  Thêm thư mục
                </Button>
                <Button className='!ml-4' variant="contained" size='small' color='primary'
                  onClick={() => setAddModal(true)}
                >
                  Thêm tài sản
                </Button>
              </div>

              <div hidden={page != 0}>
                { loading
                  ? <div className="w-full p-6 grid place-items-center">
                    <span className="icon animate-spin">
                      progress_activity
                    </span>
                  </div>
                  : <div className="">
                    { folderParents.length > 0
                      ? <div className="flex px-6 py-4 items-center bg-gray-100">
                        <span className="icon flex-none hover:bg-text-500 cursor-pointer"
                          onClick={() => setFolderParentId(undefined)}  
                        >folder_copy</span>
                        <div className="flex-grow min-w-0 flex flex-row-reverse justify-end items-center">
                          {folderParents.map((v, i) => 
                            <div key={v.id}>
                              <span className='mx-2'>/</span>
                              <span className={`text-sm hover:bg-text-500 ${i == 0 ? '' : 'text-blue-600 hover:underline cursor-pointer'}`}
                                onClick={() => setFolderParentId(v.id)}  
                              >{i == 4 ? '...' : v.name}</span>
                            </div>  
                          )}
                        </div>
                      </div>
                      : null
                    }
                    <div className='overflow-y-auto max-h-[60vh] pb-6'>
                      { folders.length > 0
                        ? <div className="mt-6 px-6">
                          <p className="font-semibold text-base mb-2">Thư mục ({folders.length})</p>
                          <div className="grid gap-4 grid-flow-col auto-cols-[100px]">
                            { folders.map(v =>
                              <div key={v.id} className="flex flex-col items-center space-y-1 px-2 py-2 bg-blue-50 rounded relative group cursor-pointer"
                                onClick={() => handelClickFolder(v.id)}
                              >
                                <span className="material-symbols-outlined icon-fill !text-5xl text-blue-500">folder</span>
                                <span className="line-clamp-3 text-center text-sm">{v.name}</span>
                                <div className="absolute top-0 right-2 w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer hidden group-hover:block"
                                  onClick={(e) => handelAddEditFolder(e,v)}
                                >
                                  <span className="icon !text-[18px]">edit</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        : null
                      }
                    
                      <div className="mt-6 px-6">
                        <p className="font-semibold text-base mb-2">Ảnh ({files.length})</p>
                        { files.length > 0
                          ? <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))'}}>
                            { files.map((v,i) =>
                              <div className="rounded border overflow-hidden" key={v.id}>
                                <div className="relative w-full h-24 bg-make-transparent group">
                                  <FileIcon name={v.name} mime={v.mime} url={v.url} caption={v.caption} width={v.naturalWidth} height={v.naturalHeight} />
                                  <div className="absolute top-2 left-2">
                                    <input type="checkbox" value={v.id} checked={isChecked(v.id)} onChange={(e) => handleCheck(e)} />
                                  </div>
                                  <span
                                    className="absolute top-2 right-2 material-symbols-outlined w-8 h-8 !text-[18px] rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer hidden group-hover:block"
                                    onClick={() => editFile(v)}
                                  >
                                    edit
                                  </span>
                                </div>
                                <div className="p-4 py-2 flex flex-col items-start space-y-2 text-xs">
                                  <p className="font-semibold break-words">{v.name}</p>
                                  <p className="uppercase text-[10px] p-1 py-0.5 font-semibold rounded bg-gray-100">{v.mime}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          : <p>Không có tài sản nào</p>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
              
              <div hidden={page != 1}>
                <div className="px-6 pt-6 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold">{checked.length} tài sản đã chọn</h5>
                    <p className="text-sm mt-1 text-gray-600">Quản lý tài sản trước khi thêm chúng vào thư viện phương tiện</p>
                  </div>
                </div>
                { checked.length > 0
                  ? <div className="px-6 my-6 grid gap-4 overflow-y-auto max-h-[60vh]" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))'}}>
                    { files.filter(v => checked.includes(v.id)).map((v,i) =>
                      <div className="rounded border overflow-hidden" key={v.id}>
                        <div className="relative w-full h-24 bg-make-transparent">
                        <FileIcon name={v.name} mime={v.mime} url={v.url} caption={v.caption} width={v.naturalWidth} height={v.naturalHeight} />
                          <div className="absolute top-2 left-2">
                            <input type="checkbox" value={v.id} checked={isChecked(v.id)} onChange={(e) => handleCheck(e)} />
                          </div>
                          <span
                            className="absolute top-2 right-2 material-symbols-outlined w-8 h-8 !text-[18px] rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer hidden group-hover:block"
                            onClick={() => editFile(v)}
                          >
                            edit
                          </span>
                        </div>
                        <div className="p-4 py-2 flex flex-col items-start space-y-2 text-xs">
                          <p className="font-semibold break-words">{v.name}</p>
                          <p className="uppercase text-[10px] p-1 py-0.5 font-semibold rounded bg-gray-100">{v.mime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  : <div className='px-6 my-6'>Không có tài sản nào được chọn</div>
                }
              </div>
            </div>

            <div className="p-6 bg-gray-100 flex items-center space-x-4">
              <Button variant="outlined" size='small' color='inherit' onClick={() => setShow(false)}>
                Hủy bỏ
              </Button>

              <div className="!ml-auto"></div>

              <Button variant="outlined" size='small' color='primary' 
                startIcon={<span className='icon'>refresh</span>}
                onClick={() => fetchFiles()}
              >
                Tải lại
              </Button>

              <Button variant="contained" size='small' color='primary'
                onClick={next}
              >
                Tiếp theo
              </Button>
            </div>
          </Box>
        </Zoom>
      </Modal>

      <AdminFileAdd tableName={tableName} fileTypes={fileTypes} folderFileId={folderParentId} show={addModal} setShow={setAddModal} setData={setDataUpload} />
      <AdminFileEdit show={editModal} setShow={setEditModal} data={dataEdit} setData={setDataEdit} setFiles={setFiles} />
      <AdminFileModalAddFolder 
        tableName={tableName} show={addFolderModal} 
        parentId={folderParentId} setShow={setAddFolderModal} 
        data={dataFolderEdit} setData={setDataFolderAdd} 
        dataDelete={dataFolderDelete} setDataDelete={setDataFolderDelete}
      />
    </>
  )
}

export default AdminFileModal