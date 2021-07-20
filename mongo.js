const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('Please provide the password as an argument: node mongo.js <password>')
	process.exit(1)
}

const password = process.argv[2]

const url =
	`mongodb+srv://gabriele:${password}@cluster0.flxi9.mongodb.net/phonebook?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)


// Application main code

if (process.argv.length == 5) {
	const name = process.argv[3]
	const number = process.argv[4]

	const person = new Person({
		name: name,
		number: number
	})


	person.save().then(result => {
		console.log('Added '+name+' '+number+' to phonebook')

		mongoose.connection.close()
	})


} else {


	Person.find({}).then(result => {
		console.log(result)

		mongoose.connection.close()
	})


}






/* const person = new Person({
	content: 'HTML is Easy',
	date: new Date(),
	important: true,
})
 */
/* note.save().then(result => {
	console.log('note saved!')
	mongoose.connection.close()
}) */