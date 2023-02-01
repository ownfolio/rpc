import { RpcBrowserClientError } from './browser'

export function isRpcBrowserClientError(error: any): error is RpcBrowserClientError {
  return error instanceof Error && error.name === 'RpcBrowserClientError'
}
