//Declaring and requiring express to use in this file
const express = require('express')
//We declare and run express in a separate variable to make it easier to use and understand
const app = express()
//We use this packet to connect to the Database
const MongoClient = require('mongodb').MongoClient
//We declare the port to be used by the application
const PORT = 2121
require('dotenv').config()

//We declare this variable to hold the connection to the Database. P.S. We can use one let and declare several variables if they are separated by a comma. 
let db,
//This is the string we use to connect to MongoAtlas
    dbConnectionStr = process.env.DB_STRING,
    //This is the name for the database
    dbName = 'todo'


//This Mongo method takes in the connection string, and a object of unifiedTopology. This special thing avoids errors. Its a promise that returns with the connection to the database. 
MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})

    .then(client => {
        console.log(`Hey, connected to ${dbName} database`)
        db = client.db(dbName)
    })

    .catch(err => {
        console.log(err)
    })

//We set the application to use ejs files
app.set('view engine', 'ejs')
//Here express allows the server to 'serve' whatever it needs from the public folder
app.use(express.static('public'))
//These two lines enable us to look at our application, teh request being sent and pull information out of them. When we submit  a form the data in that form is sent as part of that request. These lines allow us to pull the information out of that request. 
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// When the server receives a get request it runs the callback
app.get('/', async (req,res)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    res.render('index.ejs', {zebra: todoItems, left: itemsLeft})

})

app.post('/createTodo', (req, res) => {
    //we use this method to insert the data we get from the POST method in the form into our collection. It creates a document that requires the input from our form. 
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false})
    //After the todo is added to our collection, we print to the console to verify it's been added and redirect the client to the main route.
    .then(result => {
        console.log('Todo has been added!')
        res.redirect('/')
    })
})


app.put('/markComplete', (req, res) => {
    //Goes into our collection, and updates the text that matches our todo selection, and set completed status to true
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{
        $set: {
            completed: true
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})


app.put('/undo', (req, res) => {
    //Goes into our collection, and updates the text that matches our todo selection, and set completed status to true
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{
        $set: {
            completed: false
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})


app.delete('/deleteTodo', (req, res)=>{
    //Goes into our collection, and selects the element next to the clicked delete.
    db.collection('todos').deleteOne({todo:req.body.rainbowUnicorn})
    .then(result =>{
        console.log('Deleted Todo')
        res.json('Deleted It')
    })
    .catch( err => console.log(err))
})



app.listen(process.env.PORT || PORT, () => {
    console.log('Server is Running, you better catch it!')
})