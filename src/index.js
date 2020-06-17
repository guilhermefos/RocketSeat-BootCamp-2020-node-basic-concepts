const express = require('express')
const { uuid, isUuid } = require('uuidv4')

const app = express()

app.use(express.json())

let projects = []

const logMiddleware = (request, response, next) => {
  const { method, url } = request
  const label = `[${method.toUpperCase()}] ${url}`

  console.time(label)
  next()
  console.timeEnd(label)
}

const validateMiddleware = (request, response, next) => {
  const { id } = request.params

  return isUuid(id)
    ? response.status(400).json({ error:  'Invalid project ID.' })
    : next()
}

app.use(logMiddleware)
app.use('/projects/:id', validateMiddleware)

app.get('/projects', (request, response) => {
  const { title } = request.query

  const result = title
    ? projects.filter(project => project.title == title)
    : [ ...projects ]

  return response.json(result)
})

app.post('/projects', (request, response) => {
  const { title, owner } = request.body

  projects = [...projects, { id: uuid(), title, owner }]

  return response.json(projects)
})

app.put('/projects/:id', (request, response) => {
  const { id } = request.params
  const { title, owner } = request.body

  const index = projects.findIndex(project => project.id == id)

  if (index < 0)
    return response.status(400).json({ error: 'Project not found'})

  const project = { id, title, owner }
  projects[index] = project

  return response.json(project)
})

app.delete('/projects/:id', (request, response) => {
  const { id } = request.params

  const index = projects.findIndex(project => project.id == id)

  if (index < 0)
    return response.status(400).json({ error: 'Project not found'})
  
  projects.splice(index, 1)

  return response.status(204).json() 
})

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333')
})
