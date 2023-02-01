import { expect, it } from 'vitest'

import { RpcBrowserClientError } from './browser'
import { isRpcBrowserClientError } from './utils'

it('isRpcBrowserClientError', () => {
  expect(isRpcBrowserClientError(new RpcBrowserClientError('', 0))).toBe(true)

  expect(isRpcBrowserClientError(new Error())).toBe(false)

  expect(isRpcBrowserClientError(0)).toBe(false)
  expect(isRpcBrowserClientError(false)).toBe(false)
  expect(isRpcBrowserClientError(null)).toBe(false)
  expect(isRpcBrowserClientError(undefined)).toBe(false)
})
