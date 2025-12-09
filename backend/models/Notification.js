const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Reminder", "Alert", "Info"],
    default: "Reminder",
  },
  title: {
    type: String,
    required: true,
    default: "Notification",
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  category: {
    type: String,
    enum: ["study", "quiz", "system", "performance"],
    default: "system",
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Expire after 30 days
      return date;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, read: false });
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

module.exports = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);