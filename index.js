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


app.get('/api/persons', (request, response) => {

	// response.json(phonebook)

	console.log('test test')

	Person.find({}).then(persons => {
		response.json(persons)
	})

})

app.get('/api/persons/:id', (request, response, next) => {

	Person.findById(request.params.id).then(person => {
		if (person)
			response.json(person)
		else
			response.status(404).send({'error': 'ID not found'})
	})
	.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {

	Person.findByIdAndRemove(request.params.id)
	    .then(result => {
	      response.status(204).end()
	    })
	    .catch(error => next(error))
})

const generateId = () => {
	return Math.floor(Math.random() * 3000)
}

app.post('/api/persons', (request, response, next) => {

	/* const new_id = generateId()
	const person_exists = phonebook.find ( person => person.id === new_id)
	if (person_exists !== undefined) {
		console.log('An already existing id has been generated')
		return response.status(500).end()
	} */

	const body = request.body

	/* if (!body.name || !body.number) {
		console.log('No name or number in input')
		return response.status(400).json({
			"error": "No name or number in input" 
		})
	} */


	const new_person = new Person({
		name: body.name,
		number: body.number
	})

	new_person.save().then(person => {
		response.json(person)
	})
	.catch(error => next(error))
	
})


app.get('/info', (request, response, next) => {
	Person.find({}).then(persons => {
		const n_people = persons.length

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

  Person.findByIdAndUpdate(request.params.id, person, { context: 'query', runValidators: true, new: true  })
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

	} else if (error.name === 'ValidationError') {
    	
    	return response.status(400).json({ error: error.message })
	
	} else {
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