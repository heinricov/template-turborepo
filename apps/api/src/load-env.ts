import * as dotenv from "dotenv"
import path from "node:path"

dotenv.config()
dotenv.config({ path: path.join(__dirname, "..", ".env") })
