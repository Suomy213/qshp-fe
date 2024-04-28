import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { List, ListItemButton, Paper, Stack } from '@mui/material'

import { MessageCounts } from '@/common/interfaces/response'
import Link from '@/components/Link'
import StartConversation from '@/pages/Messages/Chat/StartConversation'
import { pages, useActiveRoute } from '@/utils/routes'

//Navigation-Items of Messages
const navItems = [
  {
    id: 'chat',
    text: '站内信',
  },
  {
    id: 'posts',
    text: '我的帖子',
  },
  {
    id: 'system',
    text: '系统消息',
  },
]

const Messages = () => {
  const route = useActiveRoute()
  const [count, setCount] = useState<MessageCounts>()
  const countMembers = (obj: { [kind: string]: number } | undefined) => {
    if (!obj) {
      return
    }
    return Object.entries(obj).reduce((result, [k, v]) => result + v, 0)
  }
  const counts: { [group: string]: number | undefined } = {
    chat: count?.chat,
    posts: countMembers(count?.posts),
    system: countMembers(count?.system),
  }
  return (
    <Stack direction="row" alignItems="flex-start" mt={2}>
      <Stack
        spacing={2}
        direction="column"
        sx={{ width: 180, mr: 4, flexGrow: 0, flexShrink: 0, elevation: 3 }}
      >
        {/*
        still Navigation-Items of Messages
        Paper: a card with shadow
        margin-right: 4
        do not grow or shrink
      */}
        <Paper
          sx={{ width: 180, mr: 4, flexGrow: 0, flexShrink: 0, elevation: 3 }}
        >
          <List disablePadding>
            {navItems.map((item, index) => (
              <Link
                underline="none"
                color="inherit"
                key={index}
                to={pages.messages(item.id as MessageGroup)}
              >
                <ListItemButton selected={item.id == route?.id}>
                  {item.text}
                  {!!counts[item.id] && ` (${counts[item.id]})`}
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Paper>
        <StartConversation />
      </Stack>
      <Outlet context={{ setCount }} />
    </Stack>
  )
}

export default Messages
