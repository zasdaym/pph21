import { Hono } from "hono"
import { handler } from "./handler"

const app = new Hono()
app.all("/", handler)

export default app
