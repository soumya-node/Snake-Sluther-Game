import { createClient } from "redis";

const client = await createClient().on("error", (error)=>{console.log('Redis error', error)}).connect();

export default client;