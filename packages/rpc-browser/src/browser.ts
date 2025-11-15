import { AnyRpcRouter, RpcClient } from '@ownfolio/rpc-core'

export class RpcBrowserClientError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'RpcBrowserClientError'
  }
}

export interface CreateRpcBrowserClientOpts {
  headers?: () => HeadersInit
}

export function createRpcBrowserClient<R extends AnyRpcRouter>(
  baseUrl: string,
  opts?: CreateRpcBrowserClientOpts
): RpcClient<R> {
  const client: RpcClient<any> = {}
  const proxy = new Proxy(client, {
    get: (_, name) => {
      return async function (input: unknown) {
        const url = baseUrl + '/' + name.toString()
        const res = await fetch(url, {
          method: 'POST',
          cache: 'no-cache',
          headers:
            arguments.length > 0
              ? {
                  'Content-Type': 'application/json',
                  ...(opts?.headers?.() || {}),
                }
              : {
                  ...(opts?.headers?.() || {}),
                },
          body: arguments.length > 0 ? JSON.stringify(input) : undefined,
        })
        if (res.status === 200) {
          const output = await res.json()
          return output
        } else if (res.status === 204) {
          return undefined
        } else {
          const body = await safeResponseJson(res)
          const message = typeof body?.error === 'string' ? body.error : 'Unknown error'
          throw new RpcBrowserClientError(message, res.status)
        }
      }
    },
  })
  return proxy
}

function safeResponseJson(res: Response): Promise<any> {
  return res.json().catch(() => ({}))
}
