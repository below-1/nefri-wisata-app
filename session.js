import fp from 'fastify-plugin'
import Session from 'fastify-session'
// import MongoSessionStore from 'connect-mongodb-session'

export default fp(async (fastify) => {
  fastify.register(Session, {
    secret: 'f07e4425345cd6271a52c2d544c77db0',
    cookie: {
      secure: false
    }
  })
})
