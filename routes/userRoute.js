const express = require("express");
const router = express.Router();
const User = require("../models/user");

const { verifyUser } = require("../authenticate");

//Get all users
router.get("/", async (req, res, next) => {
	try {
		const allUsers = await User.find({});
		if (!allUsers) return;
		res.status(200).json(allUsers);

		next();
	} catch (err) {
		return next({
			message: err.message,
		});
	}
});

router.get("/:userId", async (req, res, next) => {
	try {
		const foundUser = await User.findOne({
			_id: req.params.userId,
		});
		if (foundUser) {
			return res.status(200).json(foundUser);
		}
		next();
	} catch (error) {
		res.status(500).json({
			Error: error,
		});
	}
});

//Edit user
router.put("/:userId", async (req, res, next) => {
	try {
		const editedUser = await User.findOneAndUpdate(
			{ _id: req.params.userId },
			{
				$set: {
					name: req.body.name,
					username: req.body.username,
					role: req.body.role,
				},
			},
			{
				new: true,
				omitUndefined: true,
			}
		);
		await editedUser.save();
		if (editedUser) {
			return res.status(200).json({
				message: "User updated",
				editedUser,
			});
		}
		next({ message: "User not found" });
	} catch (err) {
		next({
			message: err.message,
		});
	}
});

//Delete user
router.delete("/:userId", async (req, res, next) => {
	try {
		const deletedUser = await User.findOneAndRemove({
			_id: req.params.userId,
		});
		if (deletedUser) {
			return res.status(200).json({ message: "User deleted" });
		}
	} catch (err) {
		return next({
			message: err.message,
		});
	}
});

module.exports = router;
