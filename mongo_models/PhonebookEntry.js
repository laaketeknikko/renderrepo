const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error.message)
    })

const numberValidator = (value) => {
    const re = /^[0-9]{2,3}-[0-9]+/

    console.log("in numbervalidator, value is", value)
    console.log("validator reuslt is", value.length, re.exec(value))
    return value.length >= 8 && re.exec(value)
}

const phonebookEntrySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, "Name must be at least 3 characters long."],
        required: [true, "Name is a required field."]
    },
    number: {
        type: String,
        validate: {
            validator: numberValidator,
            message: "The number must be of format xx(x)-xxxxxx. Number must be at least 8 characters long."
        },
        required: [true, "Number is a required field."]
    }
})

phonebookEntrySchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model("phonebookEntry", phonebookEntrySchema)
