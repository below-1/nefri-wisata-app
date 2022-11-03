import mongoose from 'mongoose';
import { ServerApiVersion } from 'mongodb'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  const mongo_uri = process.env.MONGO_URI
  if (!mongo_uri) {
    throw new Error('mongo_uri is not defined')
  }
  try {
    await mongoose.connect(mongo_uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1
    })
    fastify.decorate('get_mongo_client', mongoose.connection.getClient())
    console.log(`done connecting to mongo`)
  } catch (err) {
    console.log('fail connecting to mongo');
    throw err;
  }
})
