import fs from 'fs/promises'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(async () => {
  const packages = await fs.readdir(path.resolve(__dirname, 'packages'))
  const result = {
    resolve: {
      alias: packages.reduce(
        (acc, dir) => ({
          ...acc,
          [`@ownfolio/${dir}`]: path.resolve(__dirname, 'packages', dir, 'index.ts'),
        }),
        {}
      ),
    },
  }
  return result
})
