"use client"
import FormIOSSwitch from '@/components/FormIOSSwitch'
import { ChangeEvent } from 'react'

type State = {
  label?: string,
  name?: string
  required?: boolean,
  className?: string,
  placeholder?: string,
  defaultValue?: any,
  value?: boolean,
  onChange?: (e: ChangeEvent<HTMLInputElement>, checked: boolean) => void,
}

const AdminFormFieldBool = ({
  label,
  name,
  required = false,
  className = '',
  placeholder,
  defaultValue,
  value,
  onChange
}: State) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (onChange) {
      onChange(e, checked)
    }
  }

  return (
    <FormIOSSwitch checked={value} defaultValue={defaultValue} onChange={handleChange} inputProps={{ 'aria-label': 'controlled' }} name={name} label={label} />
  )
}

export default AdminFormFieldBool