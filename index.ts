/**
 * @julienbenac/ally-dropbox
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import type { HttpContext } from '@adonisjs/core/http'

export { stubsRoot } from './stubs/main.js'
export { configure } from './configure.js'

import type { DropboxDriverConfig, DropboxToken } from './src/types/main.js'

import { DropboxDriver } from './src/dropbox.js'

export function dropbox(config: DropboxDriverConfig) {
  return (ctx: HttpContext) => new DropboxDriver(ctx, config)
}

export type { DropboxToken }
