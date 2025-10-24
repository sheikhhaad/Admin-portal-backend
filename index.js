import express from 'express'

let app = express()
let PORT = 3000
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.listen(PORT)