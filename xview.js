import fp from 'fastify-plugin'
import { 
  requestContext as rc 
} from 'fastify-request-context';

export default fp(async (fastify) => {
  fastify.decorateReply('xview', function (path, data) {
    return this.view(path, {
      ...data,
      context: {
        user: rc.get('user')
      }
    })
  });
})