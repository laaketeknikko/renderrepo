const express = require("express")
const app = express()
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

let persons = [
    {
        "id": Math.random(),
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": Math.random(),
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": Math.random(),
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": Math.random(),
        "name": "Mary Poppendick",
        "number": "39-23-6423122"
    }
]



app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
    const person = persons.find(person => person.id == request.params.id)
    if (!person) {
        response.sendStatus(404)
    }
    else {
        response.json(person)
    }
})

app.get("/info", (request, response) => {
    let responseString = `Phonebook has info for ${persons.length} people.<br />`
    responseString += `${Date(Date.now()).toString()}`
    response.send(responseString)
})



app.delete("/api/persons/:id", (request, response) => {
    persons = persons.filter(person => person.id != request.params.id)
    response.sendStatus(200)
})


const validateAddPerson = (personData) => {
    if (!personData.name || !personData.number) {
        return false
    }

    if (persons.find(person => person.name.toLowerCase() === personData.name.toLowerCase())) {
        return false
    }

    return true
}

app.post("/api/persons", (request, response) => {
    const newPerson = {...request.body, id: Math.random()}
    
    if (!validateAddPerson(newPerson)) {
        response.status(400)
        response.send("Missing name or number, or entry for person already exists.")
    }
    else {
        persons.push(newPerson)
        response.sendStatus(200)
    }    
})



const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
