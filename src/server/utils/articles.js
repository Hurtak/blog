'use strict'

const cheerio = require('cheerio')
const lodash = require('lodash')

const nunjucksEnv = require('../nunjucks/env.js')

function cheerioLoadWithoutEscaping (htmlString) {
  return cheerio.load(htmlString, { decodeEntities: false })
}

function isElementInsideCodeBlock (cheerioElementObject) {
  return cheerioElementObject.parent('code').length > 0
}

function addIdsToHeadings (htmlString) {
  let $ = cheerioLoadWithoutEscaping(htmlString)
  let sameHeadingsCount = 0

  $('h2, h3').each((index, element) => {
    const el = $(element)

    if (isElementInsideCodeBlock(el)) return

    let id = el.text()
    if (!id.trim()) return

    id = lodash.replace(id, /[^A-Za-z0-9-_.&\s]/g, '') // remove special characters
    id = lodash.kebabCase(id)

    let postfix = ''
    while (true) {
      const idUnique = $('#' + id + postfix).length === 0
      if (idUnique) break

      sameHeadingsCount++
      postfix = '-' + (sameHeadingsCount + 1)
    }

    el.attr('id', id + postfix)
  })

  return $.html()
}

function enhanceSnippetLinks (htmlString, snippets) {
  let $ = cheerioLoadWithoutEscaping(htmlString)

  $('a[href^="./snippets/"]').each((_, element) => {
    const el = $(element)

    const rawSnippetUrl = el.attr('href') // ./snippets/example.html
    const pathSplit = rawSnippetUrl.split('/')
    const fileName = pathSplit[pathSplit.length - 1] // example.html"
    const snippetName = fileName.split('.')[0] // example

    const snippet = snippets.find(({ name }) => name === snippetName)
    if (!snippet) return

    const snippetHtml = nunjucksEnv.render('components/snippet.njk', {
      snippetName,
      rawSnippetUrl,
      config: snippet.config
    })
    const snippetEl = $(snippetHtml)

    el.replaceWith(snippetEl)
  })

  return $.html()
}

function removeIndentation (str) {
  if (typeof str !== 'string') return null

  // 1. split text into lines
  let lines = str.split('\n')

  // 2. remove empty lines from the stard and the end of the text
  const firstNonEmptyLine = lines => {
    let currentIndex = 0
    for (let i = 0; i < lines.length; i++) {
      const isWhitespaceOnly = /^\s*$/.test(lines[i])
      if (!isWhitespaceOnly) return currentIndex

      currentIndex++
    }
    return currentIndex
  }

  const startIndex = firstNonEmptyLine(lines)
  const endIndex = firstNonEmptyLine(lodash.reverse([...lines]))

  lines = lodash.slice(lines, startIndex, lines.length - endIndex)

  // 3. determine indentation
  let shortestIndent = 0
  for (const line of lines) {
    const indentMatch = line.match(/^\s+/)
    const indent = indentMatch ? indentMatch[0] : ''

    if (shortestIndent === 0) {
      shortestIndent = indent.length
    } else if (indent.length < shortestIndent) {
      shortestIndent = indent.length
    }
  }

  // 4. remove indentation
  const indentationToRemove = lodash.repeat(' ', shortestIndent)
  lines = lodash.map(lines, line => lodash.replace(line, indentationToRemove, ''))

  return lodash.join(lines, '\n')
}

function parseSnippet (wholeHtml) {
  const $ = cheerioLoadWithoutEscaping(wholeHtml)

  const css = $('head > style').html()
  const js = $('body > script:last-of-type').html()
  const head = $('head').html().replace(`<style>${css}</style>`, '')
  const html = $('body').html().replace(`<script>${js}</script>`, '')

  const nullIfEmptyString = str => typeof str === 'string' && str.trim() === '' ? null : str

  return {
    head: nullIfEmptyString(removeIndentation(head)),
    html: nullIfEmptyString(removeIndentation(html)),
    css: nullIfEmptyString(removeIndentation(css)),
    js: nullIfEmptyString(removeIndentation(js))
  }
}

module.exports = {
  addIdsToHeadings,
  enhanceSnippetLinks,
  removeIndentation,
  parseSnippet
}