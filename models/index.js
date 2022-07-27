const mongoose = require("mongoose");
mongoose.set("debug", true);
mongoose.Promise = Promise;

mongoose.connect(
	"mongodb://localhost/Project-Manager-App",
	// 'mongodb+srv://Aruki:' + process.env.MONGO_PASSWORD + '@cluster0.qfpuv.mongodb.net/BugTracker?retryWrites=true&w=majority',

	{
		keepAlive: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	},
	() => console.log("DB connected")
);

module.exports.User = require("./user");
module.exports.Project = require("./project");
module.exports.Task = require("./ticket");
module.exports.Comment = require("./comment");
