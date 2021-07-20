require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

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

	// response.json(phonebook)

	console.log('test test')

	Person.find({}).then(persons => {
		response.json(persons)
	})

})

app.get('/api/persons/:id', (request, response, next) => {
  /* const id = Number(request.params.id)
  const person = phonebook.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  } */

	Person.findById(request.params.id).then(person => {
		if (person)
			response.json(person)
		else
			response.status(404).send({'error': 'ID not found'})
	})
	.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  /* const id = Number(request.params.id)
  phonebook = phonebook.filter(person => person.id !== id)

  response.status(204).end() */

	Person.findByIdAndRemove(request.params.id)
	    .then(result => {
	      response.status(204).end()
	    })
	    .catch(error => next(error))
})

const generateId = () => {
	return Math.floor(Math.random() * 3000)
}

app.post('/api/persons', (request, response) => {

	/* const new_id = generateId()
	const person_exists = phonebook.find ( person => person.id === new_id)
	if (person_exists !== undefined) {
		console.log('An already existing id has been generated')
		return response.status(500).end()
	} */

	const body = request.body

	if (!body.name || !body.number) {
		console.log('No name or number in input')
		return response.status(400).json({
			"error": "No name or number in input" 
		})
	}

	Person.find({name: body.name}).then(person => {
		if (person.length) {
			// Person name already exists
			response.status(400).send({error: 'Name must be unique'})

		} else {
			const new_person = new Person({
				name: body.name,
				number: body.number
			})

			new_person.save().then(person => {
				response.json(person)
			})
		}
	})
	.catch(error => next(error))

	/* if (phonebook.find(person => person.name === body.name) !== undefined)
		return response.status(400).json({
			"error": "Name must be unique"
		}) */

	/* const new_person = {
		"id": new_id,
		"name": body.name,
		"number": body.number
	}
	phonebook = phonebook.concat(new_person)
	response.json(new_person) */

	
})


app.get('/info', (request, response, next) => {
	/* const type = request.get('content-type')
	console.log('Get type request:', type) */

	Person.find({}).then(persons => {

		const n_people = persons.length

		// let text = 'phonebook has info for ' + String(phonebook.length) + ' people'
		let text = 'phonebook has info for ' + String(n_people) + ' people'
		const date = new Date();
		text += '<br/><br/>' + date.toString()

		console.log(text)

		response.send(text)

	})
	.catch(error => next(error))

	
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}  else {
		response.status(400).send({error: 'Unknown error'})
	}

	next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)



// const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})