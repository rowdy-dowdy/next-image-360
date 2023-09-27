import React, { ReactNode } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { getSettingsData } from '@/lib/admin/sample';
import { findSettingByName } from '@/lib/admin/fields';
import db from '@/lib/admin/prismadb';
import { InitialViewParametersState, LevelsState, SceneDataState } from '../admin/(admin)/scenes/page';
import SceneContent from '@/components/web/content/SceneContent';
import { useCurrentUserAdmin } from '@/lib/admin/helperServer';
import PreviewWithAuth from '@/components/web/content/PreviewWithAuth';

export async function generateMetadata(
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const settings = await getSettingsData()

  const siteTitle = findSettingByName(settings, "site title")
  const siteDescription = findSettingByName(settings, "site description")
  const siteLogo = findSettingByName(settings, "site logo")
 
  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    title: siteTitle || "Việt Hùng It",
    description: siteDescription || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
    authors: {
      name: 'Việt Hùng It',
      url: 'https://github.com/rowdy-dowdy'
    },
    twitter: {
      title: siteTitle || "Việt Hùng It",
      description: siteDescription || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
      images: siteLogo ? siteLogo?.url : null,
    },
    openGraph: {
      title: siteTitle || "Việt Hùng It",
      description: siteDescription || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
      url: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
      siteName: siteTitle || "Việt Hùng It",
      images: siteLogo ? siteLogo?.url : null,
      type: 'website',
    },
  }
}

const getData = async () => {
  const [scenes, groups] = await Promise.all([
    db.scene.findMany({
      where: {
        publish: 'publish',
        groupId: {
          not: null
        }
      },
      include: {
        infoHotspots: true,
        linkHotspots: true,
        audio: true,
        group: true
      },
      orderBy: {
        sort: 'asc'
      }
    }),
    db.groupScene.findMany({
      where: {
        publish: 'publish'
      },
      orderBy: {
        sort: 'asc'
      }
    })
  ])

  let scenesData: SceneDataState[] = scenes.map(v => {
    return {
      ...v,
      levels: JSON.parse(v.levels) as LevelsState,
      initialViewParameters: JSON.parse(v.initialViewParameters) as InitialViewParametersState,
    }
  })

  let scenesGroup: SceneDataState[] = []
  let groupsData = groups.filter(v => {
    let scenesInGroup = scenesData.filter(v2 => v2.groupId == v.id)

    if (scenesInGroup.length > 0) {
      scenesGroup.push(...scenesData.filter(v2 => v2.groupId == v.id))
      return true
    }
    else {
      return false
    }
  })

  return { scenes: scenesGroup, groups: groupsData }
}

const layout = async ({children}: {children: ReactNode}) => {
  const settings = await getSettingsData()
  const previewWhenLogging = findSettingByName(settings, "preview mode") as boolean | null

  if (previewWhenLogging) {
    const user = await useCurrentUserAdmin()

    if (!user) {
      return <PreviewWithAuth />
    }
  }

  const {scenes, groups} = await getData()

  return (
    <SceneContent defaultScenes={scenes} defaultGroups={groups} children={children} />
  )
}

export default layout
