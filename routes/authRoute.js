const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcrypt');
const { createAccessToken } = require('../services/jwtLogic');
const { use } = require('./userRoute');

router.post('/signup', async function (req, res, next) {
	try {
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		const user = new db.User({
			name: req.body.firstName + ' ' + req.body.lastName,
			email: req.body.email,
			password: hashedPassword,
		});
		await user.save();

		if (user) {
			const { password, ...userInfo } = user._doc;
			const accessToken = createAccessToken(userInfo);
			console.log(userInfo);
			res.status(200).json({
				accessToken,
				userInfo,
			});
		}
	} catch (err) {
		if (err.code === 11000) {
			err.message = 'Sorry, that username or email are already taken';
		}
		return next({
			status: 400,
			message: err.message,
		});
	}
});

router.post('/signin', async (req, res, next) => {
	try {
		let user = await db.User.findOne({
			email: req.body.email,
		});
		let isMatch = await bcrypt.compare(
			req.body.password,
			user.password
		);

		if (isMatch) {
			const { password, ...userInfo } = user._doc;
			let accessToken = createAccessToken(userInfo);

			return res.status(200).json({
				userInfo,
				accessToken,
			});
		} else {
			return next({
				status: 400,
				message: 'Invalid Email/Password',
			});
		}
	} catch (err) {
		return next({
			status: 400,
			message: 'Invalid Email/Password',
		});
	}
});

module.exports = router;
