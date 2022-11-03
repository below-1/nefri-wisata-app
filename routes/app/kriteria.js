import { Kriteria, KriteriaValue } from '../../models/kritsch.model.js'
import { format_weight, format_number_option } from '../../serv/kriteria.js'
import Multer from 'fastify-multer'

const upload = Multer({ dest: 'uploads/' })

export default async (fastify) => {

  fastify.get('/', {
    handler: async (request, reply) => {
      const items = await Kriteria.find({})
      return reply.xview('app/kriteria/list', {
        items
      })
    }
  })

  fastify.get('/create', {
    handler: async (request, reply) => {
      return reply.xview('app/kriteria/create')
    }
  })

  fastify.post('/create', {
    preHandler: upload.none(),
    handler: async (request, reply) => {
      let payload = {
        ...request.body,
        benefit: request.body.benefit ? true : false
      }
      if (payload.type == 'MULTIPLE') {
        payload.type = 'OPTIONS'
        payload.multiple = true
      } 
      let kriteria = new Kriteria(payload)
      await kriteria.save()
      return reply.redirect('/app/kriteria')
    }
  })

  fastify.get('/:id/detail', {
    handler: async (request, reply) => {
      const kriteria = await Kriteria.findById(request.params.id)
      // console.lo
      // throw new Error('kriteria')
      if (!kriteria) {
        request.session.error = {
          status: 404,
          message: 'Tidak dapat menemukan data kriteria'
        }
        reply.redirect('/app/not-found')
        return
      }
      reply.xview('app/kriteria/detail', {
        kriteria,
        format_weight,
        format_number_option
      })
    }
  })

  fastify.post('/update', {
    preHandler: upload.none(),
    handler: async (request, reply) => {
      const body = request.body;
      const kriteria = await Kriteria.findById(request.query.kriteria)
      if (!kriteria) {
        request.session.error = {
          status: 404,
          message: 'Tidak dapat menemukan data kriteria'
        }
        reply.redirect('/app/not-found')
        return
      }
      kriteria.nama = body.nama
      kriteria.weight = body.weight
      kriteria.benefit =body.tcrit == 'BENEFIT'
      kriteria.multiple = body.multiple == 'MULTIPLE'
      await kriteria.save()
      reply.redirect(`/app/kriteria/${kriteria._id}/detail`)
    }
  })

  fastify.get('/:id/delete',{
    schema: {
      params: {
        type: 'object',
        props: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
    handler: async (request, reply) => {
      const id = request.params.id
      const kriteria = await Kriteria.findById(id)
      if (!kriteria) {
        request.flash('error', [
          `Gagal menemukan data kriteria#${id}`,
          '404'
        ])
        reply.redirect('/app/not-found')
        return
      }
      await kriteria.delete()
      await KriteriaValue.deleteMany({
        kriteria: kriteria._id
      })
      reply.redirect('/app/kriteria')
    }
  })

}
