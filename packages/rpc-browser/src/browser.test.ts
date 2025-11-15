import { createRpcCall } from '@ownfolio/rpc-core'
import { expect, it } from 'vitest'
import { z } from 'zod'

import { createRpcBrowserClient } from './browser'

it('createRpcBrowserClient', async () => {
  const rpcClientV1 = createRpcBrowserClient<ReturnType<typeof createRpcV1>>('/v1')
  const rpcClientV2 = createRpcBrowserClient<ReturnType<typeof createRpcV2>>('/v1')
  await expect(rpcClientV1.noop()).rejects.toBeDefined()
  await expect(rpcClientV2.greet({ name: 'John' })).rejects.toBeDefined()
})

function createRpcV1() {
  return {
    noop: createRpcCall(z.void(), z.void(), async (_ctx: string) => {}),
    version: createRpcCall(z.void(), z.string(), async (_ctx: string) => 'v1'),
    me: createRpcCall(z.void(), z.string(), async (ctx: string) => 'you ' + ctx),
  }
}

function createRpcV2() {
  return {
    version: createRpcCall(z.void(), z.string(), async (_ctx: string) => 'v2'),
    me: createRpcCall(z.void(), z.string(), async (ctx: string) => 'you ' + ctx),
    greet: createRpcCall(
      z.object({ name: z.string() }),
      z.string(),
      async (_ctx: string, input) => `Hello, ${input.name}!`
    ),
  }
}
