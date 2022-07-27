const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	comment: String,
	author: {
		name: String,
		id: String,
	},
	createdDate: {
		type: Date,
		default: new Date().toLocaleString(),
	},
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
