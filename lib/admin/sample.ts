'use server'

import { Setting } from "@prisma/client";
import { createHistoryAdmin, useCurrentUserAdmin } from "./helperServer";
import db from "./prismadb"
import bcrypt from 'bcrypt'
import { checkPermissions } from "./fields";
import { parseDataInString } from "../utils/helper";

export type SampleColumnsType = {
  name: string,
  label: string,
  show: boolean,
  required?: boolean,
  col?: number
} & SampleFieldAndDetailsType

export type SampleFieldAndDetailsType = (
  SampleColumnSelectType | 
  SampleColumnReactionType |
  SampleColumnFileType |
  SampleColumnBoolType |
  // SampleColumnPermissionsType |
  {
    type: 'string' | 'date' | 'publish' | 'int' | 'text' | 'permissions' | 'password',
    details?: undefined
  }
)

export type SampleColumnSelectType = {
  type: 'select',
  details: {
    list: { title: string, value: string}[]
    multiple?: boolean,
  }
}

export type SampleColumnBoolType = {
  type: 'bool',
  details?: {
    topTitle: boolean,
    rightTitle: boolean
  }
}

export type FileTypeState = ('all' | 'image' | 'audio' | 'video')[]

export type SampleColumnFileType = {
  type: 'file',
  details: {
    multiple?: boolean,
    onlyTable?: boolean,
    myself?: boolean,
    fileTypes?: FileTypeState
  }
}

export type SampleColumnReactionType = {
  type: 'relation',
  details: {
    typeRelation: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many',
    tableNameRelation: string,
    titleRelation: string
  }
}

// export type SampleColumnPermissionsType = {
//   type: 'permissions',
//   details?: undefined
// }

export type GetDataSampleState = {
  page: number, 
  per_page: number,
  orderBy?: string,
  orderType?: 'asc' | 'desc',
  columns: SampleColumnsType[]
}

export const getDataSample = async ({
  page, per_page, tableName,
  columns, orderBy, orderType
}: GetDataSampleState & { tableName: string }) => {
  // const user = await useCurrentUserAdmin()
  // if (!user) throw "Authorization"

  // if (!checkPermissions(user.role.permissions, tableName, "browse")) throw "Forbidden"

  if (page < 1) page = 1

  const start = (page - 1) * per_page

  try {
    const orderString = (orderBy && orderType && columns.findIndex(v => v.name == orderBy) >= 0) ? {
      [orderBy]: orderType
    } : undefined

    const [data, count] = await db.$transaction([
      (db as any)[tableName].findMany({
        take: per_page,
        skip: start,
        select: columns.reduce((pre, cur) => {
          if (cur.type != "password") {
            return {...pre, [cur.name]: true}
          }
          else {
            return pre
          }
        }, {}),
        orderBy: orderString
      }),
      (db as any)[tableName].count(),
    ])
  
    if (!data) {
      throw ""
    }
  
    return { data, count }
  } catch (error) {
    console.log({error})
    return { data: [], count: 0 }
  }
}

export type GetItemDataSampleState = {
  id: string,
  columns: SampleColumnsType[]
}

export const getItemDataSample = async ({
  id,
  tableName, columns
}: GetItemDataSampleState & { tableName: string }) => {
  // const user = await useCurrentUserAdmin()
  // if (!user) throw "Authorization"

  // if (!checkPermissions(user.role.permissions, tableName, "browse")) throw "Forbidden"

  const data = await (db as any)[tableName].findUnique({
    where: {
      id: columns.find(v => v.name == "id")?.type == "int" ? (+id || 0) : id,
    },
    select: columns.reduce((pre, cur) => {
      if (cur.type != "password") {
        return {...pre, [cur.name]: true}
      }
      else {
        return pre
      }
    }, {})
  })

  return data
}

export type DeleteDataSampleState = {
  ids: any[],
}

export const deleteDataSample = async ({
  ids,
  tableName
}: DeleteDataSampleState & { tableName: string }) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  if (!checkPermissions(user.role.permissions, tableName, "delete")) throw "Forbidden"

  await (db as any)[tableName].deleteMany({
    where: {
      id: {
        in: ids
      }
    },
  })

  await createHistoryAdmin({
    action: 'Xóa',
    title: 'Xóa dữ liệu bảng ' + tableName,
    adminId: user.id,
    status: 'success',
    tableName: tableName,
  })
}

export type AddEditDataSampleState = {
  data: any,
  edit: boolean,
  columns: SampleColumnsType[],
}

