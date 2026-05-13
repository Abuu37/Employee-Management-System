import Notification from "../models/Notification.js";
import User from "../models/user.js";

// ============== Helper used by other controllers ==========
export async function createNotification({
  userId,
  title,
  message,
  type,
  refId = null,
}) {
  try {
    await Notification.create({ userId, title, message, type, refId });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}

// =========== GET /api/notifications  (current user's notifications) ==========
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["id", "DESC"]],
      limit: 50,
    });
    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =========== PATCH /api/notifications/:id/read  (mark one as read) ==========
export const markOneRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });
    if (!notif) {
      return res.status(404).json({ message: "Not found" });
    }
    await notif.update({ isRead: true });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =========== PATCH /api/notifications/read-all  (mark all as read) ==========
export const markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          isRead: false,
        },
      },
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =========== DELETE /api/notifications/:id  (delete one) ==========
export const deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =========== DELETE /api/notifications  (clear all) ==========
export const clearAll = async (req, res) => {
  try {
    await Notification.destroy({
      where: { userId: req.user.id },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
