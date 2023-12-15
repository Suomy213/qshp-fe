import Vditor from 'vditor'

import { createRef, useEffect } from 'react'

import { Typography } from '@mui/material'

import { PostFloor } from '@/common/interfaces/response'
import { getPreviewOptions } from '@/components/Editor/config'
import { useAppState } from '@/states'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bbcode2html from '@/utils/bbcode/bbcode'

import './richtext.css'

export type PropsType = {
  message: string
  format: number
}

export function ParseLegacy({ post }: { post: PostFloor }) {
  return (
    <div
      className="rich-text-content rich-text-content-legacy"
      dangerouslySetInnerHTML={{
        __html: bbcode2html(post.message, {
          allowimgurl: true,
          bbcodeoff: post.format != 0,
          parseurloff: post.parseurloff,
          smileyoff: post.smileyoff,
        }),
      }}
    ></div>
  )
}

function ParseMd({ message }: { message: string }) {
  const { state } = useAppState()
  const el = createRef<HTMLDivElement>()
  useEffect(() => {
    el.current &&
      Vditor.preview(el.current, message, getPreviewOptions(state.theme))
  }, [])
  return (
    <div className="rich-text-content rich-text-content-markdown">
      <Typography color="text.primary" ref={el}></Typography>
    </div>
  )
}

export function ParsePost({ post }: { post: PostFloor }) {
  return post.format == 2 ? (
    <ParseMd message={post.message} />
  ) : (
    <ParseLegacy post={post} />
  )
}
