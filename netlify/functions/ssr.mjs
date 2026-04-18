import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const netlifySsrEntryUrl = pathToFileURL(resolve(process.cwd(), 'dist/netlify-ssr/index.mjs')).href

let ssrHandler

export async function handler(event, context) {
  if (!ssrHandler) {
    process.env.QUASAR_SSR_SERVERLESS = 'true'
    const mod = await import(netlifySsrEntryUrl)
    ssrHandler = mod.handler
  }

  return ssrHandler(event, context)
}
