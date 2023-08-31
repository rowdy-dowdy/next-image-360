"use client"

import { promiseFunction } from "@/lib/admin/promise"
import { Drawer, TableHead } from "@mui/material"
import { TableBody } from "@mui/material"
import { Paper, Table, TableCell, TableContainer, TableRow } from "@mui/material"
import moment from "moment"
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";
import { generatePaginationArray } from "./pagination"
import Image from "next/image"
import { AdminHistoryState } from "@/app/admin/(admin)/page"
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

const AdminHistoryTable = ({
  getAdminHistory
}: {
  getAdminHistory: (page?: number, per_page?: number) => Promise<{data: AdminHistoryState[], count: number}>
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AdminHistoryState[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [maxPage, setMaxPage] = useState(1)
  const [listPage, setListPage] = useState<{
    title: string | number,
    active:boolean,
    link: number | null
  }[]>([])

  const fetchData = (page: number, perPage: number) => promiseFunction({
    loading,
    setLoading,
    showSuccessTitle: false,
    callback: async () => {
      const { data, count } = await getAdminHistory(page, perPage)

      const tempMaxPage = Math.ceil(count / perPage)

      setData(data)
      setMaxPage(tempMaxPage)
      
      setListPage(generatePaginationArray(tempMaxPage, page))
    }
  })

  useEffect(() => {
    fetchData(page, perPage)
  }, [page])

  // click data show details
  const [dataShow, setDataShow] = useState<AdminHistoryState | null>(null)
  const handelClickItem = (data: AdminHistoryState) => {
    setDataShow(data)
  }

  // prismjs hightlight
  useEffect(() => {
    Prism.highlightAll()
  }, [data])

  return (
    <>
      <section className='mt-4 relative'>
        <Paper sx={{ width: '100%' }} className='overflow-hidden !shadow-none'>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 282px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Quản trị viên</TableCell>
                  <TableCell>Trạng thái và ID</TableCell>
                  <TableCell>Hành động</TableCell>
                  <TableCell>Bảng</TableCell>
                  <TableCell>Dữ liệu</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { data.length > 0
                  ? data.map((v,i) =>
                    <TableRow key={v.id} onClick={() => handelClickItem(v)} className="hover:bg-blue-50 cursor-pointer">
                      <TableCell>
                        <ViewDateField value={v.createdAt} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-12 h-12 rounded-full border-2 border-white overflow-hidden ${!v?.admin.image ? 'bg-blue-500' : ''} shadow grid place-items-center`}>
                            { v.admin.image?.url
                              ? <Image src={v.admin.image?.url} alt={`image profile ${v.admin.name}`} width={48} height={48} />
                              : <span className="icon icon-fill !text-white !text-3xl">
                                person
                              </span>
                            }
                          </div>
                          <div>
                            <p className="font-semibold">{v.admin.name}</p>
                            <p className="text-gray-600">{v.admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`icon ${v.status == 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {v.status == 'success' ? 'task_alt' : 'cancel'}
                          </span>
                          <p className="font-semibold">#{v.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{v.action}</p>
                          <p className="mt-1">{v.title}</p>
                        </div>
                      </TableCell>
                      <TableCell className="!font-semibold !text-teal-600">{v.tableName || '...'}</TableCell>
                      <TableCell>
                        <pre className="line-clamp-3 !overflow-hidden max-w-md">
                          { v.data
                           ? <code className="language-js">
                              {v.data}
                            </code>
                            : '...'
                          }
                          
                        </pre>
                      </TableCell>
                    </TableRow>
                  )
                  : <TableRow><TableCell colSpan={"100%" as any} className='!text-center'>Không có bản ghi nào</TableCell></TableRow>
                }
              </TableBody>
            </Table>
          </TableContainer>
          <div className="flex pt-6 px-4 items-center justify-between space-x-4">
            <button disabled={page == 1} className={`w-9 h-9 p-1 rounded bg-gray-100 ${page > 1 ? 'hover:bg-gray-200' : ''}`}
              onClick={() => setPage(state => state > 1 ? state - 1 : state)}
            >
              <span className="icon">chevron_left</span>
            </button>
            <div className="flex items-center font-semibold space-x-1">
              {listPage.map((v,i) =>
                <button
                  key={i}
                  disabled={v.active || !v.link}
                  className={`w-9 h-9 p-1 rounded ${v.link ? 'hover:bg-gray-200' : ''} ${v.active ? '!bg-blue-500 text-white' : ''}`}
                  onClick={() => v.link ? setPage(v.link) : null}
                >
                  {v.title}
                </button>
              )}
            </div>
            <button disabled={page == maxPage} className={`w-9 h-9 p-1 rounded bg-gray-100 ${page < maxPage ? 'hover:bg-gray-200' : ''}`}
              onClick={() => setPage(state => state < maxPage ? state + 1 : state)}
            >
              <span className="icon">chevron_right</span>
            </button>
          </div>
        </Paper>

        { loading
          ? <div className="absolute top-0 left-0 w-full h-full grid place-items-center bg-white/60 z-10">
            <span className="icon animate-spin">progress_activity</span>
          </div>
          : null
        }
      </section>

      <TableItem data={dataShow} setData={setDataShow} />
    </>
  )
}

const ViewDateField = ({value}:{value: Date}) => {
  const date = moment(value)
  const formattedDate = date.format('YYYY-MM-DD')
  const formattedTime = date.format('HH:mm:ss')

  return <div className="whitespace-nowrap">
    <p className="text-sm">{formattedDate}</p>
    <p className='text-gray-500 text-xs'>{formattedTime}</p>
  </div>
}

const TableItem = ({
  data, setData
}: {
  data: AdminHistoryState | null,
  setData: Dispatch<SetStateAction<AdminHistoryState | null>>
}) => {
  const codeEl = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeEl.current && data) {
      Prism.highlightElement(codeEl.current)
    }
  }, [data])

  return (
    <>
      <Drawer
        anchor='right'
        open={data != null}
        keepMounted={true}
        onClose={() => setData(null)}
      >
        <div className='w-[600px] max-w-[100vw] flex flex-col h-full'>
          <div className="flex-none bg-gray-100 py-4 px-6">
            <h3 className='text-xl'>Thông tin lịch sử <span className="text-blue-600">{data?.id}</span></h3>
          </div>
          <div className="flex-grow min-h-0 overflow-y-auto py-6 px-6 flex flex-col space-y-6">
            <div>
              <p className="text-sm font-medium mb-1 capitalize">Quản trị viên</p>
              <div className="flex items-center space-x-2">
                <div className={`w-12 h-12 rounded-full border-2 border-white overflow-hidden ${!data?.admin.image ? 'bg-blue-500' : ''} shadow grid place-items-center`}>
                  { data?.admin.image?.url
                    ? <Image src={data.admin.image?.url} alt={`image profile ${data.admin.name}`} width={48} height={48} />
                    : <span className="icon icon-fill !text-white !text-3xl">
                      person
                    </span>
                  }
                </div>
                <div>
                  <p className="font-semibold">{data?.admin.name}</p>
                  <p className="text-gray-600">{data?.admin.email}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 items-stretch -mx-2">
              <div className="w-1/2 px-2 flex flex-col">
                <p className="flex-none text-sm font-medium mb-1 capitalize">Thời gian</p>
                <div className="flex-grow min-h-0 rounded bg-gray-100 p-2 -mx-2">
                  <div className="whitespace-nowrap">
                    <p className="text-base">{moment(data?.createdAt).format('YYYY-MM-DD')}</p>
                    <p className='text-gray-500 text-sm'>{moment(data?.createdAt).format('HH:mm:ss')}</p>
                  </div>
                </div>
              </div>
              <div className="w-1/2 px-2 flex flex-col">
                <p className="flex-none text-sm font-medium mb-1 capitalize">Trạng thái và ID</p>
                <div className="flex-grow min-h-0 rounded bg-gray-100 p-2 -mx-2">
                  <div className="flex items-center space-x-2">
                    <span className={`icon ${data?.status == 'success' ? 'text-green-500' : 'text-red-500'}`}>
                      {data?.status == 'success' ? 'task_alt' : 'cancel'}
                    </span>
                    <p className="font-semibold">#{data?.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1 capitalize">Hành động</p>
              <div className="rounded bg-gray-100 p-2 -mx-2 text-sm">
                <p className="font-semibold">{data?.action}</p>
                <p className="mt-1">{data?.title}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1 capitalize">Bảng</p>
              <div className="rounded bg-gray-100 p-2 -mx-2">
                <p className="!font-semibold !text-teal-600">{data?.tableName || '...'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1 capitalize">Dữ liệu</p>
              <div className="rounded bg-gray-100 px-2 -mx-2">
                <pre>
                  { data?.data
                    ? <code ref={codeEl} className="language-js">
                      {data.data}
                    </code>
                    : '...'
                  }
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default AdminHistoryTable