const generateResponse = require("../src/index");

const router = require("express").Router();

router.post("/send", generateResponse.getMessage);

module.exports = { router };
