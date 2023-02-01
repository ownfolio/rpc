import { RpcError } from './core'

export function isRpcError(error: any): error is RpcError {
  return error instanceof Error && error.name === 'RpcError'
}

export function isRpcVoid(schema: any): boolean {
  return typeof schema === 'object' && typeof schema?._def === 'object' && schema._def?.typeName === 'ZodVoid'
}
