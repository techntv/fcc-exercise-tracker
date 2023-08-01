const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const generateId = require('./utils')
const users = []
require('dotenv').config()

// parse data json in body of request
app.use(bodyParser.json())

// parse data from form in body of request
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
    return res.json(users)
})

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  let isExistUser = users.find(user => user.username === username)

  if(isExistUser) return res.status(400).json({ error: 'Username already taken' })

  let newUser = { username, _id: generateId(24) }
  users.push(newUser)
  return res.json(newUser)
});

app.post('/api/users/:_id/exercises', (req, res) => {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    let user = users.find(user => user._id === _id)
    if(!user) return res.status(400).json({ error: 'User not found' })
    
    if(!user.log) user.log = []
    let newExercise = { description, duration, date: date ? new Date(date).toDateString() : new Date().toDateString() }
    user.log.push(newExercise)
    return res.json({ _id: user._id, username: user.username, date: newExercise.date, duration: newExercise.duration, description: newExercise.description })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  let user = users.find(user => user._id === _id)
  if(!user) return res.status(400).json({ error: 'User not found' })

  let logs = user.log
  if(from) logs = logs.filter(log => new Date(log.date) >= new Date(from))
  if(to) logs = logs.filter(log => new Date(log.date) <= new Date(to))
  if(limit) logs = logs.slice(0, limit)

  return res.json({ _id: user._id, username: user.username, count: logs.length, log: logs })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
