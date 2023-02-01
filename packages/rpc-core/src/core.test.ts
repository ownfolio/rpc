import { expect, it } from 'vitest'
import { z } from 'zod'

import { createRpcCall, mergeRpcRouters } from './core'

it('createRpcCall', async () => {
  const rpc = createRpc1()
  await expect(rpc.noop.handler(undefined)).resolves.toBeUndefined()
  await expect(rpc.version.handler(undefined)).resolves.toEqual('v1')
})

it('mergeRpcRouters', async () => {
  const rpc = mergeRpcRouters(createRpc1(), createRpcV2())
  await expect(rpc.noop.handler(undefined)).resolves.toBeUndefined()
  await expect(rpc.version.handler(undefined)).resolves.toEqual('v2')
  await expect(rpc.greet.handler(undefined, { name: 'John' })).resolves.toEqual('Hello, John!')
})

function createRpc1() {
  return {
    noop: createRpcCall(z.void(), z.void(), async () => {}),
    version: createRpcCall(z.void(), z.string(), async () => 'v1'),
  }
}

function createRpcV2() {
  return {
    version: createRpcCall(z.void(), z.string(), async () => 'v2'),
    greet: createRpcCall(z.object({ name: z.string() }), z.string(), async (_, input) => `Hello, ${input.name}!`),
  }
}
