import User from "../../models/user.js";
import Attendance from "../../models/Attendance.js";
import Leave from "../../models/Leave.js";
import { Op } from "sequelize";

//================= get attendance stats =================
export const getAttendanceStats = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split("T")[0];

    // ================= Date ranges =================
    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];

    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    // ================= 1. Scope =================
    let employeeIds = [];

    if (user.role === "admin") {
      const rows = await User.findAll({
        attributes: ["id"],
        where: {
          role: {
            [Op.in]: ["employee", "manager"],
          },
        },
      });

      employeeIds = [...new Set(rows.map((u) => u.id))];
    } else if (user.role === "manager") {
      const rows = await User.findAll({
        attributes: ["id"],
        where: {
          manager_id: user.id,
        },
      });

      employeeIds = [...new Set([user.id, ...rows.map((u) => u.id)])];
    } else {
      employeeIds = [user.id];
    }

    // If no employees found
    if (!employeeIds.length) {
      return res.json({
        totalEmployees: 0,
        presentToday: 0,
        lateToday: 0,
        halfDayToday: 0,
        absentToday: 0,
        onLeave: 0,
        attendanceRate: 0,
        avgLateArrival: null,
        newThisMonth: 0,
        myAttendanceRate: 0,
        myAbsentThisMonth: 0,
        myPresentDays: 0,
        myTotalHoursThisMonth: 0,
        checkedInToday: false,
        checkedOutToday: false,
      });
    }

    // ================= 2. Today's counts (DB COUNT with WHERE) =================
    const totalEmployees = employeeIds.length;
    const todayBase = { user_id: { [Op.in]: employeeIds }, date: today };

    const [presentToday, lateToday, halfDayToday] = await Promise.all([
      Attendance.count({ where: { ...todayBase, status: "present" } }),
      Attendance.count({ where: { ...todayBase, status: "late" } }),
      Attendance.count({ where: { ...todayBase, status: "half_day" } }),
    ]);

    const checkedIn = presentToday + lateToday + halfDayToday;
    const absentToday = Math.max(0, totalEmployees - checkedIn);

    const attendanceRate =
      totalEmployees > 0 ? Math.round((checkedIn / totalEmployees) * 100) : 0;

    // ================= 3. Avg late arrival (needs raw check_in times) =================
    const lateRecords = await Attendance.findAll({
      attributes: ["check_in"],
      where: { ...todayBase, status: "late", check_in: { [Op.ne]: null } },
    });

    let avgLateArrival = null;

    if (lateRecords.length > 0) {
      const totalMinutes = lateRecords.reduce((sum, r) => {
        const [h, m] = r.check_in.split(":");
        return sum + Number(h) * 60 + Number(m);
      }, 0);

      const avg = Math.round(totalMinutes / lateRecords.length);
      const hh = Math.floor(avg / 60);
      const mm = avg % 60;

      const ampm = hh >= 12 ? "PM" : "AM";
      const displayH = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;

      avgLateArrival = `${displayH}:${String(mm).padStart(2, "0")} ${ampm}`;
    }

    // ================= 4. On Leave =================
    let onLeave = 0;

    try {
      onLeave = await Leave.count({
        where: {
          user_id: {
            [Op.in]: employeeIds,
          },
          overallStatus: "approved",
          startDate: {
            [Op.lte]: today,
          },
          endDate: {
            [Op.gte]: today,
          },
        },
      });
    } catch (leaveError) {
      console.error("Leave count error:", leaveError.message);
      onLeave = 0;
    }

    // ================= 5. New This Month =================
    const thisMonthAttendees = await Attendance.findAll({
      attributes: ["user_id"],
      where: {
        user_id: {
          [Op.in]: employeeIds,
        },
        date: {
          [Op.between]: [thisMonthStart, thisMonthEnd],
        },
      },
      group: ["user_id"],
    });

    const prevMonthAttendees = await Attendance.findAll({
      attributes: ["user_id"],
      where: {
        user_id: {
          [Op.in]: employeeIds,
        },
        date: {
          [Op.between]: [prevMonthStart, prevMonthEnd],
        },
      },
      group: ["user_id"],
    });

    const thisMonthIds = new Set(thisMonthAttendees.map((r) => r.user_id));

    const prevMonthIds = new Set(prevMonthAttendees.map((r) => r.user_id));

    const newThisMonth = [...thisMonthIds].filter(
      (id) => !prevMonthIds.has(id),
    ).length;

    // ================= 6. Personal stats (DB COUNT + SUM with WHERE) =================
    let myAttendanceRate = null;
    let myAbsentThisMonth = null;
    let myPresentDays = null;
    let myTotalHoursThisMonth = null;
    let checkedInToday = false;
    let checkedOutToday = false;

    if (user.role !== "admin") {
      const myMonthBase = {
        user_id: user.id,
        date: { [Op.between]: [thisMonthStart, thisMonthEnd] },
      };

      const myTodayRecord = await Attendance.findOne({
        attributes: ["check_in", "check_out"],
        where: { user_id: user.id, date: today },
      });

      checkedInToday = !!myTodayRecord?.check_in;
      checkedOutToday = !!myTodayRecord?.check_out;

      const [myPresentCount, myAbsentCount, myTotalRecords, rawHours] =
        await Promise.all([
          Attendance.count({
            where: { ...myMonthBase, status: { [Op.in]: ["present", "late"] } },
          }),
          Attendance.count({
            where: { ...myMonthBase, status: "absent" },
          }),
          Attendance.count({ where: myMonthBase }),
          Attendance.sum("total_hours", { where: myMonthBase }),
        ]);

      myPresentDays = myPresentCount;
      myAbsentThisMonth = myAbsentCount;
      myTotalHoursThisMonth = Math.round((rawHours || 0) * 10) / 10;
      myAttendanceRate =
        myTotalRecords > 0
          ? Math.round((myPresentDays / myTotalRecords) * 100)
          : 0;
    }

    // ================= Response =================
    return res.json({
      totalEmployees,
      presentToday,
      lateToday,
      halfDayToday,
      absentToday,
      onLeave,
      attendanceRate,
      avgLateArrival,
      newThisMonth,
      myAttendanceRate,
      myAbsentThisMonth,
      myPresentDays,
      myTotalHoursThisMonth,
      checkedInToday,
      checkedOutToday,
    });
  } catch (error) {
    console.error("Stats error:", error.message);
    console.error(error.stack);

    return res.status(500).json({
      message: "Failed to load attendance stats",
      error: error.message,
    });
  }
};
