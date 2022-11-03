import Multer from 'fastify-multer'
import { User } from '../models/user.model.js'

const upload = Multer({ dest: 'uploads/' })

export default async (fastify) => {

  fastify.get('/login', {
    handler: async (request, reply) => {
      let errors = {
        username: reply.flash('username.errors'),
        password: reply.flash('password.errors'),
      }
      console.log(errors)
      reply.view('auth/login', {
        errors
      })
    }
  })

  fastify.post('/login', {
    preHandler: upload.none(),
    handler: async (request, reply) => {
      const payload = {...request.body}
      const {
        username,
        password
      } = payload;
      const user = await User.findOne({
        username
      })
      if (!user) {
        request.flash('username.errors', ['username tidak dapat ditemukan'])
        return reply.redirect('/auth/login')
      }
      if (user.password != password) {
        request.flash('password.errors', ['password tidak cocok'])
        return reply.redirect('/auth/login')
      }
      request.session.set('user', user)
      reply.redirect('/app')
    }
  })

  fastify.get('/logout', {
    handler: async (request, reply) => {
      request.session.delete()
      reply.redirect('/')
    }
  })
}