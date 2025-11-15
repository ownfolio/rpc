import { createRpcCall, mergeRpcRouters, RpcError } from '@ownfolio/rpc-core'
import express from 'express'
import { z } from 'zod'

import { createRpcExpressServer } from '../../packages/rpc-express'
import { createRpcOpenApi } from '../../packages/rpc-openapi'

// define the context passed into your RPC calls
interface RpcCtx {
  userId?: string
}

// define your RPC calls
const rpcBase = {
  ping: createRpcCall(z.void(), z.void(), async (_ctx: RpcCtx) => {}),
  greet: createRpcCall(
    z.object({ name: z.string() }),
    z.string(),
    async (_ctx: RpcCtx, input) => `Hello, ${input.name}!`
  ),
}
const rpcUser = {
  user: createRpcCall(z.void(), z.object({ id: z.string() }), async (ctx: RpcCtx) => {
    if (!ctx.userId) throw RpcError.unauthorized()
    return {
      id: ctx.userId,
    }
  }),
}
const rpc = mergeRpcRouters(rpcBase, rpcUser)

// generate OpenAPI definition
const rpcOpenApi = createRpcOpenApi<RpcCtx>(rpc, {
  infoTitle: 'example',
  infoVersion: '1',
  serverUrl: 'http://localhost:3000',
})

// mount OpenAPI definition and RPC calls to express server
const app = express()
app.get('/v1/openapi.json', (_req, res) => res.json(rpcOpenApi))
app.use(
  '/v1',
  createRpcExpressServer<RpcCtx>(rpc, {
    createContext: async (req, _res) => {
      return {
        userId: typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : undefined,
      }
    },
  })
)
app.listen(3000)
