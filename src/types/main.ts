/**
 * @julienbenac/ally-dropbox
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import type {
  AllyDriverContract,
  LiteralStringUnion,
  Oauth2DriverConfig,
} from '@adonisjs/ally/types'

export interface DropboxDriverContract extends AllyDriverContract<DropboxToken, DropboxScopes> {
  version: 'oauth2'
}

export interface DropboxDriverConfig extends Oauth2DriverConfig {
  scopes?: LiteralStringUnion<DropboxScopes>[]
}

export type DropboxToken = {
  /** The token value. */
  token: string

  /** The token type. */
  type: 'bearer'

  /** The refresh token. */
  refreshToken: string

  /** The static time in seconds when the token will expire. */
  expiresIn: number

  /** The timestamp at which the token expires. */
  expiresAt: Date

  /** The identification token (JWT format) for session lifecycle. */
  idToken: string
} & Record<string, any>

export type DropboxScopes = 'openid' | 'profile' | 'email'
