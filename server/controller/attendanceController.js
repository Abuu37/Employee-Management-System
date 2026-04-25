import User from "../models/user.js";
import Attendance from "../models/Attendance.js";

//====================== check in ===================
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      where: { user_id: userId, date: today },
    });

    if (existing) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

    // Determine status from check-in hour + minute
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const CUTOFF_ON_TIME = 9 * 60 + 30; // 09:30 → present
    const CUTOFF_LATE = 13 * 60; // 13:00 → half_day
    const CUTOFF_HALF_DAY = 17 * 60; // 17:00 → absent

    let status;
    if (totalMinutes <= CUTOFF_ON_TIME) {
      status = "present";
    } else if (totalMinutes < CUTOFF_LATE) {
      status = "late";
    } else if (totalMinutes < CUTOFF_HALF_DAY) {
      status = "half_day";
    } else {
      status = "absent";
    }

    const attendance = await Attendance.create({
      user_id: userId,
      date: today,
      check_in: checkInTime,
      status,
    });

    res.json({
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//========================== check out ==================
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({
      where: { user_id: userId, date: today },
    });

    if (!record) {
      return res.status(400).json({
        message: "No check-in record found for today",
      });
    }

    if (record.check_out) {
      return res.status(400).json({
        message: "Already checked out today",
      });
    }

    const now = new Date();
    const checkOutTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS" local time

    // Calculate total hours using local time strings to stay consistent with check_in
    const [inH, inM, inS] = record.check_in.split(":").map(Number);
    const [outH, outM, outS] = checkOutTime.split(":").map(Number);
    const inSeconds = inH * 3600 + inM * 60 + (inS || 0);
    const outSeconds = outH * 3600 + outM * 60 + (outS || 0);
    const totalHours = Math.max(0, (outSeconds - inSeconds) / 3600);

    record.check_out = checkOutTime;
    record.total_hours = totalHours.toFixed(2);
    await record.save();

    res.json(record);
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= Get my attendance =================

export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Attendance.findAll({
      where: { user_id: userId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get ALL Attendace by ADMIN =================
export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching all attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get attendance by Team (for manager) =================
export const getTeamAttendance = async (req, res) => {
  try {
    const managerId = req.user.id;

    const team = await User.findAll({
      where: { manager_id: managerId },
    });

    const teamIds = team.map((u) => u.id);

    const data = await Attendance.findAll({
      where: { user_id: teamIds },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching team attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get attendance by status (for admin and manager) =================
export const getAttendanceByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const data = await Attendance.findAll({
      where: { status },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["date", "DESC"]],
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching attendance by status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
