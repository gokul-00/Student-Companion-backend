const { Schema, model} = require("mongoose");

const postSchema = Schema({
    title: String,
    message: String,
    tags: [String],
    creator: String,
    voteCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

module.exports = model('PostMessage', postSchema);