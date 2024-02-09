import { useQuery } from '@tanstack/react-query'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  Box,
  Divider,
  List,
  Pagination,
  Skeleton,
  Stack,
  Tab,
  Tabs,
} from '@mui/material'

import {
  CommonQueryParams,
  getUserPostComments,
  getUserReplies,
  getUserThreads,
} from '@/apis/user'
import { PaginationParams } from '@/common/interfaces/response'
import {
  CommonUserQueryRpsoense,
  UserCommonList,
  UserPostComment,
  UserReply,
} from '@/common/interfaces/user'
import Link from '@/components/Link'
import ThreadItem, { ThreadReplyOrCommentItem } from '@/components/ThreadItem'
import { pages } from '@/utils/routes'
import { searchParamsAssign } from '@/utils/tools'

import { AdditionalQueryOptions, UserQuery } from './types'

type OnLoadData = CommonUserQueryRpsoense & PaginationParams

function useCommonQuery<T>(
  userQuery: UserQuery,
  queryOptions: AdditionalQueryOptions,
  subPage: string,
  queryKey: string,
  queryFn: (params: {
    common: CommonQueryParams
    subPage: string
    page: number
    fid?: number
  }) => Promise<T>
) {
  const [searchParams] = useSearchParams()
  const initQuery = () => {
    return {
      common: { ...userQuery, ...queryOptions },
      subPage,
      page: parseInt(searchParams.get('page') || '1') || 1,
      fid: parseInt(searchParams.get('page') || '') || undefined,
    }
  }
  const [query, setQuery] = useState(initQuery())
  useEffect(() => {
    setQuery(initQuery())
  }, [
    searchParams,
    userQuery.uid,
    userQuery.username,
    userQuery.removeVisitLog,
    userQuery.admin,
  ])
  return useQuery({
    queryKey: [queryKey, query],
    queryFn: () => queryFn(query),
  })
}

const Threads = ({
  userQuery,
  queryOptions,
  subPage,
  onLoad,
}: {
  userQuery: UserQuery
  queryOptions: AdditionalQueryOptions
  subPage: string
  onLoad?: (data: OnLoadData) => void
}) => {
  const { data, isLoading } = useCommonQuery(
    userQuery,
    queryOptions,
    subPage,
    'userThreads',
    async (query) => {
      const data = await getUserThreads(query.common, query.page)
      onLoad && onLoad(data)
      return data
    }
  )
  return (
    <>
      {isLoading && (
        <>
          {[...Array(4)].map((_, index) => (
            <Skeleton className="w-full" height={81} key={index}></Skeleton>
          ))}
        </>
      )}
      {data?.rows.map((item) => (
        <ThreadItem
          key={item.thread_id}
          data={item}
          showSummary
          hideThreadAuthor
          ignoreThreadHighlight
        />
      ))}
    </>
  )
}

type CoalescedReply = UserReply & {
  replyItems: ThreadReplyOrCommentItem[]
}

function coalesceRepliesOrComments(
  apiData: UserCommonList<UserReply | UserPostComment>
) {
  const data: UserCommonList<UserReply | UserPostComment> & {
    coalescedReplies?: CoalescedReply[]
  } = apiData
  const coalescedReplies: CoalescedReply[] = []
  const tidItemMap: {
    [thread_id: number]: CoalescedReply
  } = {}
  data.rows?.forEach((item) => {
    const replyItem = { post_id: item.post_id, summary: item.summary }
    if (tidItemMap[item.thread_id]) {
      tidItemMap[item.thread_id].replyItems.push(replyItem)
    } else {
      const newItem = { ...item, replyItems: [replyItem] }
      tidItemMap[item.thread_id] = newItem
      coalescedReplies.push(newItem)
    }
  })
  data.coalescedReplies = coalescedReplies
  return data
}

