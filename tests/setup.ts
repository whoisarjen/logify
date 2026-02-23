/**
 * Vitest setup file.
 *
 * Nuxt auto-imports several h3 utilities as globals in server routes.
 * Since we test handler functions directly (not through the Nuxt runtime),
 * we need to make these available in the global scope.
 */
import {
  defineEventHandler,
  createError,
  readBody,
  getQuery,
  getHeader,
  getRouterParam,
  setResponseStatus,
  setHeader,
  getCookie,
  setCookie,
  deleteCookie,
} from 'h3'

// Assign h3 utilities to globalThis so server handlers can find them
const globals: Record<string, unknown> = {
  defineEventHandler,
  createError,
  readBody,
  getQuery,
  getHeader,
  getRouterParam,
  setResponseStatus,
  setHeader,
  getCookie,
  setCookie,
  deleteCookie,
}

for (const [name, fn] of Object.entries(globals)) {
  ;(globalThis as any)[name] = fn
}
