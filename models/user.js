const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "",
	},
	role: {
		type: String,
		default: "Demo-Developer",
	},
	assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
	assignedProjects: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Projects",
		},
	],

	authStrategy: {
		type: String,
		default: "local",
	},
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
