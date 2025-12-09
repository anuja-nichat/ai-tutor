import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Badge, Box } from '@mui/material'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'

export default function DashboardTopbar({ unreadCount, onClickBell }) {
  return (
    <AppBar position="sticky" elevation={0} sx={{ background: '#ffffff', color: '#0b0f10', borderBottom: '1px solid #e2e8f0' }}>
      <Toolbar className="max-w-6xl mx-auto w-full">
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.4 }}>
          Study Ai Tutor
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={onClickBell}>
          <Badge badgeContent={unreadCount} color="success">
            <NotificationsRoundedIcon sx={{ color: '#2E8B57' }} />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}


