const express = require('express');
const router = express.Router();
const { Comment, User, Task } = require('../models');

router.post('/', async (req, res, next) => {
	try {
		let { comment, author, taskId } = req.body;
		const newComment = new Comment({
			comment,
			author,
		});
		await newComment.save();
		let task = await Task.findById(taskId);
		await task.comments.push(newComment._id);
		await task.save();
		if (newComment) res.status(201).json(newComment);
	} catch (err) {
		return next({
			message: err.message,
		});
	}
});

router.patch('/:commentId', async (req, res, next) => {
	try {
		let updatedComment = await Comment.findByIdAndUpdate(
			req.params.commentId,
			req.body,
			{ new: true, omitUndefined: true }
		);
		if (req.body.updateTaskId) {
			let task = await Task.findById(req.body.updateTaskId);
			await task.update({ $pull: { comments: updatedComment._id } });
			await task.save();
		}

		res.status(200).json(updatedComment);
	} catch (err) {
		return next({
			message: err.message,
		});
	}
});

router.delete('/:commentId', async (req, res, next) => {
	try {
		let deletedComment = Comment.findById(req.params.commentId);
		await deletedComment.remove();
		return res.status(200).json({ message: 'Comment deleted.' });
	} catch (err) {
		return next({
			message: err.message,
		});
	}
});

module.exports = router;
