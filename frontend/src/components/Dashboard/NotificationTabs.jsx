import React from 'react'
import { Tabs, Tab, Badge } from '@mui/material'

export default function NotificationTabs({ value, counts, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={(e, v) => onChange(v)}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{
        '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 },
        '& .MuiTabs-indicator': { backgroundColor: '#2E8B57', height: 3 },
      }}
    >
      <Tab label={<Badge color="success" badgeContent={counts.all}>All</Badge>} />
      <Tab label={<Badge color="success" badgeContent={counts.upcoming}>Upcoming</Badge>} />
      <Tab label={<Badge color="success" badgeContent={counts.plan}>Daily Plan</Badge>} />
      <Tab label={<Badge color="success" badgeContent={counts.performance}>Performance</Badge>} />
      <Tab label={<Badge color="success" badgeContent={counts.unread}>Unread</Badge>} />
    </Tabs>
  )
}


