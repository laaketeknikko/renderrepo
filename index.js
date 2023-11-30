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



app.get('/api/persons', (request, response, next) => {
    console.log("get api/persons")
    phonebookEntry.find({}).then(entries => {
        response.json(entries)
    })
    .catch(error => next(error))
})

app.get("/api/notes/:id", (request, response, next) => {
    phonebookEntry.findById(request.params.id)
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
    .then(result => response.sendStatus(200))
    .catch(error => next(error))
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


app.post("/api/persons", (request, response, next) => {
    const newPerson = {...request.body}
    
    if (!validateAddPerson(newPerson)) {
        response.status(400)
        response.send("Missing name or number, or entry for person already exists.")
    }

    new phonebookEntry(newPerson).save()
    .then(savedEntry => response.json(savedEntry))
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.log("in errrohandler")
    
    console.error(error.message)
  
    if (error.name === 'CastError') {
        console.log("in error.name casterrro")
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    console.log("after errro name csaterror")
    next(error)
}
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
