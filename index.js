require("dotenv").config()

const express = require("express")
const app = express()
app.use(express.json())

const cors = require("cors")
app.use(cors())

const phonebookEntry = require("./mongo_models/PhonebookEntry")

app.use(express.static("front"))

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



app.get('/api/persons', (request, response) => {
    console.log("get api/persons")
    phonebookEntry.find({}).then(entries => {
        response.json(entries)
    })
})

app.get("/api/notes/:id", (request, response) => {
    phonebookEntry.findById(request.params.id)
    .then(entry => {
        response.json(entry)
    })
})

app.get("/info", (request, response) => {
    phonebookEntry.find({}).then(entries => {
        let responseString = `Phonebook has info for ${entries.length} people.<br />`
        responseString += `${Date(Date.now()).toString()}`
        response.send(responseString)
    })
})


app.delete("/api/persons/:id", (request, response) => {
    phonebookEntry.findById(request.params.id)
    .then(entry => entry.deleteOne())
    .then(result => response.sendStatus(200))
})


const validateAddPerson = (personData) => {
    if (!personData.name || !personData.number) {
        return false
    }

    /*if (persons.find(person => person.name.toLowerCase() === personData.name.toLowerCase())) {
        return false
    }*/

    return true
}


app.post("/api/persons", (request, response) => {
    const newPerson = {...request.body}
    
    if (!validateAddPerson(newPerson)) {
        response.status(400)
        response.send("Missing name or number, or entry for person already exists.")
    }

    new phonebookEntry(newPerson).save()
    .then(savedEntry => response.json(savedEntry))
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