export const addEditDataSample = async ({
  data, edit = false, columns, tableName
}: AddEditDataSampleState & { tableName: string }) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    if (!(edit ? checkPermissions(user.role.permissions, tableName, "edit") 
      : checkPermissions(user.role.permissions, tableName, "create"))) {
      throw "Forbidden";
    }

    const intermediateResults = await Promise.all(columns.filter(v => !['id', 'createdAt', 'updatedAt', 'publish']
      .includes(v.name)).map(async (pre) => {
        if (pre.type == "date") {
          return { [pre.name]: new Date(data[pre.name]) }
        }
        else if (pre.type == "int") {
          return { [pre.name]: +(data[pre.name]) }
        }
        else if (pre.type == "password") {
          return { [pre.name]: await bcrypt.hash("password", 10) }
        }
        else if (pre.type == "file") {
          if (data[pre.name]) {
            let tempConnect = { id: data[pre.name] }
            if (pre.details.multiple) {
              tempConnect = JSON.parse(data[pre.name]).map((v: string) => ({
                id: v
              }))
            }
            return { [pre.name]: { connect: tempConnect } }
          }
          else
            return { [pre.name]: undefined }
        }
        else if (pre.type == "relation") {
          if (data[pre.name]) {
            let tempConnect = { id: data[pre.name] }
            if (pre.details.typeRelation == 'one-to-many' || pre.details.typeRelation == 'many-to-many') {
              tempConnect = JSON.parse(data[pre.name]).map((v: string) => ({
                id: v
              }))
            }
            return { [pre.name]: { connect: tempConnect } }
          }
          else
            return { [pre.name]: undefined }
        }
        else if (pre.type == "permissions") {
          if (data[pre.name]) {
            let tempCreate = {}

            if (!edit) {
              tempCreate = {
                create: JSON.parse(data[pre.name]).map((v: any) =>
                  ({
                    permission: {
                      connectOrCreate: {
                        where: {
                          key_tableName: {
                            key: v.key,
                            tableName: v.tableName
                          }
                        },
                        create: {
                          key: v.key,
                          tableName: v.tableName
                        }
                      }
                    }
                  })
                )
              }
            }
            else {

              await db.$transaction(JSON.parse(data[pre.name]).map((v: any) => db.permission.upsert({
                where: {
                  key_tableName: {
                    key: v.key,
                    tableName: v.tableName
                  }
                },
                create: {
                  key: v.key,
                  tableName: v.tableName
                },
                update: {}
              })))

              await db.permissionsOnRoles.deleteMany({
                where: {
                  roleId: data.id
                }
              })

              tempCreate = {
                create: JSON.parse(data[pre.name]).map((v: any) =>
                  ({
                    permissionKey: v.key,
                    permissionTableName: v.tableName
                  })
                )
              }
            }

            return { [pre.name]: tempCreate }
          }
          else
            return { [pre.name]: undefined }
        }
        else {
          return { [pre.name]: data[pre.name] }
        }
      }, 
      {}
    ))

    const dataCreate = intermediateResults.reduce((cur, result) => ({ ...cur, ...result }), {});

    if (edit) {
      await (db as any)[tableName].update({
        where: {
          id: data.id
        },
        data: dataCreate
      })

      await createHistoryAdmin({
        action: 'Cập nhập',
        title: 'chỉnh sửa dữ liệu bảng ' + tableName,
        adminId: user.id,
        status: 'success',
        tableName: tableName,
        data: JSON.stringify(dataCreate, null, 2)
      })
    }
    else {
      await (db as any)[tableName].create({
        data: dataCreate
      })

      await createHistoryAdmin({
        action: 'Tạo mới',
        title: 'Thêm bản ghi mới bảng ' + tableName,
        adminId: user.id,
        status: 'success',
        tableName: tableName,
        data: JSON.stringify(dataCreate, null, 2)
      })
    }
  }
  catch (error) {
    console.log({error})

    await createHistoryAdmin({
      action: edit ? 'Cập nhập' : 'Tạo mới',
      title: edit ? 'chỉnh sửa dữ liệu bảng ' + tableName : 'Thêm bản ghi mới bảng ' + tableName,
      adminId: user.id,
      status: 'error',
      tableName: tableName
    }).catch(e => {})

    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const getListDataOfRelation = async ({
  tableName
}: { tableName: string }) => {
  try {
    const user = await useCurrentUserAdmin()
    if (!user) throw "Unauthorized"
    if (!checkPermissions(user.role.permissions, tableName, "browse")) throw "Forbidden"

    const data = await (db as any)[tableName].findMany()

    return {data}
  }
  catch (error) {
    console.log(error)
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const changePublishData = async ({
  id, tableName, publish
}: { id: string, tableName: string, publish?: 'publish' | 'draft' }) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Unauthorized"
  try {

    if (!checkPermissions(user.role.permissions, tableName, "edit")) throw "Forbidden"

    const data = await (db as any)[tableName].update({
      where: {
        id: id
      },
      data: {
        publish
      }
    })

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Thay đổi trang thái xuất bản bảng ' + tableName + ' sang ' + (publish == "publish" ? 'Xuất bản' : 'Nháp'),
      adminId: user.id,
      status: 'success',
      tableName: tableName,
      data: JSON.stringify({publish}, null, 2)
    })

    return {data}
  }
  catch (error) {
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Thay đổi trang thái xuất bản bảng ' + tableName + ' sang ' + (publish == "publish" ? 'Xuất bản' : 'Nháp'),
      adminId: user.id,
      status: 'error',
      tableName: tableName,
      data: JSON.stringify({publish}, null, 2)
    }).catch(e => {})

    console.log(error)
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const getValueSettings = async (settings: Setting[]) => {
  return Promise.all(settings.map(async (v2) => {

    if (v2.type == "file" && v2.value) {
      v2.value = await db.file.findUnique({
        where: {
          id: v2.value
        }
      }) as any
    }

    return {
      ...v2,
      value: parseDataInString(v2.value),
      details: v2.details ? JSON.parse(v2.details) : null
    }
  }))
}

export const getSettingsData = async () => {
  const settings = await db.setting.findMany()

  const data = await getValueSettings(settings)
  return data
}