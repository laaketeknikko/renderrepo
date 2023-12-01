const mongoose = require("mongoose")

if (process.argv.length < 3) {
    console.log("Usage: node <file> <password> (<name> <number>)")
    process.exit(0)
}


const password = process.argv[2]


const url =
`mongodb+srv://fullstackopen:${password}@render.ukncaak.mongodb.net/phonebook?retryWrites=true&w=majority`


mongoose.set("strictQuery", false)
mongoose.connect(url)

const phonebookEntrySchema = new mongoose.Schema({
    name: String,
    number: String
})


const phonebookEntry = mongoose.model("phonebookEntry", phonebookEntrySchema)


// Insertion
// Only allows name and number
if (process.argv.length === 5) {
    const newEntry = new phonebookEntry({
        name: process.argv[3],
        number: process.argv[4]
    })
    newEntry.save()
        .then(() => {
            console.log(`Added ${newEntry.name} number ${newEntry.number} to phonebook`)
            mongoose.connection.close()
        })
}

// Listing
else {
    console.log("phonebook:")
    phonebookEntry.find({})
        .then(result => {
            result.forEach(entry => {
                console.log(`${entry.name} ${entry.number}`)
            })
            mongoose.connection.close()
        })
}

