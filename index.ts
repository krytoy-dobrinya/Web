import express , {Request, Response} from "express"
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req: Request, res: Response) => {
  console.log(req.body)
  console.log(req.headers)
  res.send('Hello World!123')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
