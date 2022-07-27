const express = require('express');
const router = express.Router();
const { Project, User, Task } = require('../models');

// find all projects
router.get('/', async (req, res, next) => {
	try {
		const foundProjects = await Project.find()
			.populate('projectTasks')
			.populate('assignedDevs', '-__v -password')
			.exec();
		if (foundProjects) {
			return res.status(200).json(foundProjects);
		}
		next();
	} catch (err) {
		return next({
			message: err.message,
		});
	}
});

//create new project
router.post('/', async (req, res, next) => {
	try {
		const newProject = new Project({
			name: req.body.name,
			description: req.body.description,
			priority: req.body.priority,
			deadline: req.body.deadline,
			createdBy: req.body.createdBy,
		});

		if (req.body.addDevelopers) {
			const devId = req.body.addDevelopers;
			for (i = 0; i < devId.length; i++) {
				let user = await User.findById(devId[i]);
				await newProject.assignedDevs.push(user._id);
				await user.assignedProjects.push(newProject._id);
				await user.save();
				await newProject.save();
			}

			if (req.body.addTasks) {
				const taskId = req.body.addTasks;
				for (i = 0; i < taskId.length; i++) {
					const task = await Task.findById(taskId[i]);
					await newProject.projectTasks.push(task._id);
					await task.assignedProject.push(newProject._id);
					task.set({ status: 'Pending' });
					await task.save();
					await newProject.save();
				}
			}
		}
		await newProject.save();

		if (newProject) {
			return res.status(201).json(newProject);
		}
		next();
	} catch (err) {
		res.status(500).json({
			error: err,
		});
	}
});

// read - update - delete individual projects
router.get('/:projectId', async (req, res, next) => {
	try {
		const foundProject = await Project.findById(req.params.projectId);
		if (foundProject) {
			let foundWithUsers = await foundProject
				.populate('asignedDevs', ['firstName', 'lastName', 'role'])
				.populate('projectTickets')
				.execPopulate();

			return res.status(200).json(foundProject);
		}
		next();
	} catch (err) {
		res.status(500).json({
			error: err,
		});
	}
});

router.patch('/:projectId', async (req, res, next) => {
	console.log(req.body);
	try {
		const updatedProject = await Project.findByIdAndUpdate(
			req.params.projectId,
			req.body,
			{ new: true, omitUndefined: true }
		);
		if (req.body.tasks) {
			const tasksToRemove = req.body.tasks;
			for (i = 0; i < tasksToRemove.length; i++) {
				const task = await Task.findById(tasksToRemove[i]);
				await updatedProject.update({
					$pull: { projectTasks: task._id },
				});
				await task.update({
					$pull: { assignedProject: updatedProject._id },
				});
				await task.update({ $set: { status: 'New' } });
				await task.save();
			}
		}
		if (req.body.developers) {
			const devs = req.body.developers;
			for (i = 0; i < devs.length; i++) {
				let dev = await User.findById(devs[i]);
				await updatedProject.update({
					$pull: { assignedDevs: dev._id },
				});
				await dev.update({
					$pull: { assignedProjects: updatedProject._id },
				});
				await dev.save();
			}
		}
		if (req.body.addDevelopers) {
			const addDevs = req.body.addDevelopers;
			for (i = 0; i < addDevs.length; i++) {
				let user = await User.findById(addDevs[i]);
				await updatedProject.assignedDevs.push(user._id);
				await user.assignedProjects.push(updatedProject._id);
				await user.save();
			}
		}
		if (req.body.addTasks) {
			const addTasks = req.body.addTasks;
			for (i = 0; i < addTasks.length; i++) {
				const task = await Task.findById(addTasks[i]);
				await updatedProject.projectTasks.push(task._id);
				await task.assignedProject.push(updatedProject._id);
				task.set({ status: 'Pending' });
				await task.save();
			}
		}
		await updatedProject.save();
		updatedProject ? res.status(201).json(updatedProject) : next();
	} catch (err) {
		res.status(500).json({
			error: err,
		});
	}
});

router.delete('/:projectId', async (req, res, next) => {
	try {
		const deletedProject = await Project.findById(
			req.params.projectId
		);

		if (deletedProject.projectTickets) {
			const tasks = deletedProject.projectTasks;
			for (i = 0; i < tasks.length; i++) {
				const task = await Task.findById(tasks[i]);
				if (task) await task.remove();
			}
		}

		if (deletedProject.assignedDevs) {
			const users = deletedProject.assignedDevs;
			for (i = 0; i < users.length; i++) {
				const user = await User.findById(users[i]);
				await user.update({
					$pull: { assignedProjects: deletedProject._id },
				});
				await user.save();
			}
		}

		await deletedProject.remove();
		return res.status(200).json(deletedProject);
	} catch (err) {
		res.status(500).json({
			error: err,
		});
	}
});

module.exports = router;
