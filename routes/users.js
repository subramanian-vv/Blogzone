const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

//User model
const User = require('../models/User');

//Article model
const Article = require('../models/Article');
const { restart } = require('nodemon');

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

router.get('/myarticles', ensureAuthenticated, async function (req, res) {
    const articles = await Article.find({ email: req.user.email }).sort({ createdDate: 'desc' });
    res.render('myarticles', { 
        name: req.user.name,
        articles: articles
     });
});

router.get('/new', ensureAuthenticated, function (req, res) {
    res.render('new', { article: new Article() });
});

router.post('/myarticles', function(req, res) {
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
            res.redirect('/user/myarticles');
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

router.get('/:id', async function (req, res) {
    const article = await Article.findById(req.params.id);
    res.render('show', {article: article});
})

module.exports = router;