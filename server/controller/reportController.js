import { Op } from "sequelize";
import Task from "../models/task.js";
import User from "../models/user.js";

//Weekly report
export const getWeeklyReport = async (req, res) => {

    try{
        //Get start 




    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Failed to generate report" });
    }





};