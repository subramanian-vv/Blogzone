const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

//User model
const User = require('../models/User');

//Article model
const Article = require('../models/Article');
const { restart } = require('nodemon');
const e = require('express');

router.get('/feed', ensureAuthenticated, async function (req, res) {
    const articles = await Article.find().sort({ createdDate: 'desc' });
    for(var i = 0; i < articles.length; i++) {
        if(articles[i].email == req.user.email) {
            articles.splice(i,1);
            i -= 1;
        }
}
    res.render('dashboard', {
        name: req.user.name,
        articles: articles
    });
});

router.get('/articles', ensureAuthenticated, async function (req, res) {
    const articles = await Article.find({ email: req.user.email }).sort({ createdDate: 'desc' });
    res.render('myarticles', { 
        name: req.user.name,
        articles: articles
     });
});

router.get('/new', ensureAuthenticated, function (req, res) {
    res.render('new', { article: new Article() });
});

router.post('/articles', function(req, res) {
    const { title, description, content } = req.body;
    const email = req.user.email;
    const name = req.user.name;

    if(!description || !content || !title)
    {
        req.flash('error_msg', 'Please fill all the fields');
        res.redirect('/user/new');
    }

    const newArticle = new Article({
        title,
        description,
        content,
        email,
        name
    });

    newArticle.save()
        .then(function(article) {
            req.flash('success_msg', 'The article has been saved');
            res.redirect('/user/articles');
        })
        .catch(function(err) {
            console.log(err);
            req.flash('error_msg', 'Fill all the fields');
            res.render('/user/new', {
                title,
                description, 
                content,
            });
        });
}); 

router.get('/feed/:slug', async function (req, res) {
    const article = await Article.findOne({ slug: req.params.slug });
    if(article == null) {
        res.redirect('/user/feed');
    }
    res.render('show', {article: article});
});

router.get('/articles/:slug', async function (req, res) {
    const article = await Article.findOne({ slug: req.params.slug });
    if(article == null) {
        res.redirect('/user/feed');
    }
    res.render('show', {article: article});
});

router.delete('/articles/:id', async function (req, res) {
    await Article.findByIdAndDelete(req.params.id);
    req.flash('error_msg', 'The article has been deleted');
    res.redirect('/user/articles');
});

router.get('/articles/edit/:id', async function (req, res) {
    const article = await Article.findById(req.params.id);
    console.log(article.title);
    res.render('edit', { 
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        article: article });
});

router.put('/articles/:id', async function (req, res) {
    req.article = await Article.findById(req.params.id);
    
    let article = req.article;
    article.title = req.body.title;
    article.description = req.body.description;
    article.content = req.body.content;
    try {
        article = await article.save();
        console.log("Done");
        req.flash('success_msg', 'The article has been updated');
        res.redirect('/user/articles');
    } 
    catch (err) {
        console.log(err);
        res.render('edit', { 
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            article: article });
        req.flash('error_msg', 'Please fill all the fields');
        console.log("ERRORRRRRRRRRRRRRR!!!");
    }
});

module.exports = router;