'use strict'

const nunjucks = require('nunjucks')
const config = require('../config.js')
const paths = require('../paths.js')
const filters = require('./filters.js')

// configure https://mozilla.github.io/nunjucks/api.html#configure
const nunjucksEnv = nunjucks.configure(paths.templates, config.nunjucks)

// add custom filters
for (const filterName in filters) {
  nunjucksEnv.addFilter(filterName, filters[filterName])
}

// add custom globals
nunjucksEnv.addGlobal('globals', {
  currentYear: new Date().getUTCFullYear(),
  siteUrl: config.siteUrl.href,
  siteDomain: config.siteUrl.host,
  devel: config.devel,
  production: config.production
})
nunjucksEnv.addGlobal('getDebugData', function () { return this })

module.exports = nunjucksEnv
