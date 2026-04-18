import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ssrEntryUrl = pathToFileURL(resolve(process.cwd(), 'dist/ssr/index.js')).href

let ssrHandler

export async function handler(event, context) {
  if (!ssrHandler) {
    process.env.QUASAR_SSR_SERVERLESS = 'true'
    const mod = await import(ssrEntryUrl)
    ssrHandler = mod.handler
  }

  return ssrHandler(event, context)
}
