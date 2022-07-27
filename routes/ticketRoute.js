const express = require('express');
const router = express.Router();
const { Task, Project, User } = require('../models');

// get all the tasks
router.get('/', async (req, res, next) => {
	try {
		const foundTasks = await Task.find()
			.populate('assignedProject')
			.populate('comments')
			.populate('assignedDevs', '-__v -password')
			.exec();

		if (foundTasks) {
			return res.status(200).json(foundTasks);
		}
		next();
	} catch (err) {
		return next({ message: err.message });
	}
});

router.post('/', async (req, res, next) => {
	try {
		const newTask = new Task({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			priority: req.body.priority,
			createdBy: req.body.createdBy,
		});
		if (req.body.projectId) {
			await newTask.assignedProject.push(req.body.projectId);
			let projectToAdd = await Project.findById(req.body.projectId);
			if (projectToAdd) {
				await projectToAdd.projectTasks.push(newTask._id);
				await projectToAdd.save();
				newTask.status = 'Pending';
			}
		}
		await newTask.save();
		if (newTask) {
			return res.status(200).json(newTask);
		}
		return next();
	} catch (err) {
		return next(err);
	}
});

router.get('/:taskId', async (req, res, next) => {
	try {
		const foundTask = await Task.findById(req.params.taskId)
			.populate('assignedProject')
			.execPopulate();
		if (foundTask) {
			return res.status(200).json(foundTask);
		}
		return res.status(404).json({
			message: 'No task found',
		});
	} catch (err) {
		return next(err);
	}
});

router.patch('/:taskId', async (req, res, next) => {
	try {
		const updatedTask = await Task.findOneAndUpdate(
			{ _id: req.params.taskId },
			req.body,
			{ new: true, omitUndefined: true }
		);
		if (req.body.projectId) {
			const project = await Project.findById(req.body.projectId);
			if (project) {
				await project.projectTasks.push(updatedTask._id);
				await updatedTask.assignedProject.push(req.body.projectId);
				updatedTask.status = 'Pending';
				await project.save();
			}
		}

		if (req.body.assignUserToTask) {
			const user = await User.findById(req.body.assignUserToTask);
			await updatedTask.assignedDevs.push(user._id);
			await user.assignedTasks.push(updatedTask._id);
			await user.save();
			updatedTask.status = 'In Progress';
			console.log(user);
		}
		if (updatedTask) {
			await updatedTask.save();
			return res.status(200).json(updatedTask);
		}
		return res.status(404).json({
			message: 'Task not found',
		});
	} catch (err) {
		return next(err);
	}
});

router.delete('/:taskId', async (req, res, next) => {
	try {
		const deletedTask = await Task.findById(req.params.taskId);
		if (deletedTask) {
			const user = await User.findById(deletedTask.assignedDevs[0]);
			if (user)
				await user.update({
					$pull: { assignedTasks: deletedTask._id },
				});
			await deletedTask.remove();
		}
		return res.status(200).json(deletedTask);
	} catch (err) {
		return next({
			message: err.message,
			ok: false,
		});
	}
});

module.exports = router;
