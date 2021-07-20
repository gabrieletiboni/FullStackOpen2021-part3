const express = require('express')
var morgan = require('morgan')
const cors = require('cors')

// Now we can use object 'app' to do all sort of backend things thanks to express module (CommonJS module)
const app = express()

morgan.token('person', (request) => {
	if (request.method === 'POST') {
		return 'Data=>'+JSON.stringify(request.body)
	} else return null
})

app.use(morgan(
		':method :url :status :res[content-length] :response-time ms :person'
	))

app.use(express.json())
// app.use(cors()) // Allow cross-origin resource sharing
app.use(express.static('build'))

let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
	/* const type = request.get('content-type')
	console.log('Get type request:', type) */

	response.json(phonebook)


})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = phonebook.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  phonebook = phonebook.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
	return Math.floor(Math.random() * 3000)
}

app.post('/api/persons', (request, response) => {

	const new_id = generateId()
	const person_exists = phonebook.find ( person => person.id === new_id)

	if (person_exists !== undefined) {
		console.log('An already existing id has been generated')
		return response.status(500).end()
	}

	const body = request.body

	if (!body.name || !body.number) {
		console.log('No name or number in input')
		return response.status(400).json({
			"error": "No name or number in input" 
		})
	}

	if (phonebook.find(person => person.name === body.name) !== undefined)
		return response.status(400).json({
			"error": "Name must be unique"
		})

	const new_person = {
		"id": new_id,
		"name": body.name,
		"number": body.number
	}

	phonebook = phonebook.concat(new_person)

	response.json(new_person)
})


app.get('/info', (request, response) => {
	/* const type = request.get('content-type')
	console.log('Get type request:', type) */

	let text = 'phonebook has info for ' + String(phonebook.length) + ' people'

	const date = new Date();
	text += '<br/><br/>' + date.toString()

	console.log(text)

	response.send(text)
})



/* const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) */
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})