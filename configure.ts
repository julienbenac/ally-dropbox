/**
 * @julienbenac/ally-dropbox
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await codemods.defineEnvVariables({
    DROPBOX_CLIENT_ID: '',
    DROPBOX_CLIENT_SECRET: '',
    DROPBOX_CALLBACK_URL: '',
  })

  await codemods.defineEnvValidations({
    variables: {
      DROPBOX_CLIENT_ID: 'Env.schema.string()',
      DROPBOX_CLIENT_SECRET: 'Env.schema.string()',
      DROPBOX_CALLBACK_URL: 'Env.schema.string()',
    },
    leadingComment: 'Variables for configuring @julienbenac/ally-dropbox',
  })
}
