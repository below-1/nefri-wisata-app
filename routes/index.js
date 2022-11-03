import AppRoutes from './app/index.js'
import AuthRoutes from './auth.js'
import { User, Role } from '../models/user.model.js'
import { Wisata } from '../models/wisata.model.js'

export default async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const items = await Wisata.find()
    reply.view('landing/index', {
      items
    })
  })

  fastify.get('/dev', async (request, reply) => {
    const user = await User.create({
      username: 'adminone',
      password: 'adminone',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: Role.ADMIN
    })
    reply.send(user)
  })

  fastify.register(AuthRoutes, { prefix: '/auth' })
  fastify.register(AppRoutes, { prefix: '/app' })
}