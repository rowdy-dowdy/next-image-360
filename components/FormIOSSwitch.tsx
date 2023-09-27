import { styled } from "@mui/material/styles";
import { FormControlLabel, Switch, SwitchProps } from '@mui/material'

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme, size }) => ({
  width: size == "medium" ? 42 : 36,
  height: size == "medium" ? 26 : 20,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: size == "medium" ? 22 : 16,
    height: size == "medium" ? 22 : 16,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
  '& .MuiFormControlLabel-label': {
    userSelect: 'none'
  },
}));

type ComponentType = {
  checked?: boolean,
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  size?: "small" | "medium",
  label?: string | null,
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  name?: string,
  className?: string,
  defaultValue?: boolean
}

const FormIOSSwitch: React.FC<ComponentType> = ({
  checked,
  onChange,
  size = "medium",
  label,
  inputProps,
  name,
  className,
  defaultValue
}) => {
  return (
    <FormControlLabel
      name={name}
      control={<IOSSwitch 
        checked={checked} onChange={onChange} 
        inputProps={inputProps} sx={{ m: 1 }} 
        defaultChecked={defaultValue} size={size} 
      />}
      value="true"
      label={label}
      style={{userSelect: 'none'}}
      className={className}
    />
  )
}

export default FormIOSSwitch