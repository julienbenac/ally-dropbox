/**
 * @julienbenac/ally-dropbox
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import type {
  AllyUserContract,
  ApiRequestContract,
  RedirectRequestContract,
} from '@adonisjs/ally/types'
import type { HttpContext } from '@adonisjs/core/http'

import { Oauth2Driver } from '@adonisjs/ally'

import { DropboxDriverConfig, DropboxScopes, DropboxToken } from './types/main.js'

/**
 * Dropbox driver to login user via Dropbox.
 */
export class DropboxDriver extends Oauth2Driver<DropboxToken, DropboxScopes> {
  /**
   * The authorization URL for the OAuth provider.
   * The user will be redirected to this page to authorize the request.
   */
  protected authorizeUrl = 'https://www.dropbox.com/oauth2/authorize'

  /** The URL to hit to get an access token. */
  protected accessTokenUrl = 'https://www.dropbox.com/oauth2/token'

  /** The URL to hit to get user details. */
  protected userInfoUrl = 'https://api.dropboxapi.com/2/openid/userinfo'

  /** The cookie name for storing the CSRF token. */
  protected stateCookieName = 'dropbox_oauth_state'

  /**
   * The parameter name in which to send the state to the OAuth provider.
   * The same input is used to retrieve the state post redirect as well.
   */
  protected stateParamName = 'state'

  /** The parameter name from which to fetch the authorization code. */
  protected codeParamName = 'code'

  /** The parameter name from which to fetch the error message post redirect. */
  protected errorParamName = 'error'

  /** The parameter name for defining the authorization scopes. */
  protected scopeParamName = 'scope'

  /** The identifier for joining multiple scopes. */
  protected scopesSeparator = ' '

  constructor(
    ctx: HttpContext,
    public config: DropboxDriverConfig
  ) {
    super(ctx, config)

    this.loadState()
  }

  /**
   * Configuring the redirect request with defaults.
   */
  protected configureRedirectRequest(request: RedirectRequestContract<DropboxScopes>) {
    // Define user defined scopes or the default one's
    request.scopes(this.config.scopes || ['openid', 'profile', 'email'])

    // Set "response_type" param
    request.param('response_type', 'code')
  }

  /**
   * Redirects user for authentication.
   */
  async redirect(
    callback?: (request: RedirectRequestContract<DropboxScopes>) => void
  ): Promise<void> {
    const url = await this.redirectUrl((request) => {
      if (typeof callback === 'function') {
        callback(request)
      }
    })

    this.ctx.response.redirect(url)
  }

  /**
   * Returns the HTTP request with the authorization header set.
   */
  protected getAuthenticatedRequest(url: string, token: string) {
    const request = this.httpClient(url)

    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')

    return request
  }

  /**
   * Fetches the user details.
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<Omit<AllyUserContract<DropboxToken>, 'token'>> {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token)

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.post()

    return {
      id: body.sub,
      nickName: body.given_name,
      name: body.family_name,
      email: body.email,
      emailVerificationState: body.email_verified ? ('verified' as const) : ('unverified' as const),
      avatarUrl: null,
      original: body,
    }
  }

  /**
   * Find if the current error message is access denied.
   */
  accessDenied(): boolean {
    const error = this.getError()

    if (!error) return false

    return error === 'access_denied'
  }

  /**
   * Returns details of the authorized user.
   */
  async user(
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<DropboxToken>> {
    const { id_token: idToken, ...token } = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    return { ...user, token: { ...token, idToken } }
  }

  /**
   * Finds the user from access token.
   */
  async userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}
