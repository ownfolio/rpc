import { generateSchema } from '@anatine/zod-openapi'
import { AnyRpcCall, AnyRpcRouter, isRpcVoid } from '@choffmeister/rpc-core'
import { OpenAPIObject, PathItemObject, PathsObject } from 'openapi3-ts'
import { z } from 'zod'

export interface RpcOpenApiOpts {
  infoVersion: string
  infoTitle: string
  serverUrl: string
}

export function createRpcOpenApi<Ctx, R extends AnyRpcRouter<Ctx> = AnyRpcRouter<Ctx>>(
  router: R,
  opts: RpcOpenApiOpts
): OpenAPIObject {
  const paths = Object.keys(router).reduce<PathsObject>((paths, name) => {
    const call: AnyRpcCall<Ctx> = router[name]
    const pathObject: PathItemObject = {
      post: {
        ...(!isRpcVoid(call.inputSchema) ? requestBody(call.inputSchema) : requestBodyVoid()),
        responses: {
          ...(!isRpcVoid(call.outputSchema) ? responseOK(call.outputSchema) : responseOKVoid()),
          ...responseBadRequest(),
          ...responseUnauthorized(),
          ...responseForbidden(),
          ...responseConflict(),
        },
      },
    }
    return {
      ...paths,
      ['/' + name]: pathObject,
    }
  }, {})

  return {
    openapi: '3.0.0',
    info: {
      version: opts.infoVersion,
      title: opts.infoTitle,
    },
    servers: [
      {
        url: opts.serverUrl,
      },
    ],
    paths,
    components: {
      schemas: {
        RpcError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  }
}

const requestBody = (inputSchema: z.ZodTypeAny) => {
  return {
    requestBody: {
      content: {
        'application/json': {
          schema: generateSchema(inputSchema),
        },
      },
    },
  }
}

const requestBodyVoid = () => {
  return {}
}

const responseOK = (outputSchema: z.ZodTypeAny) => {
  return {
    '200': {
      description: 'OK',
      content: {
        'application/json': {
          schema: generateSchema(outputSchema),
        },
      },
    },
  }
}
const responseOKVoid = () => {
  return {
    '204': {
      description: 'OK',
    },
  }
}

const responseBadRequest = () => {
  return {
    '400': {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RpcError',
          },
        },
      },
    },
  }
}

const responseUnauthorized = () => {
  return {
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RpcError',
          },
        },
      },
    },
  }
}

const responseForbidden = () => {
  return {
    '403': {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RpcError',
          },
        },
      },
    },
  }
}

const responseConflict = () => {
  return {
    '409': {
      description: 'Conflict',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RpcError',
          },
        },
      },
    },
  }
}
