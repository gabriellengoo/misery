import Vue from 'vue'
import defu from 'defu'

import createClient from '@sanity/client'

const _options = JSON.parse('{"useCdn":true,"projectId":"gsh23bac","dataset":"production","apiVersion":"2023-01-01","withCredentials":false}')
const _additionalClients = JSON.parse('{}')

const createSanity = options => ({
  client: createClient(options),
  config: options,
  fetch(...args) {
    return this.client.fetch(...args)
  },
  setToken(token) {
    this.client = createClient({ ...options, token })
    this.options = ({ ...options, token })
  },
})

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default async (context, inject) => {
  const { $config } = context
  const options = defu($config && $config.sanity || {}, _options)

  if (!options.disableSmartCdn && '$preview' in context) options.useCdn = false
  const additionalClients = defu($config && $config.sanity && $config.sanity.additionalClients || {}, _additionalClients)

  inject('sanity', {
    ...createSanity(options),
    ...Object.entries(additionalClients).reduce((clients, [name, clientOptions]) => {
      clients[name] = createSanity(defu(clientOptions, options))
      return clients
    }, {})
  })
}
