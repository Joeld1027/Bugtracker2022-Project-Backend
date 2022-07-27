const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		default: 'Demo-Submitter',
	},
	userSince: {
		type: Date,
		default: Date.now,
	},
	assignedTasks: [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
	],
	assignedProjects: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Projects',
		},
	],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
