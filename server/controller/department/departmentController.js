import Department from "../../models/Department.js";
import User from "../../models/user.js";
import { Op } from "sequelize";

const buildDepartmentFilters = (query) => {
  const { search, status, sortBy = "createdAt", sortOrder = "DESC" } = query;

  const departmentWhere = {};
  const searchText = typeof search === "string" ? search.trim() : "";

  if (searchText) {
    departmentWhere[Op.or] = [
      { name: { [Op.iLike]: `%${searchText}%` } },
      { code: { [Op.iLike]: `%${searchText}%` } },
      { "$manager.name$": { [Op.iLike]: `%${searchText}%` } },
    ];
  }

  if (status && status !== "all") {
    departmentWhere.status = status;
  }

  const allowedDbSortColumns = ["name", "code", "status", "createdAt"];
  const dbSortBy = allowedDbSortColumns.includes(sortBy) ? sortBy : "createdAt";
  const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  return {
    departmentWhere,
    dbSortBy,
    finalSortOrder,
    sortBy,
  };
};

// ================= CREATE DEPARTMENT =================
export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, manager_id, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const existing = await Department.findOne({
      where: { code: code.toUpperCase() },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Department code already exists" });
    }

    // If assigning manager, verify they are actually a manager
    if (manager_id) {
      const mgr = await User.findOne({
        where: { id: manager_id, role: "manager" },
      });
      if (!mgr) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a manager" });
      }

      const existing = await Department.findOne({
        where: { manager_id },
      });

      if (existing) {
        return res.status(400).json({
          message: "The manager is already assigned to another department",
        });
      }
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || null,
      manager_id: manager_id || null,
      status: status || "active",
    });

    // Update manager's department_id if assigned
    if (manager_id) {
      await User.update(
        { department_id: department.id, department: name },
        { where: { id: manager_id } },
      );
    }

    res
      .status(201)
      .json({ message: "Department created successfully", department });
  } catch (error) {
    console.error("createDepartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL DEPARTMENTS =================
export const getAllDepartments = async (req, res) => {
  try {
    const { departmentWhere, dbSortBy, finalSortOrder, sortBy } =
      buildDepartmentFilters(req.query);

    let order = [[dbSortBy, finalSortOrder]];

    // sort by manager name
    if (sortBy === "manager") {
      order = [[{ model: User, as: "manager" }, "name", finalSortOrder]];
    }

    const [departments, total, active, assigned, totalEmployees] =
      await Promise.all([
        Department.findAll({
          where: departmentWhere,
          include: [
            {
              model: User,
              as: "manager",
              attributes: ["id", "name", "email", "position"],
              required: false,
            },
            {
              model: User,
              as: "employees",
              attributes: ["id", "role"],
              where: { role: "employee" },
              required: false,
            },
          ],
          order,
          subQuery: false,
        }),
        Department.count(),
        Department.count({ where: { status: "active" } }),
        Department.count({ where: { manager_id: { [Op.ne]: null } } }),
        User.count({
          where: { role: "employee", department_id: { [Op.ne]: null } },
        }),
      ]);

    const result = departments.map((dept) => {
      const plain = dept.toJSON();
      return {
        ...plain,
        employeeCount: plain.employees?.length || 0,
      };
    });

    // employees sort (calculated field)
    if (sortBy === "employees") {
      result.sort((a, b) =>
        finalSortOrder === "ASC"
          ? a.employeeCount - b.employeeCount
          : b.employeeCount - a.employeeCount,
      );
    }

    res.json({
      departments: result,
      stats: { total, active, assigned, totalEmployees },
    });
  } catch (error) {
    console.error("getAllDepartments error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= GET DEPARTMENT BY ID =================
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email", "position"],
        },
        {
          model: User,
          as: "employees",
          attributes: [
            "id",
            "name",
            "email",
            "role",
            "position",
            "manager_id",
            "createdAt",
          ],
          where: { role: "employee" },
          required: false,
        },
      ],
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const plain = department.toJSON();
    const employees = plain.employees ?? [];
    const employeeCount = plain.manager_id
      ? employees.filter((e) => e.manager_id === plain.manager_id).length
      : employees.length;
    res.json({ ...plain, employeeCount });
  } catch (error) {
    console.error("getDepartmentById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE DEPARTMENT =================
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, manager_id, status } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check code uniqueness if changed
    if (code && code.toUpperCase() !== department.code) {
      const existing = await Department.findOne({
        where: { code: code.toUpperCase(), id: { [Op.ne]: id } },
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Department code already exists" });
      }
    }

    // Unlink old manager's department_id if manager changes
    if (manager_id !== undefined && manager_id !== department.manager_id) {
      if (department.manager_id) {
        await User.update(
          { department_id: null, department: null },
          { where: { id: department.manager_id } },
        );
      }
      if (manager_id) {
        const mgr = await User.findOne({
          where: { id: manager_id, role: "manager" },
        });
        if (!mgr) {
          return res
            .status(400)
            .json({ message: "Assigned user is not a manager" });
        }
        await User.update(
          { department_id: id, department: name || department.name },
          { where: { id: manager_id } },
        );
      }
    }

    department.name = name || department.name;
    department.code = code ? code.toUpperCase() : department.code;
    department.description =
      description !== undefined ? description : department.description;
    department.manager_id =
      manager_id !== undefined ? manager_id || null : department.manager_id;
    department.status = status || department.status;

    await department.save();
    res.json({ message: "Department updated successfully", department });
  } catch (error) {
    console.error("updateDepartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE DEPARTMENT =================
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Unlink all employees
    await User.update(
      { department_id: null, department: null },
      { where: { department_id: id } },
    );

    await department.destroy();
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("deleteDepartment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= TOGGLE STATUS =================
export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    department.status = department.status === "active" ? "inactive" : "active";
    await department.save();
    res.json({
      message: `Department ${department.status}`,
      status: department.status,
    });
  } catch (error) {
    console.error("toggleDepartmentStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ASSIGN MANAGER =================
export const assignManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_id } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const mgr = await User.findOne({
      where: { id: manager_id, role: "manager" },
    });
    if (!mgr) {
      return res.status(400).json({ message: "User is not a manager" });
    }

    // Unlink old manager
    if (department.manager_id) {
      await User.update(
        { department_id: null, department: null },
        { where: { id: department.manager_id } },
      );
    }

    department.manager_id = manager_id;
    await department.save();

    await User.update(
      { department_id: id, department: department.name },
      { where: { id: manager_id } },
    );

    res.json({ message: "Manager assigned successfully" });
  } catch (error) {
    console.error("assignManager error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
