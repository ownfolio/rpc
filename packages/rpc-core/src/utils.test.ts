import { expect, it } from 'vitest'
import { z } from 'zod'

import { RpcError } from './core'
import { isRpcError, isRpcVoid } from './utils'

it('isRpcError', () => {
  expect(isRpcError(RpcError.notFound())).toBe(true)

  expect(isRpcError(new Error())).toBe(false)

  expect(isRpcError(0)).toBe(false)
  expect(isRpcError(false)).toBe(false)
  expect(isRpcError(null)).toBe(false)
  expect(isRpcError(undefined)).toBe(false)
})

it('isRpcVoid', () => {
  expect(isRpcVoid(z.void())).toBe(true)

  expect(isRpcVoid(z.string())).toBe(false)
  expect(isRpcVoid(z.number())).toBe(false)

  expect(isRpcVoid(0)).toBe(false)
  expect(isRpcVoid(false)).toBe(false)
  expect(isRpcVoid(null)).toBe(false)
  expect(isRpcVoid(undefined)).toBe(false)
})
