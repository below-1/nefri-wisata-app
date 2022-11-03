import { Kriteria } from '../../models/kritsch.model.js'
import Multer from 'fastify-multer'
import mongoose from 'mongoose';

const upload = Multer({ dest: 'uploads/' })

export default async (fastify) => {

  fastify.get('/create', {
    schema: {
      querystring: {
        type: 'object',
        props: {
          kriteria: { type: 'string' }
        },
        required: ['kriteria']
      }
    },
    handler: async (request, reply) => {
      const kriteria = await Kriteria.findById(request.query.kriteria)
      console.log(kriteria)
      if (!kriteria) {
        request.flash('error', [
          'Tidak dapat menemukan data kriteria',
          '404'
        ])
        reply.redirect('/app/not-found')
        return
      }
      let view_name;
      if (kriteria.type == 'NUMBER') {
        view_name = 'app/option/number/create'
      } else if (kriteria.type == 'OPTIONS') {
        view_name = 'app/option/text/create'
      } else if (kriteria.type == 'MULTIPLE') {
        view_name = 'app/option/multiple/create'
      }
      reply.view(view_name, {
        kriteria
      })
    }
  })

  fastify.post('/create', {
    schema: {
      querystring: {
        type: 'object',
        props: {
          kriteria: { type: 'string' }
        },
        required: ['kriteria']
      }
    },
    preHandler: upload.none(),
    handler: async (request, reply) => {
      let kriteria = await Kriteria.findById(request.query.kriteria)
      if (!kriteria) {
        request.flash('error', [
          'Tidak dapat menemukan data kriteria',
          '404'
        ])
        reply.redirect('/app/not-found')
        return
      }

      kriteria.addOption(request.body)
      await kriteria.save()
      reply.redirect(`/app/kriteria/${kriteria._id}/detail`)
    }
  })

  fastify.get('/delete', {
    handler: async (request, reply) => {
      const kriteriaId = request.query.kriteria
      const opt = request.query.option
      const kriteria = await Kriteria.findById(kriteriaId)
      const _id = new mongoose.Types.ObjectId(opt)
      let pull_option = {}
      if (kriteria.type == 'NUMBER') {
        pull_option.number_options = { _id }
      } else if (kriteria.type == 'OPTIONS') {
        pull_option.text_options = { _id }
      } else if (kriteria.type == 'MULTIPLE') {
        pull_option.multiple_options = { _id }
      } else {
        throw new Error('unknown_kriteria_type')
      }
      const updateOneResult = await Kriteria.updateOne({ _id: kriteria }, {
        $pull: pull_option
      })
      return reply.redirect(`/app/kriteria/${kriteriaId}/detail`)
    }
  })
}