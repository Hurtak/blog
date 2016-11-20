'use strict'

const path = require('path')
const lodash = require('lodash')

const config = require('./config.js')
const articles = require('./articles.js')
const paths = require('./paths.js')

// Main routes

function index (req, res) {
  const articleDirectories = articles.getArticlesDirectories(paths.articles)

  let relevantArticles = articleDirectories
  relevantArticles = lodash.sortBy(relevantArticles)
  relevantArticles = lodash.slice(relevantArticles, 0, config.articles.articlesPerPage)

  const articlesData = []
  for (const articlePath of relevantArticles) {
    // TODO: once async/await lands, make this concurrent
    articlesData.push(articles.getArticleData(articlePath))
  }

  const data = {
    articles: articlesData
  }

  res.render('pages/index.njk', data)
}

function article (req, res) {
  const articleName = req.params.article

  const articlePath = articles.getPathByArticleName(paths.articles, articleName)
  if (!articlePath) {
    notFound(req, res)
    return
  }

  const data = articles.getArticleData(articlePath)
  res.render('pages/article.njk', data)
}

function articleStaticFiles (req, res) {
  const articlePath = articles.getPathByArticleName(paths.articles, req.params.article)
  const imagePath = path.join(articlePath, '/', req.params.folder, req.params.fileName)
  res.sendFile(imagePath, (err) => error(err, req, res))
}

// Special pages

// function rss (req, res) {
//   database.getRSS().then(databaseArticles => {
//     const data = {articles: databaseArticles}
//     for (let i = 0; i < data.articles.length; i++) {
//       data.articles[i].pubData = new Date(data.articles.publication_date).toGMTString()
//     }

//     res.type('text/xml')
//     res.render('pages/rss.njk', data)
//   })
// }

function robotsTxt (req, res) {
  res.type('text/plain')
  res.render('pages/robots.txt.njk')
}

// function humansTxt (req, res) {
//   database.getHumansTxt().then(data => {
//     const templateData = {
//       lastUpdate: data.lastUpdate
//     }

//     res.type('text/plain')
//     res.render('pages/humans.txt.njk', templateData)
//   })
// }

// Error pages

function notFound (req, res) {
  const data = {}
  res.status(404).render('pages/404.njk', data)
}

function error (err, req, res) {
  if (!err) return

  if (err.status === 404) {
    notFound(req, res)
  } else {
    res.status(err.status).end()
  }
}

// Export

module.exports = {
  index,
  article,
  articleStaticFiles,

  // rss,
  robotsTxt,
  // humansTxt,

  notFound
}
