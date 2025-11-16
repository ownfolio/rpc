import { RpcError } from './core'

export function isRpcError(error: any): error is RpcError {
  return error instanceof Error && error.name === 'RpcError'
}

export function isRpcVoid(schema: any): boolean {
  return typeof schema === 'object' && schema?.type === 'void'
}
