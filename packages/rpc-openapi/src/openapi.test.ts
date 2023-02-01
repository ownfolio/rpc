import { createRpcCall } from '@choffmeister/rpc-core'
import { expect, it } from 'vitest'
import { z } from 'zod'

import { createRpcOpenApi } from './openapi'

it('createRpcOpenApi', async () => {
  const rpc = createRpc()
  const openApi = createRpcOpenApi(rpc, {
    infoTitle: 'test',
    infoVersion: '1',
    serverUrl: 'http://localhost/v1',
  })
  expect(openApi).toEqual({
    openapi: '3.0.0',
    info: {
      title: 'test',
      version: '1',
    },
    servers: [{ url: 'http://localhost/v1' }],
    paths: {
      '/noop': {
        post: {
          responses: {
            '204': {
              description: 'OK',
            },
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
          },
        },
      },
      '/input': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
          responses: {
            '204': {
              description: 'OK',
            },
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
          },
        },
      },
      '/output': {
        post: {
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
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
          },
        },
      },
      '/both': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
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
          },
        },
      },
    },
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
  })
})

function createRpc() {
  return {
    noop: createRpcCall(z.void(), z.void(), async () => {}),
    input: createRpcCall(z.string(), z.void(), async () => {}),
    output: createRpcCall(z.void(), z.string(), async () => ''),
    both: createRpcCall(z.string(), z.string(), async () => ''),
  }
}
