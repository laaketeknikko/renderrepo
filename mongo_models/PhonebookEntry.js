const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

mongoose.connect(process.env.MONGODB_URI)
.then(result => {
    console.log("Connected to MongoDB")
})
.catch((error) => {
    console.log("Error connecting to MongoDB:", error.message)
})


const phonebookEntrySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, "Name must be at least 3 characters long."],
        required: [true, "Name is a required field."]
    },
    number: {
        type: String,
        required: [true, "Number is a required field."]
    }
})

phonebookEntrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})


module.exports = mongoose.model("phonebookEntry", phonebookEntrySchema)
