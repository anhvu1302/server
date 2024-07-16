const { rootRouter } = require("./routers");
const { roundRobin, leastConnection } = require("./loadBalancing");
const { sequelize } = require("./models");
const bodyParser = require("body-parser");
const cluster = require("cluster");
const compression = require("compression");
const cookieSession = require("cookie-session");
const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const os = require("os");
const passport = require("./utils/auth/passport");
const path = require("path");
require("dotenv").config();

const loadBalancingAlgorithm =
  require("./config/loadBalancingConfig.json").LeastConnection; // Change load balancing algorithm here

const numCPUs = os.cpus().length;


const app = express();

app.use(compression());
app.use(express.json());
// app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: ["vavshop"],
    maxAge: 24 * 60 * 60 * 100,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

const publicPathDirectory = path.join(__dirname, "public");
app.use("/public", express.static(publicPathDirectory));

app.use("/api/v1", rootRouter);



const port = process.env.PORT || 4000;
app.listen(port, () => {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log("Connected to database successfully!");
    } catch (error) {
      console.error("Failed to connect to database.");
      process.exit(1);
    }
  })();
  console.log(
    `Server started and listening on port http://localhost:${port}`
  );
});
