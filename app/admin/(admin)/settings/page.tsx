import SettingContentAdmin from '@/components/admin/content/SettingContentAdmin'
import { createHistoryAdmin, useCurrentUserAdmin } from '@/lib/admin/helperServer'
import db from '@/lib/admin/prismadb'
import { SampleColumnsType, SampleFieldAndDetailsType, getValueSettings } from '@/lib/admin/sample'
import { Setting, GroupSetting } from '@prisma/client'
import React from 'react'
import { TABLES_SAMPLE } from '../(sample)/[slug]/table'
import { checkPermissions } from '@/lib/admin/fields'

type GroupType = {
  name: string,
  settings: ({
    name: string,
    col?: number
  } & SampleFieldAndDetailsType)[]
}

const GROUPS: GroupType[] = [
  { name: "Site", settings: [
    { name: 'site title', type: 'string' },
    { name: 'site description', type: 'string' },
    { name: 'site logo', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }},
    { name: 'site favicon', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }},
    { name: 'banner', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }, col: 4},
    { name: 'so do', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    }, col: 4 },
    { name: 'main audio', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['audio']
    }, col: 4},
  ] },
  { name: "Admin", settings: [
    { name: 'admin title', type: 'string' },
    { name: 'admin description', type: 'string' },
    { name: 'admin logo', type: 'file', details: {
      multiple: false,
      onlyTable: true,
      fileTypes: ['image']
    } },
  ] }
]

export type GroupSettingType = Omit<GroupSetting, 'settings'> & {
  settings: SettingType[]
}

export type SettingType = (Omit<Setting, 'type' | 'details' | 'value'>) & SampleFieldAndDetailsType & {
  value: any
}

const getData = async () => {
  const data = await db.groupSetting.findMany({
    include: {
      settings: true
    }
  })

  const groupSettings = await Promise.all(data.map(async v => ({
    ...v,
    settings: await getValueSettings(v.settings)

  })) as any[] as GroupSettingType[])
 
  return groupSettings
}

const createEditSetting = async () => {
  "use server"
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"
  try {
    if (!checkPermissions(user.role.permissions, "setting", "edit")) {
      throw "Forbidden";
    }

    const oldSettings = await db.setting.findMany()

    await db.setting.deleteMany()
    await db.groupSetting.deleteMany()

    await db.$transaction(
      GROUPS.map(v => db.groupSetting.create({
        data: {
          name: v.name,
          settings: {
            create: v.settings.map(v2 => ({
              name: v2.name,
              type: v2.type,
              col: v2.col,
              details: JSON.stringify(v2.details),
              value: oldSettings.find(v3 => v3.name == v2.name)?.value
            }))
          }
        }
      }))
    )

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa các trường dữ liệu cài đặt',
      adminId: user.id,
      status: 'success',
      tableName: 'setting'
    })
  } 
  catch (error) {
    console.log({error})
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa các trường dữ liệu cài đặt',
      adminId: user.id,
      status: 'error',
      tableName: 'setting',
    }).catch(e => {})
    throw (typeof error === "string") ? error : 'Có lỗi xảy ra, vui lòng thử lại sau'
  } 
}

const saveSetting = async(data : Array<[string, string]>) => {
  "use server"

  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "setting", "edit")) {
      throw "Forbidden";
    }

    await db.$transaction(data.map(([key, value]) => db.setting.update({
      where: {
        name: key
      },
      data: {
        value: value
      }
    })))

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'chỉnh sửa dữ liệu cài đặt',
      adminId: user.id,
      status: 'success',
      tableName: 'setting'
    })
  } 
  catch (error) {
    console.log({error})
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'chỉnh sửa dữ liệu cài đặt',
      adminId: user.id,
      status: 'error',
      tableName: 'setting'
    }).catch(e => {})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra, vui lòng thử lại sau'
  } 
}

async function page() {
  const admin = await useCurrentUserAdmin()

  if (!checkPermissions(admin?.role.permissions || [], "setting", "browse")) {
    return <div>Bạn không có quyền truy cập trang này</div>
  }

  const groupSettings = await getData()

  return (
    <SettingContentAdmin groupSettings={groupSettings} 
      createEditSetting={createEditSetting} 
      saveSetting={saveSetting}
      canCreate={checkPermissions(admin?.role.permissions || [], "setting", "create")}
      canEdit={checkPermissions(admin?.role.permissions || [], "setting", "edit")}
      canDelete={checkPermissions(admin?.role.permissions || [], "setting", "delete")}
    />
  )
}

export default page