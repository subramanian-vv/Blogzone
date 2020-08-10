const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

//User model
const User = require('../models/User');

//Article model
const Article = require('../models/Article');

//Feed
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

//User articles
router.get('/articles', ensureAuthenticated, async function (req, res) {
    const articles = await Article.find({ email: req.user.email }).sort({ createdDate: 'desc' });
    res.render('myarticles', { 
        name: req.user.name,
        articles: articles
     });
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

//Markdown cheatsheet
router.get('/help', ensureAuthenticated, function (req, res) {
    res.render('markdown');
});

//New article
router.get('/new', ensureAuthenticated, function (req, res) {
    res.render('new', { article: new Article() });
});

//Search feature
router.get('/search', ensureAuthenticated, function (req, res) {
    res.redirect('/user/feed');
});

router.post('/search', async function(req,res) {
    const { search } = req.body;
    const articles = await Article.find().sort({ createdDate: 'desc' });
    const users = await User.find().sort({ date: 'desc' });

    for(var i = 0; i < articles.length; i++) {
        if (articles[i].name.toLowerCase() != search.toLowerCase()) {
            articles.splice(i,1);
            i -= 1;
        }
    }
    for(var j = 0; j < users.length; j++) {
        if (users[j].name.toLowerCase() != search.toLowerCase()) {
            users.splice(j,1);
            j -= 1;
        }
    }

    res.render('search', {
        name: req.user.name,
        search,
        articles: articles,
        users: users
    });
});

//Shows articles from feed
router.get('/feed/:slug', async function (req, res) {
    const article = await Article.findOne({ slug: req.params.slug });
    if(article == null) {
        res.redirect('/user/feed');
    }
    res.render('show', {article: article, name: req.user.name});
});

//Shows user created articles
router.get('/articles/:slug', async function (req, res) {
    const article = await Article.findOne({ slug: req.params.slug });
    if(article == null) {
        res.redirect('/user/articles');
    }
    res.render('show', {article: article, name: req.user.name});
});

//Deletes user created articles
router.delete('/articles/:id', async function (req, res) {
    await Article.findByIdAndDelete(req.params.id);
    req.flash('error_msg', 'The article has been deleted');
    res.redirect('/user/articles');
});

//Edit feature
router.get('/articles/edit/:id', async function (req, res) {
    const article = await Article.findById(req.params.id);
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
    }
});

//Handling 404 errors
router.get('*', function (req, res) { 
    res.render('404'); 
});

module.exports = router;