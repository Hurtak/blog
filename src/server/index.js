'use strict'

const path = require('path')
const fs = require('fs-promise')
const chokidar = require('chokidar')

// const config = require('./config.js')
const debug = require('./debug.js')
const paths = require('./paths.js')
const articles = require('./articles.js')
const nunjucks = require('./nunjucks/env.js')

debug()

// compilation

console.log('Starting compile script')
const start = Date.now()

// 1) prepare dirs

fs.removeSync(paths.dist)
fs.mkdirSync(paths.dist)
fs.mkdirSync(paths.distStatic)

// 2) Static pages

// 2.1) 404
const html404 = nunjucks.render('pages/404.njk')
fs.writeFileSync(path.join(paths.dist, '404.html'), html404)

// 2.2) robots.txt
const htmlRobotsTxt = nunjucks.render('pages/robots.txt.njk')
fs.writeFileSync(path.join(paths.dist, 'robots.txt'), htmlRobotsTxt)

// 3) static files

// 3.1) styles
fs.symlinkSync(paths.styles, paths.distStyles)

// 3.2) scripts
fs.symlinkSync(paths.scripts, paths.distScripts)

// 3.3) images
fs.symlinkSync(paths.images, paths.distImages)

// 3.4) node_modules dir linked to /static/node_modules in development
fs.symlinkSync(paths.nodeModules, paths.distNodeModules)

// 4) gather articles data

const articleDirectories = articles.getArticlesDirectories(paths.articles)

const articlesData = []
for (const articlePath of articleDirectories) {
  // TODO: once async/await lands, make this concurrent
  articlesData.push(articles.getArticleData(articlePath))
}

// 5) index page
const htmlIndex = nunjucks.render('pages/index.njk', {articles: articlesData})
fs.writeFileSync(path.join(paths.dist, 'index.html'), htmlIndex)

// 6) articles
for (const article of articlesData) {
  // TODO: once async/await lands, make this concurrent

  // 6.1) article directory
  const folder = path.join(paths.dist, article.metadata.url)
  fs.mkdirSync(folder)

  // 6.2) article html
  const htmlArticle = nunjucks.render('pages/article.njk', article)
  fs.writeFileSync(path.join(folder, 'index.html'), htmlArticle)

  // 6.3) article images
  fs.symlinkSync(
    path.join(article.fs.path, paths.articleImages),
    path.join(folder, paths.articleImages)
  )

  // 6.4) article snippets
  fs.symlinkSync(
    path.join(article.fs.path, paths.articleSnippets),
    path.join(folder, paths.articleSnippets)
  )
}


console.log(`Compile script finished in ${Date.now() - start}ms`)

// function watch () {
//   const watcher = chokidar.watch(paths.static, {
//   })

//   watcher.on('change', (path, b) => {
//     console.log(path)
//     console.log(b)
//   })
// }

// const articleItems = fs.readdirSync(paths.articles)

// for (const item of articleItems) {
//   const isDirectory = fs.statSync(path.join(paths.articles, item)).isDirectory()
//   if (!isDirectory) continue

//   const articleName = item.substr(11) // TODO move this function into src/lib/articles
//   console.log(`Processing "${articleName}"`)
//   const distArticleDirName = path.join(paths.dist.articles, articleName)

//   fs.ensureDir(distArticleDirName)
//   fs.ensureDir(path.join(distArticleDirName, '/images'))

//   const imagesFolder = path.join(paths.articles, item, '/images')
//   const images = fs.readdirSync(imagesFolder)
//   for (const image of images) {
//     const from = path.join(imagesFolder, image)
//     const to = path.join(distArticleDirName, '/images', image)
//     fs.copySync(from, to)
//   }
// }




// articleHtml = htmlMinifier.minify(articleHtml, {
//   collapseWhitespace: true,
//   conservativeCollapse: true,
//   minifyCSS: true,
//   minifyJS: true,
//   removeComments: true,
//   removeRedundantAttributes: true,
//   sortAttributes: true,
//   sortClassName: true
// })

