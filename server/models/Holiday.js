import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Holiday extends Model {}

Holiday.init(
    {
        name: DataTypes.STRING,
        date: DataTypes.DATEONLY,
        description: DataTypes.STRING,
    },
    {
        sequelize,
        modelName: "Holiday",
        tableName: "holidays",
        timestamps: false,
    },
);

export default Holiday;