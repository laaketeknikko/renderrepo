require("dotenv").config()

const express = require("express")
const app = express()
app.use(express.static("front"))
app.use(express.json())

const cors = require("cors")
app.use(cors())

const morgan = require("morgan")

app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"), "-",
        tokens["response-time"](req, res), "ms",
        Object.keys(req.body).length !== 0 ? `- ${JSON.stringify(req.body)}` : ""
    ].join(" ")
}))

const phonebookEntry = require("./mongo_models/PhonebookEntry")



app.get("/api/persons", (request, response, next) => {
    console.log("get api/persons")
    phonebookEntry.find({}).then(entries => {
        response.json(entries)
    })
        .catch(error => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
    console.log("in persons:id with", request.params.id)
    phonebookEntry.findOne({ _id: request.params.id })
    //phonebookEntry.findById(request.params.id)
        .then(entry => {
            response.json(entry)
        })
        .catch(error => next(error))
})

app.get("/info", (request, response, next) => {
    phonebookEntry.find({}).then(entries => {
        let responseString = `Phonebook has info for ${entries.length} people.<br />`
        responseString += `${Date(Date.now()).toString()}`
        response.send(responseString)
    })
        .catch(error => next(error))
})


app.delete("/api/persons/:id", (request, response, next) => {
    phonebookEntry.findById(request.params.id)
        .then(entry => entry.deleteOne())
        .then(() => response.sendStatus(200))
        .catch(error => next(error))
})


const postPerson = (request, response, next) => {
    console.log("in post person")
    const newPerson = { ...request.body }


    phonebookEntry.find({ name: newPerson.name })
        .then(result => {

            // Person doesn't exist in the database
            if (result.length === 0) {
                new phonebookEntry(newPerson).save()
                    .then(savedEntry => response.json(savedEntry))
                    .catch(error => next(error))
            }
            else {
                phonebookEntry.updateOne(
                    { name: result[0].name },
                    { number: newPerson.number },
                    { runValidators: true })
                    .then(updateResult => {
                        console.log("updated something", updateResult)
                    })
                    .catch(error => next(error))
                console.log("result", result[0].name, newPerson.number)
                response.status(200).send("success")
            }
        })
        .catch(error => next(error))
}
app.post("/api/persons", postPerson)

// put() handles case when name and number are different for existing id,
// post() handles the case when name is the same as existing.
// I am confused about what is supposed to happen with different
// PUT and POST combinations of existing and non-existing names and ids.
// The requirements are very vague.
app.put("/api/persons/:id", (request, response, next) => {

    phonebookEntry.findById(request.params.id)
        .then(result => {
            console.log("put findbyid result", result)
            console.log("request.body.name", request.body.name)
            if (result && result.name == request.body.name) {
                return postPerson(request, response, next)
            }
            // Id is same, name is different
            else {
                console.log("updateone in put")
                phonebookEntry.updateOne(
                    { _id: request.params.id },
                    {
                        name: request.body.name,
                        number: request.body.number
                    },
                    { runValidators: true })
                    .then(updateResult => {
                        console.log("put updated")
                        response.json(updateResult)
                    })
                    .catch(error => next(error))
            }
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" })
    }
    else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
