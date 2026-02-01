import { Pool } from "pg"
import fs from "node:fs"
import 'dotenv/config'

const env = process.env;

const ssl = env.ENV === 'local' ? {
    rejectUnauthorized: false,
    ca: fs.readFileSync('./certs/root.crt').toString(),
    key: fs.readFileSync('./certs/root.key').toString(),
} : null

console.log()

const pool = new Pool({
    user: env.PGUSER,
    password: env.PGPASSWORD,
    host: env.PGHOST,
    port: env.PGPORT,
    database: env.PGDATABASE,
    ssl: ssl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})



export default pool