const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
	getToken,
	COOKIE_OPTIONS,
	getRefreshToken,
} = require("../authenticate");

router.post("/signup", (req, res, next) => {
	console.log(req.body);
	// Verify that first name is not empty
	if (!req.body.firstName) {
		res.statusCode = 500;
		res.send({
			name: "FirstNameError",
			message: "The first and last name is required",
		});
	} else {
		User.register(
			new User({ username: req.body.email }),
			req.body.password,
			(err, user) => {
				if (err) {
					res.statusCode = 500;
					res.send(err);
				} else {
					user.name = `${req.body.firstName} ${req.body.lastName}`;
					const token = getToken({ _id: user._id });
					const refreshToken = getRefreshToken({ _id: user._id });
					user.refreshToken.push({ refreshToken });
					user.save((err, user) => {
						if (err) {
							res.statusCode = 500;
							res.send(err);
						} else {
							res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
							res.send({ success: true, token });
						}
					});
				}
			}
		);
	}
});

router.post("/login", passport.authenticate("local"), (req, res, next) => {
	console.log(req.user);
	const token = getToken({ _id: req.user._id });
	const refreshToken = getRefreshToken({ _id: req.user._id });
	User.findById(req.user._id).then(
		(user) => {
			user.refreshToken.push({ refreshToken });
			user.save((err, user) => {
				if (err) {
					res.statusCode = 500;
					res.send(err);
				} else {
					res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
					res.send({ success: true, token });
				}
			});
		},
		(err) => next(err)
	);
});

router.post("/refreshToken", (req, res, next) => {
	const { signedCookies = {} } = req;
	const { refreshToken } = signedCookies;

	if (refreshToken) {
		try {
			const payload = jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET
			);
			const userId = payload._id;
			User.findOne({ _id: userId }).then(
				(user) => {
					if (user) {
						// Find the refresh token against the user record in database
						const tokenIndex = user.refreshToken.findIndex(
							(item) => item.refreshToken === refreshToken
						);

						if (tokenIndex === -1) {
							res.statusCode = 401;
							res.send("Unauthorized");
						} else {
							const token = getToken({ _id: userId });
							// If the refresh token exists, then create new one and replace it.
							const newRefreshToken = getRefreshToken({ _id: userId });
							user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
							user.save((err, user) => {
								if (err) {
									res.statusCode = 500;
									res.send(err);
								} else {
									res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
									res.send({ success: true, token });
								}
							});
						}
					} else {
						res.statusCode = 401;
						res.send("Unauthorized");
					}
				},
				(err) => next(err)
			);
		} catch (err) {
			res.statusCode = 401;
			res.send("Unauthorized");
		}
	} else {
		res.statusCode = 401;
		res.send("Unauthorized");
	}
});

module.exports = router;
