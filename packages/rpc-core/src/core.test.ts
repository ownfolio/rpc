import { expect, it } from 'vitest'
import * as z from 'zod'

import { createRpcCallDefinition, createRpcRouterFromDefinitionAndHandler, mergeRpcRouters } from './core'

it('createRpcCall', async () => {
  const rpc = createRpc1()
  await expect(rpc.noop.handler('ctx')).resolves.toBeUndefined()
  await expect(rpc.version.handler('ctx')).resolves.toEqual('v1')
})

it('mergeRpcRouters', async () => {
  const rpc = mergeRpcRouters(createRpc1(), createRpcV2())
  await expect(rpc.noop.handler('ctx')).resolves.toBeUndefined()
  await expect(rpc.version.handler('ctx')).resolves.toEqual('v2')
  await expect(rpc.greet.handler('ctx', { name: 'John' })).resolves.toEqual('Hello, John!')
})

function createRpc1() {
  const definition = {
    noop: createRpcCallDefinition(z.void(), z.void()),
    version: createRpcCallDefinition(z.void(), z.string()),
  }
  const router = createRpcRouterFromDefinitionAndHandler<string, typeof definition>(definition, {
    noop: async () => {},
    version: async () => 'v1',
  })
  return router
}

function createRpcV2() {
  const definition = {
    version: createRpcCallDefinition(z.void(), z.string()),
    greet: createRpcCallDefinition(z.object({ name: z.string() }), z.string()),
  }
  const router = createRpcRouterFromDefinitionAndHandler<string, typeof definition>(definition, {
    version: async _ctx => 'v2',
    greet: async (_ctx, input) => `Hello, ${input.name}!`,
  })
  return router
}
