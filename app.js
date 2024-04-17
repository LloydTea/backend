const { config } = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = require("express")();
const severless = require("serverless-http");

config();

const port = process.env.PORT;

const corsOptions = {
  origin: "https://ai.lloydtea.pro",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

const router = require("./route/connector");

app.use("/", router.router);

export const handler = severless(app);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
