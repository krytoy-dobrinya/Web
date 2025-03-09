import express , {Request, Response} from "express"
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.set("view engine", "ejs")

app.post('/ejs-pages', (req: Request, res: Response) => {
  res.render('layout', {message: "My message!321", title: "My page", content: "index"})
})

app.post('/', (req: Request, res: Response) => {
  console.log(req.body)
  console.log(req.headers)
  res.send('Hello World!123')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
