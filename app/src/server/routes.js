'use strict'

const lodash = require('lodash')

const articles = require('./articles.js')
const database = require('./database.js')
const paths = require('./paths.js')

const addCommonData = data => {
  const commonData = {
    currentYear: new Date().getFullYear(),
    siteUrl: 'https://hurtak.cc',
    siteDomain: 'hurtak.cc',
    siteProtocol: 'https://',
    debug: false
  }

  return Object.assign({}, commonData, data)
}

const notFound = (req, res) => {
  const data = addCommonData({})
  res.render('pages/404.njk', data)
}

const index = (req, res) => {
  database.getArticles().then(databaseArticles => {
    databaseArticles = databaseArticles.map(article => {
      article.lastUpdate = article.last_update
      delete article.last_update
      return article
    })

    const data = addCommonData({
      articles: databaseArticles
    })

    res.render('pages/index.njk', data)
  })
}

const article = (req, res) => {
  database.getArticle(req.params.article).then(article => {
    if (article) {
      const data = addCommonData({
        title: article.title,
        date: article.publication_date,
        article: article.html
      })

      res.render('pages/article.njk', data)
    } else {
      notFound(req, res)
    }
  })
}

const debug = (req, res) => {
  const articleDirs = articles.getArticlesDirectories(paths.articles, 2)

  let articlesData = []
  for (const articleDir of articleDirs) {
    articlesData.push(articles.getArticleData(articleDir))
  }

  //s sort articles by publication_date descendant
  articlesData = articlesData.map(x => x.article)
  articlesData = lodash.sortBy(articlesData, 'lastUpdate')
  articlesData = lodash.reverse(articlesData)

  const data = addCommonData({
    articles: articlesData,
    debugUrlPrefix: 'debug/',
    debug: true
  })

  res.render('pages/index.njk', data)
}

const debugArticle = (req, res) => {
  let articleName = req.params.article

  let articlePath = articles.findPathToArticle(paths.articles, articleName, 2)
  if (!articlePath) {
    res.render('pages/404.njk')
    return
  }

  const articleData = articles.getArticleData(articlePath)
  const data = addCommonData({
    title: articleData.article.title,
    date: articleData.article.publicationDate,
    article: articleData.article.html,
    debug: true
  })

  res.render('pages/article.njk', data)
}

const rss = (req, res) => {
  database.getRSS().then(databaseArticles => {
    const data = {articles: databaseArticles}
    for (let i = 0; i < data.articles.length; i++) {
      data.articles[i].pubData = new Date(data.articles.publication_date).toGMTString()
    }

    res.type('text/xml')
    res.render('special/rss.njk', addCommonData(data))
  })
}

const robotsTxt = (req, res) => {
  res.type('text/plain')
  res.render('special/robots.txt.njk')
}

const humansTxt = (req, res) => {
  database.getHumansTxt().then(data => {
    const templateData = addCommonData({
      lastUpdate: new Date(data.last_update).toGMTString()
    })

    res.type('text/plain')
    res.render('special/humans.txt.njk', templateData)
  })
}

module.exports = {
  index,
  article,
  debug,
  debugArticle,
  rss,
  robotsTxt,
  humansTxt
}
