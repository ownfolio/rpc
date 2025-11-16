import * as z from 'zod'

export type AnyRpcCallDefinition = RpcCallDefinition<any, any>
export type AnyRpcCall<Ctx = any> = RpcCall<Ctx, any, any>
export type AnyRpcRouterDefinition = { [name in string]: AnyRpcCallDefinition }
export type AnyRpcRouter<Ctx = any> = { [name in string]: AnyRpcCall<Ctx> }

export interface RpcCallDefinition<I extends z.ZodTypeAny = z.ZodTypeAny, O extends z.ZodTypeAny = z.ZodTypeAny> {
  inputSchema: I
  outputSchema: O
}

export type RpcCallHandler<Ctx, I extends z.ZodTypeAny = z.ZodTypeAny, O extends z.ZodTypeAny = z.ZodTypeAny> = (
  ctx: Ctx,
  input: z.infer<I>
) => Promise<z.infer<O>>

export interface RpcCall<Ctx, I extends z.ZodTypeAny = z.ZodTypeAny, O extends z.ZodTypeAny = z.ZodTypeAny>
  extends RpcCallDefinition<I, O> {
  handler: RpcCallHandler<Ctx, I, O>
}

export function mergeRpcRouterDefinitions<R1 extends AnyRpcRouterDefinition, R2 extends AnyRpcRouterDefinition>(
  r1: R1,
  r2: R2
): Omit<R1, keyof R2> & R2 {
  return {
    ...r1,
    ...r2,
  }
}

export function mergeRpcRouters<R1 extends AnyRpcRouter, R2 extends AnyRpcRouter>(
  r1: R1,
  r2: R2
): Omit<R1, keyof R2> & R2 {
  return {
    ...r1,
    ...r2,
  }
}

export type RpcCallCtx<T> = T extends RpcCall<infer Ctx, infer _I, infer _O> ? Ctx : never
export type RpcCallInputSchema<T> =
  T extends RpcCallDefinition<infer I, infer _O> ? I : T extends RpcCall<infer _Ctx, infer I, infer _O> ? I : never
export type RpcCallInputType<T> = z.infer<RpcCallInputSchema<T>>
export type RpcCallOutputSchema<T> =
  T extends RpcCallDefinition<infer _I, infer O> ? O : T extends RpcCall<infer _Ctx, infer _I, infer O> ? O : never
export type RpcCallOutputType<T> = z.infer<RpcCallOutputSchema<T>>

export function createRpcCallDefinition<I extends z.ZodTypeAny, O extends z.ZodTypeAny>(
  inputSchema: I,
  outputSchema: O
): RpcCallDefinition<I, O> {
  return {
    inputSchema,
    outputSchema,
  }
}

export function createRpcCall<Ctx, I extends z.ZodTypeAny, O extends z.ZodTypeAny>(
  inputSchema: I,
  outputSchema: O,
  handler: (ctx: Ctx, input: z.infer<I>) => Promise<z.infer<O>>
): RpcCall<Ctx, I, O> {
  return {
    inputSchema,
    outputSchema,
    handler,
  }
}

export function createRpcCallFromDefinitionAndHandler<
  Ctx,
  I extends z.ZodTypeAny = z.ZodTypeAny,
  O extends z.ZodTypeAny = z.ZodTypeAny,
>(
  definition: RpcCallDefinition<I, O>,
  handler: (ctx: Ctx, input: z.infer<I>) => Promise<z.infer<O>>
): RpcCall<Ctx, I, O> {
  return createRpcCall(definition.inputSchema, definition.outputSchema, handler)
}

export function createRpcRouterFromDefinitionAndHandler<Ctx, R extends AnyRpcRouterDefinition>(
  routerDefinition: R,
  handlers: { [name in keyof R]: RpcCallHandler<Ctx, RpcCallInputSchema<R[name]>, RpcCallOutputSchema<R[name]>> }
): { [name in keyof R]: RpcCall<Ctx, RpcCallInputSchema<R[name]>, RpcCallOutputSchema<R[name]>> } {
  return Object.keys(routerDefinition).reduce<{
    [name in keyof R]: RpcCall<Ctx, RpcCallInputSchema<R[name]>, RpcCallOutputSchema<R[name]>>
  }>(
    (acc, key) => ({
      ...acc,
      [key]: createRpcCallFromDefinitionAndHandler(routerDefinition[key], handlers[key]),
    }),
    {} as any
  )
}

export type RpcClient<R extends AnyRpcRouterDefinition> = {
  [name in keyof R]: (input: RpcCallInputType<R[name]>) => Promise<RpcCallOutputType<R[name]>>
}

export class RpcError extends Error {
  readonly status: number

  private constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'RpcError'
  }

  static badRequest = (message = 'Bad request') => new RpcError(message, 400)
  static unauthorized = (message = 'Unauthorized') => new RpcError(message, 401)
  static forbidden = (message = 'Forbidden') => new RpcError(message, 403)
  static conflict = (message = 'Conflict') => new RpcError(message, 409)

  static notFound = (message = 'Not found') => new RpcError(message, 404)
  static methodNotAllowed = (message = 'Method not allowed') => new RpcError(message, 405)
}
