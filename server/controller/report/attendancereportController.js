// Model and Sequalizer operator
import { Op, fn, col, literal } from "sequelize";
import Attendance from "../../models/Attendance.js";
import User from "../../models/user.js";
import Department from "../../models/Department.js";

// ========= HELPER: Build WHERE clause from query params for attendance report ============
const buildFilters = (query) => {
    const { dateFrom, dateTo, status, department, userId } = query;
    const where = {};

    //date range
    if (dateFrom && dateTo) {
        where.date = {
            [Op.between] : [dateFrom, dateTo]
        };
    }

    //single status filter ( present | late | absent )
    if (status && status !=="all") {
        where.status = status;

    }

    //optional department filter
    if (department) {
        where.department = {
            [Op.iLike]: `%${department}%`
        };
    }

    //filter by specific employee
    if (userId) {
        where.user_id = userId;
    }

    return where;


};

// ================ Attendance Report Controller ==================

   // Returns aggregated counts per employee (present, late, absent, total_hours)
   export const getAttendanceSummary = async (req, res) => {
    try {
        const where =buildFilters(req.query);
        const rows = await Attendance.findAll({
            where,
            attributes: [
                "user_id",
                //sequalizer aggregation functions to calculate counts and total hours
                [fn("COUNT", col("id")),          "total_days"],
                [fn("SUM", literal("CASE WHEN status='present' THEN 1 ELSE 0 END")), "present"],
                [fn("SUM", literal("CASE WHEN status='late' THEN 1 ELSE 0 END")), "late"],
                [fn("SUM", literal("CASE WHEN status='absent' THEN 1 ELSE 0 END")),   "absent"],
                [fn("SUM", literal("CASE WHEN status='half_day' THEN 1 ELSE 0 END")), "half_day"],
                [fn("SUM", col("total_hours")),      "total_hours"],

            ],
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "employee_id", "position"],
                    include: [{
                        model: Department,
                        as: "dept",
                        attributes: ["name"],
                    }],
                },
            ],
            //group by employee to get aggregated results
            group: ["user_id", "user.id", "user->dept.id"],
            order: [[col("user.name"), "ASC"]],
        });

        res.json({ data: rows });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate attendance summary" });
    }

   };


   //====== Return raw attendnace rows (list view,  filterable by date, status, department, employee) ========
   export const getAttendanceDetails = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const where = buildFilters(req.query);
        const offset = (page - 1) * limit;

        const { count, rows } = await Attendance.findAndCountAll ({
            where, 
            include: [
               {
                model: User,
                as: "user",
                attributes: ["name", "email", "employee_id", "position"],
               },
            ],
            order: [["date", "DESC"]],
            limit: Number(limit),
            offset: Number(offset),
        });

        res.json({
            total: count,
            page: Number(page),
            data: rows,
        });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch attendance details" });
    }

   };

   //Return day-by-day aggregated counts (for chart)
   export const getDailyAttendanceTrends = async (req, res) => {
    try {
        const where = buildFilters(req.query);
        const rows = await Attendance.findAll({
            where,
            attributes: [
                "date",
                [fn("COUNT", col("id")), "total"],
                [fn("SUM", literal("CASE WHEN status='present' THEN 1 ELSE 0 END")), "present"],
                [fn("SUM", literal("CASE WHEN status='late' THEN 1 ELSE 0 END")), "late"],
                [fn("SUM", literal("CASE WHEN status='absent' THEN 1 ELSE 0 END")), "absent"],
            ],
            group: ["date"],
            order: [["date", "ASC"]],
        });

        res.json({ data: rows });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch daily attendance trends" });
    }

   };