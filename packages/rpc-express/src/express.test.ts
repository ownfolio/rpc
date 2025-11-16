import { createRpcCall, RpcError } from '@ownfolio/rpc-core'
import express from 'express'
import supertest from 'supertest'
import { expect, it } from 'vitest'
import * as z from 'zod'

import { createRpcExpressServer } from './express'

it('createRpcExpressServer', async () => {
  const rpcV1 = createRpcV1()
  const rpcV2 = createRpcV2()
  const app = express()
  app.use(
    '/v1',
    createRpcExpressServer<string>(rpcV1, {
      createContext: async req => {
        const h = req.headers['x-auth-v1']
        return Array.isArray(h) ? h[0] || '' : h || ''
      },
    })
  )
  app.use(
    '/v2',
    createRpcExpressServer<string>(rpcV2, {
      createContext: async req => {
        const h = req.headers['x-auth-v2']
        return Array.isArray(h) ? h[0] || '' : h || ''
      },
    })
  )

  await supertest(app)
    .post('/v1/not-found')
    .expect(404)
    .then(res => {
      expect(res.body.error).toEqual('Not found')
    })
  await supertest(app)
    .get('/v1/not-found')
    .expect(404)
    .then(res => {
      expect(res.body.error).toEqual('Not found')
    })

  await supertest(app).post('/v1/noop').expect(204)
  await supertest(app).get('/v1/noop').expect(405)
  await supertest(app).get('/v2/noop').expect(404)

  await supertest(app)
    .post('/v1/version')
    .expect('Content-Type', /^application\/json/)
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('v1')
    })
  await supertest(app)
    .post('/v2/version')
    .expect('Content-Type', /^application\/json/)
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('v2')
    })

  await supertest(app)
    .post('/v1/context')
    .set('x-auth-v1', 'u1')
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('you u1')
    })
  await supertest(app)
    .post('/v1/context')
    .set('x-auth-v2', 'u1')
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('you ')
    })
  await supertest(app)
    .post('/v2/context')
    .set('x-auth-v1', 'u2')
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('you ')
    })
  await supertest(app)
    .post('/v2/context')
    .set('x-auth-v2', 'u2')
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('you u2')
    })

  await supertest(app).post('/v1/greet').send({ name: 'John' }).expect(404)
  await supertest(app)
    .post('/v2/greet')
    .send({ name: 'John' })
    .expect('Content-Type', /^application\/json/)
    .expect(200)
    .then(res => {
      expect(res.body).toEqual('Hello, John!')
    })

  await supertest(app)
    .post('/v2/forbidden')
    .expect(403)
    .then(res => {
      expect(res.body.error).toEqual('Forbidden')
    })
  await supertest(app)
    .post('/v2/error')
    .expect(500)
    .then(res => {
      expect(res.body.error).toEqual('Internal server error')
    })
})

function createRpcV1() {
  return {
    noop: createRpcCall(z.void(), z.void(), async (_ctx: string) => {}),
    version: createRpcCall(z.void(), z.string(), async (_ctx: string) => 'v1'),
    context: createRpcCall(z.void(), z.string(), async (ctx: string) => 'you ' + ctx),
  }
}

function createRpcV2() {
  return {
    version: createRpcCall(z.void(), z.string(), async (_ctx: string) => 'v2'),
    context: createRpcCall(z.void(), z.string(), async (ctx: string) => 'you ' + ctx),
    greet: createRpcCall(
      z.object({ name: z.string() }),
      z.string(),
      async (_ctx: string, input) => `Hello, ${input.name}!`
    ),
    forbidden: createRpcCall(z.void(), z.void(), async (_ctx: string) => {
      throw RpcError.forbidden()
    }),
    error: createRpcCall(z.void(), z.void(), async (_ctx: string) => {
      throw new Error('boom')
    }),
  }
}
