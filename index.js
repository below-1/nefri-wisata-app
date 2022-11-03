import dotenv from 'dotenv'

dotenv.config()

import { join } from 'path'
import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import Fastify from 'fastify'
import POV from 'point-of-view'
import nunjucks from 'nunjucks'
import Multer from 'fastify-multer'
import Static from 'fastify-static'
import Session from 'fastify-secure-session'
import Flash from 'fastify-flash'
import { 
  fastifyRequestContextPlugin as RCPlugin, 
  requestContext as rc 
} from 'fastify-request-context';

import XView from './xview.js'
import DB from './db.js'
import Routes from './routes/index.js'; 

const __dirname = dirname(fileURLToPath(import.meta.url));
// const static_prefix = process.env.NODE_ENV == 'production' ? 'https://below-1.github.io' : '/static'
const static_prefix = '/static'

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'development'
    ? {
      prettyPrint: {
          translateTime: true,
          ignore: 'pid,hostname,reqId,responseTime,req,res',
          messageFormat: '{msg} [id={reqId} {req.method} {req.url}]'
      }
    }
    : undefined
})

fastify
  .register(DB)
  .register(RCPlugin)
  .register(Session, {
    key: readFileSync(join(__dirname, '.session_secret')),
    cookie: {
      path: '/'
    }
  })
  .register(Flash)
  
fastify.register(Static, {
  root: join(__dirname, 'static'),
  prefix: '/static'
})
fastify.register(Static, {
  root: join(__dirname, 'resources'),
  prefix: '/resources',
  // the reply decorator has been added by the first plugin registration
  decorateReply: false 
})

fastify.register(POV, {
    engine: {
      nunjucks,
    },
    root: join(__dirname, 'views'),
    viewExt: 'html',
    includeViewExtension: true,
    defaultContext: {
      static: static_prefix,
      appTitle: 'ApWisata'
    },
    options: {
      onConfigure: (env) => {
        env.addFilter('static', (str) => {
          return `${static_prefix}${str}`
        })
      }
    }
  })
  .register(Multer.contentParser)
  .register(XView)
  .register(Routes)

async function main() {
  const port = process.env.PORT || 5000
  try {
    await fastify.listen(port, '0.0.0.0')
    fastify.log.info(`now listening`)
    fastify.log.info(process.env.NODE_ENV)
  } catch (err) {
    console.log(err);
    process.exit(1)
  }
}

main();
