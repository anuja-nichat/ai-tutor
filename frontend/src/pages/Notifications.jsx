import React, { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { Grid } from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import ApiService from "../services/api.js";
import ErrorBoundary from "../components/ErrorBoudary.jsx";
import { colors } from "../theme.js";

export default function Notifications({ userId = null, onCountsChange }) {
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const currentUserId = userId || JSON.parse(localStorage.getItem("mongoUser"))?._id;

  // ---------- fetch notifications ----------
  useEffect(() => {
    if (!currentUserId) {
      setError("⚠ User not logged in");
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await ApiService.getNotifications(currentUserId);

        if (mounted && data) {
          let mapped = (data || []).map((n, idx) => ({
            id: n._id || `notif-${idx}`,
            type:
              n.type === "Reminder"
                ? "dailyPlan"
                : n.type === "Alert"
                ? "performance"
                : "upcoming",
            title: n.title || "Notification",
            message: n.message || "No message",
            read: n.read || false,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          }));

          // Only add defaults if no notifications from server
          if (mapped.length === 0) {
            mapped = [
              {
                id: "default-1",
                type: "dailyPlan",
                title: "Welcome!",
                message: "🎉 Start your first study plan today to stay on track!",
                read: false,
                createdAt: new Date(),
              },
              {
                id: "default-2",
                type: "upcoming",
                title: "Get Ready!",
                message: "📅 No quizzes yet. Keep practicing to unlock new quizzes!",
                read: false,
                createdAt: new Date(),
              },
              {
                id: "default-3",
                type: "performance",
                title: "Tip of the Day",
                message: "💡 Review your weak topics daily for better scores!",
                read: false,
                createdAt: new Date(),
              },
            ];
          }

          setList(sortByTime(mapped));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        if (mounted) {
          setError("⚠ Failed to load notifications");
          // Set default notifications on error
          setList([
            {
              id: "error-1",
              type: "dailyPlan",
              title: "Welcome!",
              message: "🎉 Start your first study plan today to stay on track!",
              read: false,
              createdAt: new Date(),
            }
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // every 1 min

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUserId]);

  // Update counts for dashboard
  useEffect(() => {
    if (onCountsChange) {
      onCountsChange(counts(list));
    }
  }, [list, onCountsChange]);

  // ---------- filter notifications ----------
  const filtered = useMemo(() => {
    const base =
      tab === "all"
        ? list
        : tab === "unread"
        ? list.filter((n) => !n.read)
        : list.filter((n) => n.type === tab);

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((n) =>
      [n.title, n.message, n.subject, n.topic]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(q))
    );
  }, [list, tab, query]);

  // ---------- handlers ----------
  const handleMarkRead = async (n) => {
    try {
      if (!n.read) {
        await ApiService.markNotificationRead(n.id);
      }
      setList((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiService.markAllNotificationsRead(currentUserId);
      setList((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const c = counts(list);

  return (
    <Box sx={{ background: "#f8faf8", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: colors.seaGreen,
          color: "white",
          py: 4,
          px: { xs: 2, md: 4 },
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Notifications
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95 }}>
          JEE/NEET smart reminders: upcoming quizzes/tests, daily plan nudges,
          and performance alerts.
        </Typography>
      </Box>

      {/* Tabs & Search */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 }, mt: -4 }}>
        <Paper elevation={1} sx={{ p: 2, borderRadius: 3 }}>
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              sx={{
                ".MuiTabs-indicator": {
                  background: colors.seaGreen,
                  height: 3,
                  borderRadius: 3,
                },
              }}
            >
              <Tab value="all" label={<WithCount label="All" count={c.all} />} />
              <Tab value="upcoming" label={<WithCount label="Upcoming" count={c.upcoming} />} />
              <Tab value="dailyPlan" label={<WithCount label="Daily Plan" count={c.dailyPlan} />} />
              <Tab value="performance" label={<WithCount label="Performance" count={c.performance} />} />
              <Tab value="unread" label={<WithCount label="Unread" count={c.unread} />} />
            </Tabs>

            <Box sx={{ flexGrow: 1 }} />

            <TextField
              size="small"
              placeholder="Search subject, topic, or text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: 200, md: 360 } }}
            />

            <Button
              sx={{ whiteSpace: "nowrap" }}
              color="primary"
              variant="contained"
              startIcon={<DoneAllRoundedIcon />}
              onClick={handleMarkAllRead}
              disabled={c.unread === 0}
            >
              Mark all read
            </Button>
          </Box>
        </Paper>

        {/* Error Message */}
        {error && (
          <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Notification List */}
        <Box mt={3} mb={6}>
          {loading ? (
            <SkeletonList />
          ) : filtered.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <Grid container spacing={3}>
              {filtered.map((n) => (
                <Grid key={n.id} sx={{ display: "flex" }}>
                  <ErrorBoundary>
                  <NotificationCard data={n} onMarkRead={handleMarkRead} style={{ flexGrow: 1 }} />
                  </ErrorBoundary>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ---------- helpers ----------
function WithCount({ label, count }) {
  return (
    <Badge badgeContent={count} color="primary" showZero>
      <span style={{ paddingInline: 4, fontWeight: 700 }}>{label}</span>
    </Badge>
  );
}

function counts(list) {
  return {
    all: list.length,
    unread: list.filter((n) => !n.read).length,
    upcoming: list.filter((n) => n.type === "upcoming").length,
    dailyPlan: list.filter((n) => n.type === "dailyPlan").length,
    performance: list.filter((n) => n.type === "performance").length,
    upcomingUnread: list.filter((n) => n.type === "upcoming" && !n.read).length,
    dailyPlanUnread: list.filter((n) => n.type === "dailyPlan" && !n.read).length,
    performanceUnread: list.filter((n) => n.type === "performance" && !n.read).length,
  };
}

function sortByTime(arr) {
  return [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function EmptyState({ tab }) {
  const byTab = {
    all: "No notifications yet. You are all caught up!",
    upcoming: "No upcoming quizzes or tests found.",
    dailyPlan: "No daily plan reminders right now.",
    performance: "No performance alerts. Keep it up!",
    unread: "No unread notifications. Great job staying on top!",
  };
  return (
    <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px dashed #e5e7eb" }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        {byTab[tab] || byTab.all}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Tips: Practice consistently, revise weak topics, and attempt timed mock tests.
      </Typography>
    </Paper>
  );
}

function SkeletonList() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid key={i} sx={{ display: "flex" }}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #eef2f2", flexGrow: 1 }}>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-40 ml-auto" />
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}