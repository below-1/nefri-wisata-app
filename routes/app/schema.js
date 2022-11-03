import Multer from 'fastify-multer'
import { Kritsch } from '../../models/kritsch.model.js'

const upload = Multer({ dest: 'uploads/' })

export default async (fastify) => {

  fastify.get('/', {
    handler: async (request, reply) => {
      const schemas = await Kritsch.find()
      reply.xview('app/schema/list', {
        items: schemas
      })
    }
  })

  fastify.get('/create', {
    handler: async (request, reply) => {
      reply.xview('app/schema/create')
    }
  })

  fastify.post('/create', {
    handler: async (request, reply) => {
      const lastSchema = await Kritsch.findOne().sort({ version: -1 })
      let newSchema = {}
      if (lastSchema) {
        newSchema.version = lastSchema.version + 1
      } else {
        newSchema.version = 1
      }
      let p = new Kritsch(newSchema)
      await p.save()
      reply.redirect('/app/schema')
    }
  })

  fastify.get('/:id/detail', {
    handler: async (request, reply) => {
      const schema = await Kritsch.findById(request.params.id)
      if (!schema) {
        throw new Error('NOT_FOUND')
      }
      return reply.xview('app/schema/detail', {
        schema
      })
    }
  })

  fastify.get('/:id/add-kriteria', {
    handler: async (request, reply) => {
      const schema = await Kritsch.findById(request.params.id)
      if (!schema) {
        throw new Error('NOT_FOUND')
      }
      return reply.xview('app/schema/add-kriteria', {
        schema
      })
    }
  })

  fastify.post('/:id/add-kriteria', {
    preHandler: upload.none(),
    handler: async (request, reply) => {
      const schema = await Kritsch.findById(request.params.id)
      const payload = {
        ...request.body,
        benefit: request.body.benefit ? true : false
      }
      schema.krits.push(payload)
      await schema.save()
      return reply.redirect(`/app/schema/${schema._id}/detail`)
    }
  })

  fastify.get('/:id/delete', {
    handler: async (request, reply) => {
      const schema = await Kritsch.findById(request.params.id)
      if (!schema) {
        request.session.error = {
          status: 404,
          message: 'Tidak dapat menemukan data wisata'
        }
        reply.redirect('/app/not-found')
        return
      }
      await schema.delete()
      reply.redirect('/app/schema')
    }
  })

}