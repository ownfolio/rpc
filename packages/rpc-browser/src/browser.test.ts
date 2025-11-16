import {
  AnyRpcRouter,
  createRpcCallDefinition,
  createRpcRouterFromDefinitionAndHandler,
  isRpcVoid,
} from '@ownfolio/rpc-core'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import * as z from 'zod'

import { createRpcBrowserClient } from './browser'

it('createRpcBrowserClient', async () => {
  const rpcClient = createRpcBrowserClient('/v1', routerDefinition)
  await expect(rpcClient.noop()).resolves.toEqual(undefined)
  await expect(rpcClient.greet({ name: 'John', date: new Date(0) })).resolves.toEqual({
    message: 'Hello, John!',
    date: new Date(0),
  })
})

const stringToDateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: isoString => new Date(isoString),
  encode: date => date.toISOString(),
})

const routerDefinition = {
  noop: createRpcCallDefinition(z.void(), z.void()),
  version: createRpcCallDefinition(z.void(), z.string()),
  me: createRpcCallDefinition(z.void(), z.string()),
  greet: createRpcCallDefinition(
    z.object({ name: z.string(), date: stringToDateCodec }),
    z.object({ message: z.string(), date: stringToDateCodec })
  ),
}
const router = createRpcRouterFromDefinitionAndHandler(routerDefinition, {
  noop: async (_ctx: string) => {},
  version: async (_ctx: string) => 'v1',
  me: async (ctx: string) => 'you ' + ctx,
  greet: async (_ctx: string, input) => ({
    message: `Hello, ${input.name}!`,
    date: input.date,
  }),
})

beforeAll(() => {
  global.fetch = vi.fn(async (url, opts) => {
    const urlStr = url.toString()
    if (!urlStr.startsWith('/v1/')) {
      throw new Error()
    }
    const name = urlStr.substring(4)
    const call = (router as AnyRpcRouter)[name]
    if (!call) {
      throw new Error()
    }
    const inputJson = JSON.parse(opts?.body || '{}')
    const input = !isRpcVoid(call.inputSchema) ? call.inputSchema.decode(inputJson) : undefined
    const output = await call.handler('mock', input)
    const outputJson = !isRpcVoid(call.outputSchema) ? call.outputSchema.encode(output) : undefined
    return { status: 200, json: async () => outputJson } as any
  })
})

afterAll(() => {
  vi.clearAllMocks() // Reset all mocked calls between tests
})
