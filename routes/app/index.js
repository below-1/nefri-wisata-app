import { 
  requestContext as rc 
} from 'fastify-request-context';

import { Wisata } from '../../models/wisata.model.js'
import WisataRoutes from './wisata.js'
import RekomendasiRoutes from './rekomendasi.js'
// import SchemaRoutes from './schema.js'
import KriteriaRoutes from './kriteria.js'
import OptionRoutes from './option.js'

export default async (fastify) => {

  fastify.addHook('onRequest', async (request, reply) => {
    const user = request.session.get('user');
    if (user) {
      rc.set('user', user)
    } else {
      // reply.redirect('/')
      // return
    }
  })

  fastify.get('/', async (request, reply) => {
    console.log(`trying to insert one wisata doc ..`)
    console.log()
    reply.xview('app/dashboard', {
      message: 'hello'
    })
  })

  fastify.get('/not-found', async (request, reply) => {
    const err_infos = reply.flash('error')
    reply.xview('app/not-found', {
      message: (err_infos && err_infos.length) ? err_infos[0] : 'terjadi kesalahan'
    })
  })

  fastify.register(WisataRoutes, { prefix: 'wisata' })
  fastify.register(RekomendasiRoutes, { prefix: 'rekomendasi' })
  // fastify.register(SchemaRoutes, { prefix: 'schema' })
  fastify.register(KriteriaRoutes, { prefix: 'kriteria' })
  fastify.register(OptionRoutes, { prefix: 'option' })

}
