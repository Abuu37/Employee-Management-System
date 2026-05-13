import User from "../../models/user.js";
import Attendance from "../../models/Attendance.js";
import Department from "../../models/Department.js";
import Task from "../../models/task.js";
import { Op, where } from "sequelize";


// Helper to build dynamic filters for attendance queries based on request query parameters.
const buildAttendnaceFilters = (query) => {
  const { search, status, dateFrom, dateTo, sortBy = "date", sortOrder = "DESC" } = query;

  const attendanceWhere = {};
  const searchText = typeof search === "string" ? search.trim() : "";

  // Search across attendance snapshot department and joined user fields.
  if (searchText) {
    attendanceWhere[Op.or] = [
      { department: { [Op.iLike]: `%${searchText}%` } },
      { "$user.name$": { [Op.iLike]: `%${searchText}%` } },
      { "$user.email$": { [Op.iLike]: `%${searchText}%` } },
    ];
  }

  //status
  if (status && status !== "all") {
    attendanceWhere.status = status;
  }

  //date range
  if (dateFrom && dateTo) {
    attendanceWhere.date = {
      [Op.between]: [dateFrom, dateTo],
    };
  } else if (dateFrom) {
    attendanceWhere.date = {
      [Op.gte]: dateFrom,
    };
  } else if (dateTo) {
    attendanceWhere.date = {
      [Op.lte]: dateTo,
    };
  }

  //allowed sortable columns
  const allowableSortColumn = [
    "date",
    "status",
    "total_hours",
    "check_in",
    "check_out",
  ];

  const finalSortBy = allowableSortColumn.includes(sortBy) ? sortBy : "date";

  const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  return {
    attendanceWhere,
    order: [[finalSortBy, finalSortOrder]],
  };
};



//====================== check in ===================
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      where: { user_id: userId, date: today },
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    // fetch user to snapshot their department
    const user = await User.findByPk(userId, {
      attributes: ["department"],
      include: [
        {
          model: Department,
          as: "dept",
          attributes: ["name"],
          required: false,
        },
      ],
    });
    const department = user?.dept?.name ?? user?.department ?? null;

    const now = new Date();
    const checkInTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const CUTOFF_ON_TIME = 9 * 60 + 30; // 09:30 → present
    const CUTOFF_LATE = 13 * 60; // 13:00 → half_day
    const CUTOFF_HALF_DAY = 17 * 60; // 17:00 → absent

    let status;
    if (totalMinutes <= CUTOFF_ON_TIME) status = "present";
    else if (totalMinutes < CUTOFF_LATE) status = "late";
    else if (totalMinutes < CUTOFF_HALF_DAY) status = "half_day";
    else status = "absent";

    const attendance = await Attendance.create({
      user_id: userId,
      date: today,
      check_in: checkInTime,
      status,
      department,
    });

    res.json({ message: "Checked in successfully", attendance });
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
      return res
        .status(400)
        .json({ message: "No check-in record found for today" });
    }
    if (record.check_out) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    const checkOutTime = now.toTimeString().split(" ")[0];

    const [inH, inM, inS] = record.check_in.split(":").map(Number);
    const [outH, outM, outS] = checkOutTime.split(":").map(Number);
    const inSeconds = inH * 3600 + inM * 60 + (inS || 0);
    const outSeconds = outH * 3600 + outM * 60 + (outS || 0);
    const totalHours = Math.max(0, (outSeconds - inSeconds) / 3600);

    const { work_summary, notes, completed_task_ids = [] } = req.body;
    record.check_out = checkOutTime;
    record.total_hours = totalHours.toFixed(2);
    record.work_summary = work_summary || null;
    record.notes = notes || null;
    record.completed_task_ids = Array.isArray(completed_task_ids)
      ? completed_task_ids
      : [];
    await record.save();

    if (record.completed_task_ids.length > 0) {
      await Task.update(
        { status: "completed", completedAt: new Date() },
        { where: { id: record.completed_task_ids, assignedTo: userId } },
      );
    }

    res.json(record);
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get my attendance =================
export const getMyAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { attendanceWhere, order } = buildAttendnaceFilters(req.query);
    attendanceWhere.user_id = req.user.id;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Attendance.findAndCountAll({
      where: attendanceWhere,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: order,
      limit: Number(limit),
      offset,
    });

    res.json({
      data: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get all attendance (admin) =================
export const getAllAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const { attendanceWhere, order } = buildAttendnaceFilters(req.query);

    const { rows, count } = await Attendance.findAndCountAll({
      where: attendanceWhere,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get team attendance (manager) =================
export const getTeamAttendance = async (req, res) => {
  try {
    const team = await User.findAll({
      where: { manager_id: req.user.id },
    });

    const teamIds = [req.user.id, ...team.map((u) => u.id)];

    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const { attendanceWhere, order } = buildAttendnaceFilters(req.query);

    attendanceWhere.user_id = teamIds;

    const { rows, count } = await Attendance.findAndCountAll({
      where: attendanceWhere,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: order,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      data: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching team attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================= get attendance by status =================
export const getAttendanceByStatus = async (req, res) => {
  try {
    const data = await Attendance.findAll({
      where: { status: req.params.status },
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
