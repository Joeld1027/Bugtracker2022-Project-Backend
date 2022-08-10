const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

const { getToken, COOKIE_OPTIONS, verifyUser } = require("../authenticate");

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

router.post("/login", passport.authenticate("local"), (req, res, next) => {
	const token = getToken({ _id: req.user._id });
	User.findById(req.user._id).then(
		(user) => {
			user.save((err, user) => {
				if (err) {
					res.statusCode = 500;
					res.send(err);
				} else {
					res.send({ success: true, token, user });
				}
			});
		},
		(err) => next(err)
	);
});

router.get("/logout", verifyUser, (req, res, next) => {
	User.findById(req.user._id).then(
		(user) => {
			user.save((err, user) => {
				if (err) {
					res.statusCode = 500;
					res.send(err);
				} else {
					res.clearCookie("refreshToken", COOKIE_OPTIONS);
					res.send({ success: true });
				}
			});
		},
		(err) => next(err)
	);
});

router.get("/currentUser", verifyUser, (req, res, next) => {
	res.send(req.user);
});

module.exports = router;
