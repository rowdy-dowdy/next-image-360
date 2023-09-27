"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link';
import useAdminMenu from 'stores/admin/adminMenu';
import { useStoreCustom } from '@/stores';
import { usePathname } from 'next/navigation';
import { PermissionsOnRoles } from '@prisma/client';
import { checkPermissions } from '@/lib/admin/fields';
import { LinkState } from './AdminLayout';
import useSettings from '@/stores/settings';

const MenuAdmin = ({
  permissions, managerLinks, generalLinks
}: {
  permissions: PermissionsOnRoles[]
  managerLinks: LinkState[],
  generalLinks: LinkState[]
}) => {
  // const adminMenu = useAdminMenu()
  const pathname = usePathname()
  const adminMenu = useStoreCustom(useAdminMenu, (state) => state)
  const { findSettingByName } = useSettings()

  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  }

  const handleMouseLeave = () => {
    setIsHover(false);
  }

  const managerLinksPermission = managerLinks.filter(v => v.tableName ? checkPermissions(permissions, v.tableName, "browse") : true)

  const generalLinksPermission = generalLinks.filter(v => v.tableName ? checkPermissions(permissions, v.tableName, "browse") : true)
  
  return (
    <div 
      className='fixed h-full transition-all bg-white border-r z-[100]' 
      style={{width: isHover ? adminMenu?.width : (adminMenu?.open ? adminMenu?.width : "60px")}}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full flex flex-col space-y-2 px-1">
        <Link href={"/"} className="flex-none w-full h-16 flex items-center overflow-hidden border-b">
          <div className='flex-none grid place-items-center' style={{width: "52px"}}>
            <Image
              src={`${findSettingByName('admin logo')?.url || 'admin-logo.png'}`}
              alt="Picture of the admin logo"
              width={50}
              height={50}
              className='rounded w-8 h-8'
            />
          </div>
          <span className='flex-none text-xl font-bold'>{findSettingByName('admin title') || 'Việt Hùng IT'}</span>
        </Link>

        
        <div className="flex-grow min-h-0 flex flex-col space-y-2 px-1 !mb-2 overflow-x-hidden overflow-y-auto">
          <div className="w-full h-5 flex items-center px-2 text-gray-500 !mt-4">
            { adminMenu?.open || isHover
              ? <div className='whitespace-nowrap text-sm font-semibold '>Quản lý nội dung</div>
              : <div className="w-full h-[1px] bg-gray-300"></div>
            }
          </div>
          {managerLinksPermission.map((v,i) => {
            return (
              <Link
                className={`flex-none w-full flex items-center py-3 overflow-x-hidden hover:bg-blue-200 rounded text-gray-800
                  ${(v.path == "/admin" ? pathname == v.path : pathname?.includes(v.path)) ? 'font-semibold !text-blue-800' : 'font-medium'}
                `}
                href={v.path}
                key={i}
              >
                <div className='flex-none px-1 grid place-items-center' style={{width: "44px"}}>
                  <span className="material-symbols-outlined icon-500">
                    {v.icon}
                  </span>
                </div>
                <span className="flex-none">{v.name}</span>
              </Link>
            )
          })}
          <div className="w-full h-5 flex items-center px-2 text-gray-500 !mt-4">
            { adminMenu?.open || isHover
              ? <div className='whitespace-nowrap text-sm font-semibold '>Tổng quan</div>
              : <div className="w-full h-[1px] bg-gray-300"></div>
            }
          </div>
          {generalLinksPermission.map((v,i) => {
            return (
              <Link
                className={`flex-none w-full flex items-center py-3 overflow-x-hidden hover:bg-blue-200 rounded text-gray-800
                  ${pathname?.includes(v.path) ? 'font-semibold !text-blue-800' : 'font-medium'}
                `}
                href={v.path}
                key={i}
              >
                <div className='flex-none px-1 grid place-items-center' style={{width: "44px"}}>
                  <span className="material-symbols-outlined icon-500">
                    {v.icon}
                  </span>
                </div>
                <span className="flex-none">{v.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MenuAdmin