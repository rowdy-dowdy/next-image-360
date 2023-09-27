"use client"
import FormIOSSwitch from '@/components/FormIOSSwitch'
import { ChangeEvent } from 'react'

type State = {
  label?: string | null,
  name?: string
  required?: boolean,
  className?: string,
  placeholder?: string,
  defaultValue?: any,
  value?: boolean,
  onChange?: (e: ChangeEvent<HTMLInputElement>, checked: boolean) => void,
  details?: {
    topTitle: boolean,
    rightTitle: boolean
  }
}

const AdminFormFieldBool = ({
  label,
  name,
  required = false,
  className = '',
  placeholder,
  defaultValue,
  value,
  onChange,
  details = {
    topTitle: true,
    rightTitle: false
  }
}: State) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (onChange) {
      onChange(e, checked)
    }
  }

  return (
    <div className={className}>
      { label && details.topTitle
        ? <p className="text-sm font-medium mb-1 capitalize">{label} { required && <span className="text-red-500">*</span> }</p>
        : null
      }
      <FormIOSSwitch checked={value} defaultValue={defaultValue} onChange={handleChange} inputProps={{ 'aria-label': 'controlled' }} name={name} label={details.rightTitle ? label : undefined} />
    </div>
  )
}

export default AdminFormFieldBool