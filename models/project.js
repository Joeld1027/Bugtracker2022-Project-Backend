const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
	name: String,
	description: String,
	assignedDevs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	completed: {
		type: Boolean,
		default: false,
	},
	priority: String,
	createdBy: String,
	deadline: {
		type: Date,
	},
	created: {
		type: Date,
		default: Date.now,
	},
	projectTasks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Task',
		},
	],
});

const Projects = mongoose.model('Projects', projectSchema);

module.exports = Projects;
