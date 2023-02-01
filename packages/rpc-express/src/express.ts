import { AnyRpcCall, AnyRpcRouter, isRpcError, isRpcVoid, RpcError } from '@choffmeister/rpc-core'
import bodyParser from 'body-parser'
import express from 'express'
import { z } from 'zod'

export interface CreateRpcExpressServerOpts<Ctx> {
  createContext: (req: express.Request, res: express.Response) => Promise<Ctx>
}

export function createRpcExpressServer<Ctx, R extends AnyRpcRouter<Ctx> = AnyRpcRouter<Ctx>>(
  router: R,
  opts: CreateRpcExpressServerOpts<Ctx>
): express.Router {
  const result = express.Router()

  Object.keys(router).forEach(name => {
    const call: AnyRpcCall<Ctx> = router[name]
    result.post('/' + name, extractInput(call.inputSchema), async (req, res) => {
      try {
        const ctx = await opts.createContext(req, res)
        const output = await call.handler(ctx, req.body)
        sendOutput(res, call.outputSchema)(output)
      } catch (err) {
        sendError(res, err)
      }
    })
    result.use('/' + name, (_req, res) => sendError(res, RpcError.methodNotAllowed()))
  })

  result.use('/', (_req, res) => sendError(res, RpcError.notFound()))

  return result
}

function extractInput<S extends z.ZodTypeAny>(inputSchema: S): express.Handler {
  return (req, res, next) => {
    if (isRpcVoid(inputSchema)) {
      return next()
    }
    bodyParser.raw({ type: 'application/json' })(req, res, () => {
      if (!Buffer.isBuffer(req.body)) {
        return res.status(415).json({ error: 'Unsupported media type' })
      }
      const inputJson = safeJsonParse(req.body.toString('utf8'))
      if (!inputJson.success) {
        return res.status(400).json({ error: inputJson.errorMessage })
      }
      const input = inputSchema.safeParse(inputJson.data)
      if (!input.success) {
        return res.status(400).json({ error: 'Invalid input data', details: input.error.issues })
      }
      req.body = input.data
      next()
    })
  }
}

function sendError(res: express.Response, err: unknown): void {
  if (isRpcError(err)) {
    res.status(err.status).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

function sendOutput<S extends z.ZodTypeAny>(res: express.Response, outputSchema: S): (output: z.infer<S>) => void {
  return output => {
    if (isRpcVoid(outputSchema)) {
      res.status(204).send()
      return
    }
    res.status(200).json(output)
  }
}

function safeJsonParse<T = unknown>(
  str: string
): { success: true; data: T } | { success: false; errorMessage: string } {
  try {
    return { success: true, data: JSON.parse(str) }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, errorMessage: err.message }
    } else {
      return { success: false, errorMessage: 'Unable to parse JSON' }
    }
  }
}
