"use server"
import { existsSync, mkdirSync } from "fs"
import sharp from "sharp"
import db from "./prismadb"
import fsPromise from "fs/promises";
import path from 'path'
import { v4 } from 'uuid';
import { equirectangularToFisheye, renderFacePromise } from "./convertCubeMap";
import PQueue from "p-queue";
import { InfoHotspot, LinkHotspot } from "@prisma/client";
import { createHistoryAdmin, useCurrentUserAdmin } from "./helperServer";
import { checkPermissions } from "./fields";

const facePositions = {
  pz: {x: 1, y: 1, name: 'b'},
  nz: {x: 3, y: 1, name: 'f'},
  px: {x: 2, y: 1, name: 'l'},
  nx: {x: 0, y: 1, name: 'r'},
  py: {x: 1, y: 0, name: 'u'},
  ny: {x: 1, y: 2, name: 'd'}
}

export const addEditScene = async (data: FormData) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    let name = data.get('name') as string,
      slug = data.get('slug') as string,
      image = data.get('image') as string,
      audio = data.get('audio') as string,
      group = data.get('group') as string,
      description = data.get('description') as string,
      publish = data.get('publish') as string | undefined,
      count = data.get('count') as string | undefined,
      id = data.get('id') as string | undefined

    if (!(id ? checkPermissions(user.role.permissions, "scene", "edit") 
      : checkPermissions(user.role.permissions, "scene", "create"))) {
      throw "Forbidden";
    }

    const sceneBySlug = await db.scene.findMany({
      where: {
        slug
      }
    })

    // create
    if (!id) {
      const imageUrl = (await db.file.findUnique({
        where: {
          id: image,
          mime: {
            startsWith: 'image'
          }
        }
      }))?.url
  
      if (sceneBySlug.length > 0 || !imageUrl) {
        throw "Slug đã tồn tại"
      }
  
      const imageSharp = sharp(`.${imageUrl}`, { limitInputPixels: false })
      
      let { width: w = 0, height: h = 0} = await imageSharp.metadata()
  
      imageSharp.resize({ width: 8192, height: 4096, fit: 'fill' })
      h = 4096
      w = 8192
  
      let uuid = v4()
  
      if (!existsSync(`./storage/tiles/${uuid}`)) {
        mkdirSync(`./storage/tiles/${uuid}`, { recursive: true })
      }
  
      // slip image
      await splitImage({
        imageSharp: imageSharp.clone(),
        width: w,
        height: h,
        numCols: 16,
        numRows: 8,
        outputDirectory: `./storage/tiles/${uuid}`
      })
    
      // save image low
      await imageSharp.clone().resize({ width: 2048, height: 1024 }).jpeg({ quality: 60, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/low.jpg`)
  
      // create fisheye image
      await new Promise(res => res(equirectangularToFisheye(imageSharp.clone(), 512, `./storage/tiles/${uuid}/fisheye.png`)))
  
      // create face front image
      const f = await renderFacePromise({
        data: imageSharp,
        width: w,
        height: h,
        face: 'nz',
        interpolation: "linear"
      })
  
      await sharp(f).resize({width: 1024}).jpeg({ quality: 60, force: true, mozjpeg: true }).toFile(`./storage/tiles/${uuid}/front.jpg`)

      const dataCreate = {
        id: uuid,
        name: name,
        slug: slug,
        faceSize: w,
        initialViewParameters: {
          pitch: 0,
          yaw: 0,
          zoom: 50
        },
        url: `/storage/tiles/${uuid}`,
        levels: `[]`,
        description: description,
        imageId: image,
        audioId: audio || undefined,
        groupId: group || undefined,
        publish: publish ? 'publish' : 'draft'
      }
  
      await db.scene.create({
        data: {
          ...dataCreate,
          initialViewParameters: JSON.stringify(dataCreate.initialViewParameters),
          sort: count ? +count : 9999
        }
      })

      await createHistoryAdmin({
        action: 'Tạo mới',
        title: 'Thêm mới điểm chụp',
        adminId: user.id,
        status: 'success',
        tableName: "scene",
        data: JSON.stringify(dataCreate, null, 2)
      })
    }
    // update
    else {
      const dataCreate = {
        name: name,
        slug: slug,
        description: description,
        audioId: audio || undefined,
        groupId: group || undefined,
        publish: publish ? 'publish' : 'draft'
      }

      await db.scene.update({
        where: {
          id: id,
        },
        data: dataCreate
      })

      await createHistoryAdmin({
        action: 'Cập nhập',
        title: 'Chỉnh sửa điểm chụp ' + name,
        adminId: user.id,
        status: 'success',
        tableName: "scene",
        data: JSON.stringify(dataCreate, null, 2)
      })
    }

    return { success: true }
  }
  catch(error) {
    await createHistoryAdmin({
      action: data.get('id') ? 'Cập nhập' : 'Tạo mới',
      title: data.get('id') ? 'Chỉnh sửa điểm chụp ' + data.get('name') : 'Thêm mới điểm chụp',
      adminId: user.id,
      status: 'error',
      tableName: 'scene'
    }).catch(e => {})

    console.log({error})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const deleteScene = async ({id}: {id: string}) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "scene", "delete")) throw "Forbidden"

    await db.$transaction([
      db.infoHotspot.deleteMany({
        where: {
          sceneId: id
        }
      }), 
      db.linkHotspot.deleteMany({
        where: {
          sceneId: id
        }
      }), 
      db.scene.delete({
        where: {
          id: id
        }
      })
    ])

    await fsPromise.rm(`./storage/tiles/${id}`, { recursive: true })

    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm chụp ' + id,
      adminId: user.id,
      status: 'success',
      tableName: "scene"
    })

    return { success: true }
  } 
  catch (error) {
    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm chụp ' + id,
      adminId: user.id,
      status: 'error',
      tableName: "scene"
    })

    console.log({error})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const updateInitialViewParametersScene = async ({
  id, initialViewParameters
}: {
  id: string, initialViewParameters: string
}) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "scene", "edit")) throw "Forbidden"

    const scene = await db.scene.update({
      where: {
        id: id,
      },
      data: {
        initialViewParameters: initialViewParameters
      }
    })

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa tọa độ ban đầu điểm chụp ' + id,
      adminId: user.id,
      status: 'success',
      tableName: "scene",
      data: JSON.stringify({initialViewParameters: JSON.parse(initialViewParameters)}, null, 2)
    })

    return { success: true }
  }
  catch(error) {
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Chỉnh sửa tọa độ ban đầu điểm chụp ' + id,
      adminId: user.id,
      status: 'error',
      tableName: "scene",
      data: JSON.stringify({initialViewParameters: JSON.parse(initialViewParameters)}, null, 2)
    }).catch(e => {})

    console.log({error})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const sortScene = async (list: string[]) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    if (!checkPermissions(user.role.permissions, "scene", "edit")) throw "Forbidden"

    await db.$transaction(list.map((v,i) => {
      return db.scene.update({
        where: {
          id: v
        },
        data: {
          sort: i
        }
      })
    }))

    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Sắp xếp danh sách điểm chụp',
      adminId: user.id,
      status: 'success',
      tableName: "scene"
    })

    return { success: true }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: 'Cập nhập',
      title: 'Sắp xếp danh sách điểm chụp',
      adminId: user.id,
      status: 'success',
      tableName: "scene"
    }).catch(e => {})

    console.log({error})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const createEditHotspot = async (data: FormData) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    let id = data.get('id') as string,
      sceneId = data.get('sceneId') as string,
      target = data.get('target') as string,
      yaw = data.get('yaw') as string,
      pitch = data.get('pitch') as string,
      hotspotType = data.get('hotspotType') as string,
      type = data.get('type') as string,
      video = data.get('video') as string,
      title = data.get('title') as string,
      description = data.get('description') as string

    let linkHotspot: LinkHotspot | undefined = undefined
    let infoHotspot: InfoHotspot | undefined = undefined

    if (hotspotType == "link") {
      if (!(id ? checkPermissions(user.role.permissions, "linkHotspot", "edit") 
        : checkPermissions(user.role.permissions, "linkHotspot", "create"))) {
        throw "Forbidden";
      }

      if (id) {
        linkHotspot = await db.linkHotspot.update({
          where: {
            id
          },
          data: {
            target: target,
            type: type
          }
        })

        await createHistoryAdmin({
          action: 'Cập nhập',
          title: 'Chỉnh sửa thông tin điểm nóng liên kết ' + id,
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify({
            target: target,
            type: type
          }, null, 2)
        })
      }
      else {
        const dataCreate = {
          sceneId: sceneId,
          yaw: +yaw,
          pitch: +pitch,
          target: target,
          type: type
        }
        
        linkHotspot = await db.linkHotspot.create({
          data: dataCreate
        })

        await createHistoryAdmin({
          action: 'Tạo mới',
          title: 'Thêm mới điểm nóng liên kết',
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify(dataCreate, null, 2)
        })
      }
    }
    else if (hotspotType == "info") {
      if (!(id ? checkPermissions(user.role.permissions, "infoHotspot", "edit") 
        : checkPermissions(user.role.permissions, "infoHotspot", "create"))) {
        throw "Forbidden";
      }

      if (id) {
        const dataCreate = {
          type: type,
          title: title,
          description: description,
          video: video
        }

        infoHotspot = await db.infoHotspot.update({
          where: {
            id
          },
          data: dataCreate
        })

        await createHistoryAdmin({
          action: 'Cập nhập',
          title: 'Chỉnh sửa điểm nóng thông tin ' + id,
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify(dataCreate, null, 2)
        })
      }
      else {
        const dataCreate = {
          sceneId: sceneId,
          yaw: +yaw,
          pitch: +pitch,
          type: type,
          title: title,
          description: description,
          video: video
        }

        infoHotspot = await db.infoHotspot.create({
          data: dataCreate
        })

        await createHistoryAdmin({
          action: 'Tạo mới',
          title: 'Thêm mới điểm nóng thông tin',
          adminId: user.id,
          status: 'success',
          tableName: "linkHotspot",
          data: JSON.stringify(dataCreate, null, 2)
        })
      }
    }
    else throw ""

    return { success: true, linkHotspot, infoHotspot }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: data.get('id') ? 'Cập nhập' : 'Tạo mới',
      title: (data.get('id') ? 'Chỉnh sửa điểm nóng' : 'Thêm mới điểm nóng') + data.get('hotspotType') == "link" ? 'Liên kết' : 'Thông tin',
      adminId: user.id,
      status: 'error',
      tableName: data.get('hotspotType') == "link" ? 'linkHotspot' : 'infoHotspot'
    }).catch(e => {})

    console.log({error})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

export const deleteHotspot = async ({id, type}: {id: string, type: 'link' | 'info'}) => {
  const user = await useCurrentUserAdmin()
  if (!user) throw "Authorization"

  try {
    if (type == "link") {
      if (!checkPermissions(user.role.permissions, "linkHotspot", "delete")) throw "Forbidden"

      await db.linkHotspot.delete({
        where: {
          id: id
        }
      })
    }
    else if (type == "info") {
      if (!checkPermissions(user.role.permissions, "infoHotspot", "delete")) throw "Forbidden"

      await db.infoHotspot.delete({
        where: {
          id: id
        }
      })
    } else {
      throw ""
    }

    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm nóng ' + type == "link" ? 'liên kết ' : 'thông tin ' + id,
      adminId: user.id,
      status: 'success',
      tableName: type == "link" ? 'linkHotspot' : 'infoHotspot'
    })

    return { success: true }
  } 
  catch(error) {
    await createHistoryAdmin({
      action: 'Xóa',
      title: 'Xóa điểm nóng ' + type == "link" ? 'liên kết ' : 'thông tin ' + id,
      adminId: user.id,
      status: 'error',
      tableName: type == "link" ? 'linkHotspot' : 'infoHotspot'
    })

    console.log({error})
    throw (typeof error === "string" && error != "") ? error : 'Có lỗi xảy ra vui lòng thử lại sau'
  }
}

async function splitImage({
  imageSharp, numRows, numCols, outputDirectory, width, height
}:{
  imageSharp: sharp.Sharp, numRows: number, numCols: number, outputDirectory: string,
  width: number, height: number
}) {
  const queue = new PQueue({ concurrency: 4 })

  const chunkWidth = Math.floor(width / numCols);
  const chunkHeight = Math.floor(height / numRows);

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const x = col * chunkWidth;
      const y = row * chunkHeight;
      const outputImagePath = `${outputDirectory}/${row}_${col}.jpg`;

      queue.add(async () => {
        await imageSharp.clone()
          .extract({ left: x, top: y, width: chunkWidth, height: chunkHeight })
          .jpeg({ quality: 60, force: true, mozjpeg: true })
          .toFile(outputImagePath);
      });
    }
  }

  await queue.onIdle(); // Đảm bảo tất cả công việc đã hoàn thành
  console.log('Cắt ảnh thành công.');
}