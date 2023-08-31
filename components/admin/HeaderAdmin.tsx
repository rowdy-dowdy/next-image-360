"use client"
import { memo, useState, useTransition, useRef } from 'react'
import useAdminMenu from 'stores/admin/adminMenu';
import useAdminUser from '@/stores/admin/adminUser';
import Link from 'next/link';
import Collapse from '../Collapse';
import { useStoreCustom } from '@/stores';
import { Avatar, Divider, Menu, MenuItem } from '@mui/material';
import { AdminUserType, logoutUserAdmin } from '@/lib/admin/helperServer';
import { LinkState } from './AdminLayout';
import { usePathname } from 'next/navigation';
import moment from 'moment';

const HeaderAdmin = memo(({
  adminUser, managerLinks, generalLinks
}:{ 
  adminUser: NonNullable<AdminUserType>,
  managerLinks: LinkState[],
  generalLinks: LinkState[]
} ) => {
  const adminMenu = useStoreCustom(useAdminMenu, (state) => state)

  const pathname = usePathname()

  const linkCurrent = [...managerLinks, ...generalLinks].find(v => v.path == pathname)

  return (
    <div className='sticky top-0 w-full h-16 bg-white border-b z-50'>
      <div className="w-full h-full px-4 flex items-center space-x-4">
        <button 
          className="w-10 h-10 p-2 rounded-full bg-white hover:bg-gray-100"
          onClick={() => adminMenu?.toggle()}
        >
          <span className="material-symbols-outlined">
            {adminMenu?.open ? 'menu_open' : 'menu'}
          </span>
        </button>

        <span className='rounded-full bg-gray-100 px-4 py-2'>{linkCurrent?.name || 'Bảng điều khiển'}</span>

        <div className="!ml-auto"></div>
        <Notification user={adminUser} />

        { adminUser != null
          ? <AvatarUser user={adminUser} />
          : null
        }
      </div>
    </div>
  )
})

const Notification = ({ user }: { user: AdminUserType}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [loginDate, setLoginDate] = useState(new Date)

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    setAnchorEl(e.currentTarget);
  }
  const handleClose = () => {
    setAnchorEl(null);
  }

  return (
    <>
      <button className="relative w-10 h-10 p-2 rounded-full hover:bg-gray-100"
        onClick={handleClick}
      >
        <span className="material-symbols-outlined">
          notifications
        </span>
        <div className="absolute w-2 h-2 rounded-full bg-orange-600 top-2 right-3"></div>
      </button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{mt: 1.5}}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            '& ul': {
              py: 0
            }
          },
        }}
      >
        <div className="w-96 max-w-[100vw]">
          <div className="flex justify-between px-4 py-2 space-x-4 items-center border-b">
            <p className="font-medium">Thông báo</p>
            <span className="text-sm text-gray-600">Đánh dấu đã đọc</span>
          </div>
          <div className="flex flex-col divide-y">
            <div className="p-4 flex space-x-3 hover:bg-blue-100">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                { user?.image
                  ? <img src={user?.image.url} alt="" className='w-full h-full object-cover' loading='lazy' />
                  : <span className="material-symbols-outlined icon-fill !text-white !text-2xl">
                    person
                  </span>
                }
              </div>

              <div className="flex flex-col space-y-1">
                <p><span className="font-medium">{user?.name}</span> chào mừng quay trở lại</p>
                <p className="text-sm text-gray-600">{moment(loginDate).format('h:mm:ss a')}</p>
              </div>
            </div>
          </div>
        </div>
      </Menu>
    </>
  )
}

const AvatarUser = ({ user }: { user: NonNullable<AdminUserType>}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }
  const handleClose = () => {
    setAnchorEl(null);
  }
  
  return (
    <div>
      <div 
        className="flex items-center space-x-2 rounded-full p-1 pr-2 bg-gray-100 hover:bg-gray-200 cursor-pointer select-none"
        onClick={handleClick}
      >
        <div className={`w-10 h-10 rounded-full overflow-hidden ${!user.image ? 'bg-blue-500' : ''} grid place-items-center`}>
          { user.image
            ? <img src={user.image.url} alt="" className='w-full h-full object-cover' loading='lazy' />
            : <span className="material-symbols-outlined icon-fill !text-white !text-2xl">
              person
            </span>
          }
        </div>
        <div className='font-semibold'>{user.name}</div>
        <span className="material-symbols-outlined icon-fill">
          arrow_drop_down
        </span>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Link href="/admin/profile" className='flex items-center'>
            <Avatar /> Trang cá nhân
          </Link>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => logoutUserAdmin()}>
          <span className="material-symbols-outlined icon-fill text-red-600">
            logout
          </span>
          <span className="text-red-600">Đăng xuất</span>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default HeaderAdmin