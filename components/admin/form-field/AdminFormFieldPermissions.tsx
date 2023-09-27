"use client"
import { TABLES_SAMPLE } from '@/app/admin/(admin)/(sample)/[slug]/table'
import { PermissionsOnRoles } from '@prisma/client'
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'

type State = {
  label?: string | null,
  name?: string
  required?: boolean,
  defaultValue?: PermissionsOnRoles[],
  value?: string,
  onChange?: (data: any) => void
  className?: string,
}

const AdminFormFieldPermissions: React.FC<State> = ({
  label,
  name,
  required,
  className,
  defaultValue,
}) => {
  const [value, setValue] = useState<{
    key: string,
    tableName: string,
  }[]>(defaultValue ? defaultValue.map(v => ({
    key: v.permissionKey,
    tableName: v.permissionTableName
  })) :[])
  
  const childs = useRef<any[]>([])

  const setChecked = (e: React.MouseEvent<HTMLButtonElement>, check: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    childs.current.forEach(v => v.forwardSetChecked(check))
  }

  const tablesName = TABLES_SAMPLE.map(v => v.tableName)

  return (
    <div className={className}>
      { label
        ? <p className="text-sm font-medium mb-1 capitalize">{label} { required && <span className="text-red-500">*</span> }</p>
        : null
      }
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="flex space-x-2 text-sm">
        <button className='text-blue-500' onClick={(e) => setChecked(e, true)}>Chọn tất cả</button>
        <span>/</span>
        <button className='text-blue-500' onClick={(e) => setChecked(e, false)}>Bỏ chọn tất cả</button>
      </div>

      <div className="grid grid-flow-col auto-cols-max gap-4 mt-4">
        {tablesName.map((table_name, index) =>
          <RoleItems 
            key={table_name} 
            ref={child => childs.current[index] = child} 
            table_name={table_name} 
            value={(defaultValue || []).filter(v => v.permissionTableName == table_name).map(v => v.permissionKey)}
            edit={defaultValue != undefined}
            setValue={setValue}
          />
        )}
      </div>
    </div>
  )
}

const RoleItems = forwardRef(({
  table_name, value, edit = false, setValue
}: {
  table_name: string, value: string[], edit: boolean, setValue: React.Dispatch<React.SetStateAction<{
    tableName: string,
    key: string
  }[]>>
}, ref) => {
  const data = ['browse', 'create', 'edit', 'delete', 'image']
  const [checked, setChecked] = useState(edit ? value: data)

  const handleSelectAll = () => {
    if (checked.length == data.length) {
      setChecked([])
    }
    else {
      setChecked(data.map(v => v))
    }
  }

  const handleSelect = (e: React.FormEvent<HTMLInputElement>) => {
    const { value, checked: isChecked } = e.target as HTMLInputElement

    if (isChecked) {
      setChecked([...checked, value])
    }
    else {
      setChecked(checked.filter(item => item !== value))
    }
  }

  useEffect(() => {
    setValue(state => {
      let arOri = state.slice().filter(v => 
        !data.some(v2 => v2 == v.key && v.tableName == table_name))

      let arrAdd = checked.map(v => ({
        key: v,
        tableName: table_name
      }))

      return [...arOri, ...arrAdd]
    })
  }, [checked])

  useImperativeHandle(ref, () => ({

    forwardSetChecked(check: boolean) {
      if (check) {
        setChecked(data.map(v => v))
      }
      else {
        setChecked([])
      }
    }

  }))

  return (
    <div className='flex flex-col space-y-2'>
      <label htmlFor={table_name} className="inline-flex items-center space-x-2 select-none cursor-pointer">
        <input type="checkbox" id={table_name} checked={checked.length == data.length} onChange={handleSelectAll} />
        <span>{table_name}</span>
      </label>
      <div className="ml-6 flex flex-col space-y-1">
        {data.map(v =>
          <label htmlFor={`${table_name}-${v}`} key={`${table_name}-${v}`} className="inline-flex items-center space-x-2 select-none cursor-pointer">
            <input type="checkbox" id={`${table_name}-${v}`} value={v} checked={checked.includes(v)} onChange={handleSelect} />
            <span className='capitalize'>{v} {table_name}</span>
          </label>
        )}
      </div>
    </div>
  )
})

export default AdminFormFieldPermissions