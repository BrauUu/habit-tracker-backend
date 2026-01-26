import { Client } from "pg"
import fs from "node:fs"
import 'dotenv/config'

const env = process.env;

const client = new Client({
    user: env.PGUSER,
    password: env.PGPASSWORD,
    host: env.PGHOST,
    port: env.PGPORT,
    database: env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync('./certs/root.crt').toString(),
        key: fs.readFileSync('./certs/root.key').toString(),
    
    },
})

await client.connect()

export default client