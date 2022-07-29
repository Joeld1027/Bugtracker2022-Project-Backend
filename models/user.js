const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Session = new mongoose.Schema({
	refreshToken: {
		type: String,
		default: "",
	},
});

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "",
	},
	role: {
		type: String,
		default: "Demo-Submitter",
	},
	userSince: {
		type: Date,
		default: Date.now,
	},
	assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
	assignedProjects: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Projects",
		},
	],
	refreshToken: {
		type: [Session],
	},
	authStrategy: {
		type: String,
		default: "local",
	},
});

//Remove refreshToken from the response
userSchema.set("toJSON", {
	transform: function (doc, ret, options) {
		delete ret.refreshToken;
		return ret;
	},
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
