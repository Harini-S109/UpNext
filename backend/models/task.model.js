const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: { type:String, required: true },
    description: {type: String, required: true},
    tag: {type:[String], default: []},
    status: {type: String, required: true},
    priority: {type: String, required: true},
    isPinned: {type:Boolean, default:false},
    userId: {type: String, required: true},
    createdOn: {type: Date, default: new Date().getTime()}
})

module.exports = mongoose.model("Task", taskSchema);