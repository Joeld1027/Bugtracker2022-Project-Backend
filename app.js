const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
var session = require("express-session");

if (process.env.NODE_ENV !== "production") {
	// Load environment variables from .env file in non prod environments
	require("dotenv").config();
}
require("./utils/connectdb");

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./authenticate");

const authRouter = require("./routes/authRoute");

const app = express();
app.use(
	session({
		secret: process.env.EXPRESS_SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
	})
);
// parse requests of content-type - application/json
// app.use(express.json());

// // parse requests of content-type - application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser(process.env.COOKIE_SECRET));

//Add the client URL to the CORS policy

const whitelist = process.env.WHITELISTED_DOMAINS
	? process.env.WHITELISTED_DOMAINS.split(",")
	: [];

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},

	credentials: true,
};

app.use(cors(corsOptions));

app.use(passport.initialize());

app.use("/auth", authRouter);

app.get("/", function (req, res) {
	res.send({ status: "success" });
});

//Start the server in port 8081

const server = app.listen(process.env.PORT || 8082, function () {
	const port = server.address().port;

	console.log("App started at port:", port);
});
