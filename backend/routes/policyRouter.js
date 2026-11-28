import express from "express";

const policyRouter = express.Router();

policyRouter.get("/privacy", (req, res) => {
    res.render("privacy");
});

policyRouter.get("/terms", (req, res) => {
    res.render("terms");
});

export default policyRouter;