const Replies = ({
  userQuery,
  queryOptions,
  subPage,
  onLoad,
}: {
  userQuery: UserQuery
  queryOptions: AdditionalQueryOptions
  subPage: string
  onLoad?: (data: OnLoadData) => void
}) => {
  const { data, isLoading } = useCommonQuery(
    userQuery,
    queryOptions,
    subPage,
    'userReplies',
    async (query) => {
      const data = coalesceRepliesOrComments(
        await getUserReplies(query.common, query.page)
      )
      onLoad && onLoad(data)
      return data
    }
  )
  return (
    <>
      {isLoading && (
        <>
          {[...Array(4)].map((_, index) => (
            <Skeleton className="w-full" height={81} key={index}></Skeleton>
          ))}
        </>
      )}
      {data?.coalescedReplies?.map((item) => (
        <ThreadItem
          key={item.thread_id}
          data={item}
          hideThreadAuthor
          ignoreThreadHighlight
          replies={item.replyItems}
        />
      ))}
    </>
  )
}

const PostComments = ({
  userQuery,
  queryOptions,
  subPage,
  onLoad,
}: {
  userQuery: UserQuery
  queryOptions: AdditionalQueryOptions
  subPage: string
  onLoad?: (data: OnLoadData) => void
}) => {
  const { data, isLoading } = useCommonQuery(
    userQuery,
    queryOptions,
    subPage,
    'userReplies',
    async (query) => {
      const data = coalesceRepliesOrComments(
        await getUserPostComments(query.common, query.page)
      )
      onLoad && onLoad(data)
      return data
    }
  )
  return (
    <>
      {isLoading && (
        <>
          {[...Array(4)].map((_, index) => (
            <Skeleton className="w-full" height={81} key={index}></Skeleton>
          ))}
        </>
      )}
      {data?.coalescedReplies?.map((item) => (
        <ThreadItem
          key={item.thread_id}
          data={item}
          hideThreadAuthor
          ignoreThreadHighlight
          replies={item.replyItems}
        />
      ))}
    </>
  )
}

const ThreadList = ({
  children,
  pagination,
}: {
  children: React.ReactNode
  pagination?: PaginationParams
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <>
      <List>{children}</List>
      {pagination && pagination.total > pagination.page_size && (
        <Stack direction="row" justifyContent="center" my={1.5}>
          <Pagination
            boundaryCount={3}
            siblingCount={1}
            page={pagination.page}
            count={Math.ceil(pagination.total / (pagination.page_size || 1))}
            onChange={(_: React.ChangeEvent<unknown>, page: number) =>
              setSearchParams(searchParamsAssign(searchParams, { page }))
            }
          />
        </Stack>
      )}
    </>
  )
}

const tabs = [
  { id: 'threads', title: '主题', component: Threads },
  { id: 'replies', title: '回复', component: Replies },
  { id: 'postcomments', title: '点评', component: PostComments },
]

const UserThreads = ({
  userQuery,
  queryOptions,
  onLoad,
}: {
  userQuery: UserQuery
  queryOptions: AdditionalQueryOptions
  onLoad?: (data: CommonUserQueryRpsoense) => void
}) => {
  const subPage = useParams().subPage
  const [pagination, setPagination] = useState<PaginationParams>()
  const Component = (tabs.find((item) => item.id == subPage) || tabs[0])
    .component

  return (
    <Box pb={1}>
      <Tabs value={subPage}>
        {tabs.map((tab) => (
          <Tab
            to={pages.user({
              uid: userQuery.uid,
              username: userQuery.username,
              removeVisitLog: userQuery.removeVisitLog,
              admin: userQuery.admin,
              subPage: tab.id,
            })}
            component={Link}
            key={tab.id}
            label={tab.title}
            value={tab.id}
          />
        ))}
      </Tabs>
      <Divider />
      <ThreadList pagination={pagination}>
        <Component
          userQuery={userQuery}
          queryOptions={queryOptions}
          subPage={subPage || tabs[0].id}
          onLoad={(data) => {
            setPagination({
              page: data.page,
              page_size: data.page_size,
              total: data.total,
            })
            onLoad && onLoad(data)
          }}
        />
      </ThreadList>
    </Box>
  )
}

export default UserThreads
