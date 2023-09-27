"use client"
import { Backdrop, Box, CircularProgress, Fade, IconButton, Menu, MenuItem, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Button, TablePagination, tableCellClasses } from '@mui/material'
import { styled } from "@mui/material/styles";
// import TablePagination from '@mui/material/TablePagination';
// import Button from '@mui/material/Button';
import { useState } from 'react'
import Link from 'next/link';
import { File } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';
import FormIOSSwitch from '@/components/FormIOSSwitch';
import { DeleteDataSampleState, SampleColumnsType, deleteDataSample } from '@/lib/admin/sample';
import { useTransition } from "react";
import FileIcon from '../form-field/image/FileIcon';
import { promiseFunction } from '@/lib/admin/promise';

export type SampleStateType = {
  data: any[],
  name: string,
  table_name: string,
  count: number,
  ROWS_PER_PAGES: number[],
  ORDER_BY?: string,
  ORDER_TYPE?: 'asc' | 'desc',
  columns: SampleColumnsType[],
  canDelete: boolean,
  canEdit: boolean,
  canCreate: boolean
}
const AdminContentSample: React.FC<SampleStateType> = ({ 
  data, name, table_name, count, ROWS_PER_PAGES, columns , canDelete,
  canEdit, canCreate, ORDER_BY, ORDER_TYPE
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const page = +(searchParams?.get('page') || 1)
  const per_page = +(searchParams?.get('per_page') || ROWS_PER_PAGES[0])

  const orderBy = searchParams?.get('order_by') || ORDER_BY
  const orderType = searchParams?.get('order_type') || ORDER_TYPE

  // const [columnsShow, setColumnsShow] = useState<SampleColumnsType[]>(columns.filter(v => v.show))

  // Avoid a layout jump when reaching the last page with empty rows.
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    let query = new URLSearchParams(searchParams?.toString())

    query.set('page', (newPage + 1).toString())
        
    router.push(`?${query.toString()}`)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let query = new URLSearchParams(searchParams?.toString())

    query.delete('page')
    query.set('per_page', (event.target.value || ROWS_PER_PAGES[0].toString()))
        
    router.push(`?${query.toString()}`)
  }

  const changeOrder = (orderByChange: string) => {
    let tempOrderBy = orderBy,
      tempOrderType = orderType

    if (orderBy == orderByChange) {
      tempOrderType = orderType == "asc" ? "desc" : orderType == "desc" ? undefined : "asc"
    }
    else {
      tempOrderBy = orderByChange
      tempOrderType = "asc"
    }

    let query = new URLSearchParams(searchParams?.toString())
    // query.delete('page')
    // query.delete('per_page')
    if (!tempOrderType || !tempOrderBy) {
      query.delete('order_by')
      query.delete('order_type')
    }
    else {
      query.set('order_by', tempOrderBy)
      query.set('order_type', tempOrderType)
    }

    router.push(`?${query.toString()}`)
  }

  // show field
  const [anchorElShowField, setAnchorElShowField] = useState<null | HTMLElement>(null)
  const openShowField = Boolean(anchorElShowField)
  const handleClickShowField = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElShowField(event.currentTarget)
  }
  const handleCloseShowField = () => {
    setAnchorElShowField(null)
  }

  const [columnShowFields, setColumnShowFields] = useState<string[]>(columns.filter(v => v.show).map(e => e.name))
  const handelChangeColumnShowField = (e: React.FormEvent<HTMLInputElement>, key: string) => {
    const { checked: isChecked } = e.target as HTMLInputElement

    if (isChecked) {
      setColumnShowFields([...columnShowFields, key])
    }
    else {
      setColumnShowFields(columnShowFields.filter(item => item !== key))
    }
  }

  // checked
  const [checked, setChecked] = useState<string[]>([])

  const handleSelectAll = () => {
    if (checked.length == data.length) {
      setChecked([])
    }
    else {
      setChecked(data.map(v => v.id))
    }
  }

  const handleSelect = (e: React.FormEvent<HTMLInputElement>) => {
    const { id, checked: isChecked } = e.target as HTMLInputElement

    if (isChecked) {
      setChecked([...checked, id])
    }
    else {
      setChecked(checked.filter(item => item !== id))
    }
  }

  // delete data item
  const [loading, setLoading] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<string | number | null>(null)

  const handleCloseModalDelete = () => {
    setIsDelete(false)
    setDeleteId(null)
  }

  const showDeleteModal = (id?: number | string) => {
    if (id != undefined) {
      setDeleteId(id)
    }

    setIsDelete(true)
  }

  const handelDeleteData = async (e: React.MouseEvent<HTMLElement>) => {
    await promiseFunction({
      loading,
      setLoading,
      callback: async () => {
        if (deleteId) {
          await deleteDataSample({ ids: [deleteId], tableName: table_name})
        }
        else if (checked.length > 0) {
          await deleteDataSample({ ids: checked, tableName: table_name})
        }
        router.refresh()
        setIsDelete(false)
      }
    })
  }

  return (
    <>
      <section className="flex items-center space-x-4">
        <div>
          <h3 className="text-2xl font-semibold">{name}</h3>
          {/* <p className="text-sm text-gray-600 mt-1">{count} bản ghi</p> */}
        </div>

        <Button variant="contained" color='error' disabled={!canDelete || checked.length == 0} 
          onClick={() => showDeleteModal()}
          startIcon={(
            <span className="material-symbols-outlined">
              delete
            </span>
          )}
        >
          Xóa bản ghi
        </Button>

        <Button href={`${pathname}/create`} disabled={!canCreate} LinkComponent={Link} className='!ml-auto' variant="contained" startIcon={(
          <span className="material-symbols-outlined">
            add
          </span>
        )}>
          Thêm bản ghi mới
        </Button>

        <div className="relative">
          <button className="flex space-x-2 p-2 pr-2 bg-white border rounded shadow" onClick={handleClickShowField}>
            <span className="material-symbols-outlined icon-fill">
              settings
            </span>
            <span className="material-symbols-outlined">
              arrow_drop_down
            </span>
          </button>
          <Menu
            anchorEl={anchorElShowField}
            open={openShowField}
            onClose={handleCloseShowField}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {columns.map(column =>
              <MenuItem key={column.name}>
                <FormIOSSwitch label={column.label} 
                  onChange={(e) => handelChangeColumnShowField(e, column.name)} 
                  checked={columnShowFields.includes(column.name)} className='block w-full'/>
              </MenuItem>
            )}
          </Menu>
        </div>
      </section>

      <section className='mt-8'>
        <Paper sx={{ width: '100%' }} className='rounded overflow-hidden'>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 222px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell style={{width: '0px'}} align="left">
                    <input type="checkbox" checked={checked.length == data.length} onChange={handleSelectAll} />
                  </StyledTableCell>
                  {columns.filter(v => columnShowFields.includes(v.name)).map((column) => (
                    <StyledTableCell
                      key={column.name}
                      align="center"
                      // width={column?.width || 'auto'}
                      style={{width: column.name == 'id' ? 0 : 'auto'}}
                      className='cursor-pointer select-none'
                      onClick={() => changeOrder(column.name)}
                    >
                      <div className="flex space-x-2 items-center justify-center">
                        <span>{column.label}</span>
                        { orderBy == column.name && orderType != undefined
                          ? <span className="icon">{orderType == "asc" ? 'arrow_drop_down' : 'arrow_drop_up'}</span>
                          : null
                        }
                      </div>
                    </StyledTableCell>
                  ))}
                  <StyledTableCell align="right" style={{width: '0px', whiteSpace: 'nowrap'}}>Hành động</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? data.map((row) => (
                  <StyledTableRow key={row.id}>
                    <TableCell align="left">
                      <input type="checkbox" id={row.id} checked={checked.includes(row.id)} onChange={handleSelect} />
                    </TableCell>
                    {columns.filter(v => columnShowFields.includes(v.name)).map(column => 
                      <TableCell align="center" key={`${row.id}-${column.name}`}>
                        { column.type == 'date'
                          ? ViewDateField(row[column.name])
                          : column.type == 'publish' ? ViewPublishField(row[column.name])
                          : column.type == 'select' ? ViewSelectField(row[column.name], column.details.list)
                          : column.type == 'file' ? ViewFileField(row[column.name])
                          : column.type == 'relation' ? ViewRelationField(row[column.name], column.details.titleRelation)
                          : column.type == 'permissions' ? null
                          : <span className={column.name == "id" ? 'whitespace-nowrap' : ''}>{row[column.name] || ''}</span>
                        }
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <div className="flex space-x-1 items-center justify-end">
                        {/* <Button color='warning' variant='contained' size='small' startIcon={(
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                        )}>Xem</Button> */}
                        <Button LinkComponent={Link} href={`${pathname}/${row.id}`} disabled={!canDelete} color='primary' variant='contained' size='small' startIcon={(
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                        )}>Sửa</Button>
                        <Button color='error' disabled={!canDelete} variant='contained' size='small' 
                          onClick={() => showDeleteModal(row.id)}
                          startIcon={(
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          )}
                        >Xóa</Button>
                      </div>
                    </TableCell>
                  </StyledTableRow>
                ))
                : <TableRow><TableCell colSpan={"100%" as any} className='!text-center'>Không có bản ghi nào</TableCell></TableRow> }
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[...ROWS_PER_PAGES, { label: 'All', value: -1 }]}
            component="div"
            count={count}
            rowsPerPage={per_page}
            page={page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </section>

      <Modal
        open={isDelete}
        onClose={handleCloseModalDelete}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isDelete}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl rounded shadow bg-white">
            <div className="p-4 flex items-center justify-between">
              <h5 className="text-lg font-medium">Xóa bản ghi</h5>
              <button className='flex' onClick={handleCloseModalDelete}>
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
            <div className="p-4 border-y bg-gray-100">
              Bạn có chắc chắn muốn xóa 
              <span className="text-red-600"> {deleteId ? `"${deleteId}"` : checked.join(', ')}</span>
            </div>
            <div className="flex items-center justify-end p-4 space-x-4">
              <Button variant="outlined" color='black' onClick={handleCloseModalDelete}>Hủy bỏ</Button>
              <Button variant="contained" color='error' onClick={handelDeleteData}>Tiếp tục</Button>
            </div>
          </div>
        </Fade>
      </Modal>

      <Backdrop
        sx={{ color: '#fff', zIndex: '99999' }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#3e3e3e",
    color: "white",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: "#0000000a",
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

const ViewDateField = (value: Date) => {
  const date = moment(value)
  const formattedDate = date.format('YYYY-MM-DD')
  const formattedTime = date.format('HH:mm:ss')

  return <div className="whitespace-nowrap text-center">
    <p className="text-sm">{formattedDate}</p>
    <p className='text-gray-500 text-xs'>{formattedTime}</p>
  </div>
}

const ViewPublishField = (value: string) => {
  return <div className={`inline-block px-4 py-1.5 rounded border font-semibold 
    ${value == 'draft' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-green-100 border-green-300 text-green-700'}`}
  >
    { value == 'draft' ? 'Nháp' : 'Xuất bản'}
  </div>
}

const ViewFileField = (data: File | File[] | null) => {
  if (data == null) {
    return null
  }

  const files = Array.isArray(data) ? data : [data]
  const length = files.length > 2 ? 2 : files.length

  return (
    <div className="flex -space-x-10 justify-center">
      {files.slice(0, length).map((file,i) =>
        <FileIcon key={file.id} name={file.name} mime={file.mime} url={file.url} className='w-20 h-16 rounded-lg object-cover ring-2 ring-white' />
      )}
      {files.length > length 
        ? <div className="h-16 rounded-lg ring-2 ring-white bg-gray-300/90 flex items-center px-2 font-semibold text-xs">+{files.length - length} more</div>
        : null
      }
    </div>
  )
}

const ViewRelationField = (data: any | any[] | null, title: string) => {
  if (data == null) {
    return null
  }

  const list = Array.isArray(data) ? data : [data]
  const length = list.length > 3 ? 3 : list.length

  return (
    <div className="flex flex-wrap items-center justify-center -mx-1">
      {list.slice(0, length).map((item,i) =>
        <div className="px-1 mb-2" key={item.id}>
          <div key={item.id} className='rounded-full bg-gray-200 px-2 py-1.5 font-semibold text-xs'>{item[title] || ''}</div>
        </div>
      )}
      {list.length > length 
        ? <div className="rounded-lg bg-gray-300/90 flex items-center p-2 font-semibold text-xs">+{list.length - length} more</div>
        : null
      }
    </div>
  )
}

const ViewSelectField = (value: string, list: { title: string, value: string}[]) => {
  const data = list.find(v => v.value == value)?.title || ''
  return (<span>{data}</span>)
}

export default AdminContentSample