const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

const { getToken, verifyUser } = require("../authenticate");

router.post("/signup", (req, res, next) => {
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(err, user) => {
			if (err) {
				res.statusCode = 500;
				res.send(err);
			} else {
				user.name = `${req.body.firstName} ${req.body.lastName}`;
				const token = getToken({ _id: user._id });
				user.save((err, user) => {
					if (err) {
						res.statusCode = 500;
						res.send(err);
					} else {
						res.send({ success: true, token, user });
					}
				});
			}
		}
	);
});

router.post(
	"/login",
	passport.authenticate("local"),
	async (req, res, next) => {
		try {
			const token = getToken({ _id: req.user._id });

			const foundUser = await User.findById(req.user._id)
				.populate("assignedProjects")
				.exec();

			res.send({ success: true, token, foundUser });
		} catch (error) {
			res.statusCode = 500;
			console.log(error);
			res.send(error);
		}
		next();
	}
);

router.post("/logout", verifyUser, (req, res, next) => {
	req.logout;
	if (req.session) {
		req.session.destroy((err) => {
			if (err) {
				res.status(400).send("Unable to log out");
			} else {
				res.send("Logout successful");
			}
		});
	} else {
		res.end();
	}
});

router.get("/currentUser", verifyUser, async (req, res, next) => {
	if (!req.user) return next(err);
	const foundUser = await User.findById(req.user._id)
		.populate("assignedProjects")
		.exec();
	if (foundUser) res.send(foundUser);
});

module.exports = router;
