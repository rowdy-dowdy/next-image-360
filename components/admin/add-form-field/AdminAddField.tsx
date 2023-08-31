"use client"
import FormIOSSwitch from '@/components/FormIOSSwitch';
import { DATA_FIELDS } from '@/lib/admin/fields';
import { FileTypeState, SampleFieldAndDetailsType } from '@/lib/admin/sample';
import { Button, Collapse } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { v4 } from 'uuid';
import AdminFormFieldSelect from '../form-field/AdminFormFieldSelect';

type ComponentType = {
  onDelete: () => void,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  canDelete?: boolean,
  defaultValue?: string,
  required?: boolean,
  onChangeRequired: (data: boolean) => void,
  onChangeDetails: (data: SampleFieldAndDetailsType['details']) => void
} & SampleFieldAndDetailsType

const AdminAddField: React.FC<ComponentType> = ({
  onDelete,
  onChange,
  defaultValue,
  type,
  details,
  onChangeDetails,
  required,
  onChangeRequired,
  canDelete = true
}) => {
  const [expanded, setExpanded] = useState<boolean>(false)

  const handleChange = () => {
    setExpanded(state => !state);
  }

  const inputRef = useRef<HTMLInputElement | null>(null)

  const deleteField = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete()
  }

  useEffect(() => {
    inputRef.current?.select()
  },[])

  const icon = DATA_FIELDS[type].icon

  return (
    <div className='rounded bg-gray-200 w-full group'>
      <div className="flex w-full relative text-sm">
        <div className="flex-grow min-w-0 m-1.5 p-1 flex items-center space-x-2 focus-within:bg-gray-300 rounded">
          <span className="flex-none icon">{icon}</span>
          <input ref={inputRef} type="text" className="flex-grow min-w-0" required defaultValue={defaultValue || 'field'} onChange={(e) => onChange(e)} />
        </div>
        <div className="flex-none p-2 border-l">
          <span className="icon w-8 h-8 p-1 cursor-pointer hover:bg-gray-300 rounded-full"
            onClick={handleChange}
          >settings</span>
        </div>
        <div className="absolute top-1/2 right-full -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
          <span className="icon">drag_indicator</span>
        </div>
      </div>
      <Collapse in={expanded}>
        <div className='rounded-b border-2 border-gray-300 p-2 bg-white'>
          <div className="flex justify-between" style={{userSelect: 'none'}}>
            <FormIOSSwitch label="Không để trống" defaultValue={required} onChange={(e,v) => onChangeRequired(v)} size='small' />
            { canDelete
              ? <Button variant="text" color='error' onClick={(e) => deleteField(e)}>Xóa</Button>
              : null
            }
          </div>
          <div>
            { 
              type == "file"
              ? <DetailsFile defaultMultiple={details.multiple || false} defaultOnlyTable={true} onChangeDetails={onChangeDetails} defaultFileTypes={details.fileTypes} />
              : type == "select" 
                ? <DetailsSelect defaultMultiple={details.multiple || false} defaultList={[]} onChangeDetails={onChangeDetails} setExpanded={setExpanded} />
              : null
            }
          </div>
        </div>
      </Collapse>
    </div>
  )
}

const DetailsFile = ({
  defaultMultiple, defaultOnlyTable, onChangeDetails, defaultFileTypes = ['image']
}: {
  defaultMultiple: boolean, 
  defaultOnlyTable: boolean,
  defaultFileTypes?: FileTypeState,
  onChangeDetails: (details: any) => void
}) => {

  const [multiple, setMultiple] = useState(defaultMultiple)
  const [onlyTable, setOnlyTable] = useState(defaultOnlyTable)
  const [fileTypes, setFileTypes] = useState(defaultFileTypes)

  useEffect(() => {
    onChangeDetails({
      multiple,
      onlyTable,
      fileTypes
    })
  }, [multiple, onlyTable, fileTypes])

  return (
    <div className='border-t'>
      <div className="flex justify-evenly space-x-2">
        <FormIOSSwitch label="Chọn nhiều ảnh" checked={multiple} onChange={(e,v) => setMultiple(v)} size='small' />
        <FormIOSSwitch label="Ảnh theo bảng" checked={onlyTable} onChange={(e,v) => setOnlyTable(v)} size='small' />
      </div>
      <AdminFormFieldSelect label='File Types' details={{list: [
        {title: 'Tất cả', value: 'all'},
        {title: 'Ảnh', value: 'image'},
        {title: 'Audio', value: 'audio'},
        {title: 'Video', value: 'video'}
      ], multiple: true}} value={fileTypes} onChange={(v) => setFileTypes(v.target.value as any)} />
    </div>
  )
}

const DetailsSelect = ({
  defaultMultiple, defaultList, onChangeDetails, setExpanded
}: {
  defaultMultiple: boolean, 
  defaultList: {id: string, title: string, value: string}[],
  onChangeDetails: (details: any) => void,
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  // checked
  const [multiple, setMultiple] = useState(defaultMultiple)
  // list
  const [list, setList] = useState<{id: string, title: string, value: string}[]>(defaultList)

  const addList = () => {
    setList(state => [...state, {
      id: v4(),
      title: '',
      value: ''
    }])
  }

  const deleteItemInList = (id: string) => {
    setList(state => state.filter(v => v.id != id))
  }

  const changeValue = ({ title, value, id }: {title?: string, value?: string, id: string}) => {
    setList(state => state.map(v => {
      if (v.id == id) {
        return {
          ...v,
          title: title != undefined ? title : v.title,
          value: value != undefined ? value : v.value
        }
      }
      return v
    }))
  }

  const inValidInput = (e: any)=> {
    setExpanded(true)
  }

  useEffect(() => {
    onChangeDetails({
      multiple: multiple,
      list
    })
  }, [multiple, list])

  return (
    <div className='border-t'>
      <div className='flex flex-col space-y-2 justify-center items-center mt-2'>
        <FormIOSSwitch label="Multiple" checked={multiple} onChange={(e,v) => setMultiple(v)} size='small' />
        <div className="flex w-full flex-col bg-gray-100 p-2 rounded space-y-2">
          {list.length > 0 ? list.map(v =>
            <div key={v.id} className="flex space-x-2">
              <input type="text" className='flex-1 rounded !bg-gray-200 px-2 py-0.5' placeholder='Tiêu đề' required={true}
                value={v.title} onChange={(e) => changeValue({title: e.target.value, id: v.id})}
                onInvalid={inValidInput}
              />
              <input type="text" className='flex-1 rounded !bg-gray-200 px-2 py-0.5' placeholder='Giá trị' required={true}
                value={v.value} onChange={(e) => changeValue({value: e.target.value, id: v.id})}
                onInvalid={inValidInput}
              />
              <Button variant='text' size='small' color='error'
                onClick={() => deleteItemInList(v.id)}
              ><span className="icon">delete</span></Button>
            </div>
          )
            : <p>Không có mục nào</p>
          }
        </div>
        <Button variant='contained' size='small' onClick={addList}>Mục mới</Button>
      </div>
    </div>
  )
}

export default AdminAddField