const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
	name: String,
	description: String,
	createdBy: String,
	assignedDevs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	createdDate: {
		type: Date,
		default: Date.now,
	},
	category: String,
	priority: String,
	status: {
		type: String,
		default: 'New',
	},
	assignedProject: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Projects',
		},
	],
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
	],
	history: {
		updatedBy: String,
		updateInfo: String,
	},
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
