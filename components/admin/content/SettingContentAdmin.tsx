"use client"
import React, { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { GroupSettingType } from '@/app/admin/(admin)/settings/page';
import { DATA_FIELDS } from '@/lib/admin/fields';
import { promiseFunction } from '@/lib/admin/promise';
import { useRouter } from 'next/navigation';

type State = {
  groupSettings: GroupSettingType[],
  createEditSetting: () => Promise<void>
  saveSetting: (data: any) => Promise<void>
  canDelete: boolean,
  canEdit: boolean,
  canCreate: boolean
}

const SettingContentAdmin: React.FC<State> = ({
  groupSettings, createEditSetting, saveSetting,
  canDelete, canCreate, canEdit
}) => {
  const router = useRouter()
  const [groupActive, setGroupActive] = React.useState(groupSettings.length > 0 ? groupSettings[0] : undefined);

  const settings = groupActive != undefined ? groupActive.settings : []

  const [openUpdateSettingModal, setOpenUpdateSettingModal] = useState(false)

  useEffect(() => {
    setGroupActive(groupSettings.length > 0 ? groupSettings[0] : undefined)
  }, [groupSettings])


  // save settings
  const [loading, setLoading] = useState(false)
  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await promiseFunction({
      loading: loading,
      setLoading: setLoading,
      callback: async () => {

        let formData = Array.from(
          new FormData(e.target as HTMLFormElement),
        )

        let listBool = groupActive?.settings.filter(v => v.type == "bool")

        listBool?.forEach(v => {
          let data = formData.find(v2 => v2[0] == v.name)
          if (!data) {
            formData.push([v.name, "false"])
          }
        })

        await saveSetting(formData)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="-my-4 flex flex-col" style={{minHeight: 'calc(100vh - 64px)'}}>
        <div className="-mx-8 px-8 border-b bg-white pt-6 flex space-x-4 items-start">
          <div>
            <h5 className="text-3xl font-semibold">Cài đặt</h5>
            <div className="flex mt-4 space-x-6 items-center">
              { groupSettings.map(v =>
                <div key={v.id} 
                  className={`py-2 capitalize hover:text-blue-500 cursor-pointer 
                    ${v.id == groupActive?.id ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                  onClick={() => setGroupActive(v)}
                >{v.label || v.name}</div>
              )}
            </div>
          </div>
          <div className="!ml-auto"></div>
          <Button variant='contained' color='info' disabled={!canEdit} startIcon={<span className="icon">sync</span>}
            onClick={() => setOpenUpdateSettingModal(true)}
          >
            Cập nhập cài đặt
          </Button>
        </div>
        <div className="flex-grow min-h-0 -mx-8 p-8">
          <form className="grid grid-cols-12 bg-white rounded-lg p-8 gap-6" onSubmit={handelSubmit}>
            { settings.length > 0 
              ? <>
                { settings.map(v => {
                  const Component = DATA_FIELDS[v.type] ? DATA_FIELDS[v.type].Component : null
                  return Component ? <div key={v.id} style={{gridColumn: `span ${v.col || 6} / span ${v.col || 6}`}}>
                    <Component
                      label={v.label} name={v.name}
                      required={false} defaultValue={v.value}
                      details={v.details ? {...v.details, tableName: 'setting'} : undefined}
                    />
                  </div> : null
                })}
                <div className="col-span-12">
                  <Button type='submit' className='float-right' disabled={!canEdit} variant='contained' startIcon={<span className="icon">save</span>}>
                    Lưu cài đặt
                  </Button>
                </div>
              </>
              : <p className='col-span-12'>Không có cài đặt nào</p>
            }
          </form>
        </div>
      </div>

      <UpdateSettingsPopup open={openUpdateSettingModal} setOpen={setOpenUpdateSettingModal} createEditSetting={createEditSetting} />
    </>
  )
}

const UpdateSettingsPopup = ({
  open, setOpen, createEditSetting
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  createEditSetting: () => Promise<void>
}) => {

  const router = useRouter()

  const handelDelete = async () => {

    await promiseFunction({
      callback: async () => {
        await createEditSetting()
        
        router.refresh()
        setOpen(false)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
    >
      <DialogTitle>Cập nhập cài đặt</DialogTitle>
      <DialogContent>
        Bạn có  muốn cập nhập lại cài đặt không ?
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Hủy</Button>
        <Button variant='contained' onClick={handelDelete}>Tiếp tục</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingContentAdmin