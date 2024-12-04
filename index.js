import 'dotenv/config'
import tracer from 'dd-trace';
import Logger from './logger.js';

const logger = new Logger();


tracer.init({
  logInjection: true
});

import express from 'express'
const app = express()
const port = process.env.PORT || 3000
app.use(express.json())

let teaData = []
let nextId = 1

// add a new tea
app.post('/teas', (req, res) => {
  const { name, price } = req.body;

  // Create the new tea
  const newTea = { id: nextId++, name, price };
  teaData.push(newTea);
  const response = {
    timestamp: new Date().toISOString(),
    event: "web_request",
    method: req.method, // HTTP method of the request
    url: req.originalUrl, // Original URL being accessed
    clientIp: req.ip, // IP address of the client
    userAgent: req.headers['user-agent'], // User-Agent header
    message: "New tea created", // Human-readable message
  };
  logger.log('info', response);

  // Send the response
  res.status(201).send(newTea);
});


// get all tea
app.get('/teas', (req, res) => {
  const response = {
    timestamp: new Date().toISOString(),
    event: "web_request",
    method: req.method, // HTTP method of the request
    url: req.originalUrl, // Original URL being accessed
    clientIp: req.ip, // IP address of the client
    userAgent: req.headers['user-agent'], // User-Agent header
    message: "Request to teas", // Human-readable message
  };
  logger.log('info', response);
  res.status(200).send(teaData)
})
app.get('/', (req, res) => {
  const response = {
    level: "info",
    timestamp: new Date().toISOString(),
    event: "web_request",
    method: req.method, // HTTP method of the request
    url: req.originalUrl, // Original URL being accessed
    clientIp: req.ip, // IP address of the client
    userAgent: req.headers['user-agent'], // User-Agent header
    message: "Request to home endpoint", // Human-readable message
  };

  res.status(200).send(response);
});


//get a tea with id
app.get('/teas/:id', (req, res) => {
  const tea = teaData.find(t => t.id === parseInt(req.params.id))
  if (!tea) {
    return res.status(404).send('Tea not found')
  }
  res.status(200).send(tea)
})

//update tea

app.put('/teas/:id', (req, res) => {
  const tea = teaData.find(t => t.id === parseInt(req.params.id))

  if (!tea) {
    return res.status(404).send('Tea not found')
  }
  const {name, price} = req.body
  tea.name = name
  tea.price = price
  res.send(200).send(tea)
})

//delete tea

app.delete('/teas/:id', (req, res) => {
  console.log("delete")
  console.log(req.params.id)
  const index = teaData.findIndex(t => t.id === parseInt(req.params.id))
  if (index === -1) {
    return res.status(404).send('tea not found')
  }
  teaData.splice(index, 1)
  res.status(200).send('deleted')
})


app.listen(port, () => {
  console.log(`Server is running at port: ${port}...`)
})