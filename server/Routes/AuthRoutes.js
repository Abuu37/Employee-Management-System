import express from "express";
import {  login } from "../controller/userController.js";

const AuthRoute = express.Router();
AuthRoute.post("/login", login);

export { AuthRoute };
