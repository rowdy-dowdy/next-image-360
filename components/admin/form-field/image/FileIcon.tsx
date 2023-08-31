import Image from 'next/image'
import React from 'react'
import { twMerge } from 'tailwind-merge'

const FileIcon = ({
  name, url, mime, caption, className, width, height
}:{
  name: string, url: string, mime: string, caption?: string | null, className?: string,
  width?: number | null, height?: number | null
}) => {
  return (
    <>
      { mime.startsWith('image')
        ? <Image 
            src={url} 
            alt={caption || name}
            width={width || 300}
            height={height || 300}
            className={twMerge('w-full h-full object-contain', className)} 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 70vw, 100vw"
          />
        : mime.startsWith('audio') ? <div className={twMerge('w-full h-full grid place-items-center', className)} >
          <span className="icon !text-4xl text-amber-600">audio_file</span>
        </div>
        : mime.startsWith('video') ? <div className={twMerge('w-full h-full grid place-items-center', className)} >
          <span className="icon !text-4xl text-green-600">video_file</span>
        </div>
        : <div className={twMerge('w-full h-full grid place-items-center', className)} >
          <span className="icon !text-4xl text-sky-600">attach_file</span>
        </div>
      }
    </>
  )
  
}

export default FileIcon