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
  dailyPlan: <SchoolIcon fontSize="small" />,
}

// Safe data access helper
const safeGet = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}

export default function NotificationCard({ data, onMarkRead }) {
  // Safely access properties with defaults
  const item = data || {};
  const isRead = Boolean(safeGet(item, 'read', false));
  const category = safeGet(item, 'type', 'upcoming');
  const icon = categoryIconMap[category] || <AlarmIcon fontSize="small" />;
  
  const categoryLabels = {
    upcoming: 'Upcoming',
    dailyPlan: 'Daily Plan', 
    performance: 'Performance',
    plan: 'Plan'
  };

  const categoryLabel = categoryLabels[category] || category;

  return (
    <Card className="shadow-soft hover:shadow-xl transition-shadow" sx={{ 
      borderLeft: `4px solid ${isRead ? '#cbd5e1' : '#2E8B57'}`,
      width: '100%',
      minHeight: 200 
    }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" className="mb-2">
          <Chip 
            icon={icon} 
            label={categoryLabel} 
            size="small" 
            sx={{ backgroundColor: '#E8F5EF', color: '#2E8B57', fontWeight: 600 }} 
          />
          {!isRead && <Chip label="New" size="small" color="success" variant="outlined" />}
        </Stack>
        <Typography variant="h6" sx={{ color: '#0b0f10', fontWeight: 700 }}>
          {safeGet(item, 'title', 'Notification')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#334155' }} className="mt-1">
          {safeGet(item, 'message', 'No message available')}
        </Typography>
        
        {/* Safely render meta information */}
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
          {item.timeAgo || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!isRead && (
            <Tooltip title="Mark as read">
              <IconButton 
                color="success" 
                onClick={() => onMarkRead && onMarkRead(item)}
                size="small"
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}
          {item.cta && (
            <Button 
              size="small" 
              variant="contained" 
              color="primary" 
              onClick={() => item.cta.href && window.open(item.cta.href, '_blank')}
            >
              {item.cta.label || 'Open'}
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  )
}