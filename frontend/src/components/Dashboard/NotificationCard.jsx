import React from 'react'
import { Card, CardContent, CardActions, Chip, Stack, Typography, IconButton, Tooltip, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AlarmIcon from '@mui/icons-material/Alarm'
import SchoolIcon from '@mui/icons-material/School'
import InsightsIcon from '@mui/icons-material/Insights'

const categoryIconMap = {
  upcoming: <AlarmIcon fontSize="small" />,
  plan: <SchoolIcon fontSize="small" />,
  performance: <InsightsIcon fontSize="small" />,
}

export default function NotificationCard({ item, onMarkRead }) {
  const isRead = Boolean(item.read)
  const icon = categoryIconMap[item.category] || <AlarmIcon fontSize="small" />

  return (
    <Card className="shadow-soft hover:shadow-xl transition-shadow" sx={{ borderLeft: `4px solid ${isRead ? '#cbd5e1' : '#2E8B57'}` }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" className="mb-2">
          <Chip icon={icon} label={item.categoryLabel || item.category} size="small" sx={{ backgroundColor: '#E8F5EF', color: '#2E8B57', fontWeight: 600 }} />
          {!isRead && <Chip label="New" size="small" color="success" variant="outlined" />}
        </Stack>
        <Typography variant="h6" sx={{ color: '#0b0f10', fontWeight: 700 }}>
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#334155' }} className="mt-1">
          {item.message}
        </Typography>
        {item.meta && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
            {item.meta.subject && <div><span className="font-semibold text-seagreen">Subject:</span> {item.meta.subject}</div>}
            {item.meta.topic && <div><span className="font-semibold text-seagreen">Topic:</span> {item.meta.topic}</div>}
            {item.meta.date && <div><span className="font-semibold text-seagreen">Date:</span> {item.meta.date}</div>}
            {item.meta.time && <div><span className="font-semibold text-seagreen">Time:</span> {item.meta.time}</div>}
          </div>
        )}
      </CardContent>
      <CardActions className="flex justify-between">
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {item.timeAgo || ''}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!isRead && (
            <Tooltip title="Mark as read">
              <IconButton color="success" onClick={() => onMarkRead(item)}>
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}
          {item.cta && (
            <Button size="small" variant="contained" color="primary" onClick={() => window.open(item.cta.href, '_blank')}>
              {item.cta.label}
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  )
}


