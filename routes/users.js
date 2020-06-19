const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

//User model
const User = require('../models/User');

//Article model
const Article = require('../models/Article');

router.get('/', ensureAuthenticated, async function (req, res) {
    const articles = await Article.find({ email: req.user.email });
    res.render('dashboard', {
        name: req.user.name,
        articles: articles
    });
});

router.get('/new', ensureAuthenticated, function (req, res) {
    res.render('new', { article: new Article() });
});

router.post('/', function(req, res) {
    const { title, description, content } = req.body;
    const email = req.user.email;

    if(!description || !content || !title)
    {
        req.flash('error_msg', 'Please fill all the fields');
        res.redirect('/dashboard/new');
    }

    const newArticle = new Article({
        title,
        description,
        content,
        email
    });

    newArticle.save()
        .then(function(article) {
            req.flash('success_msg', 'The article has been saved');
            res.redirect('/dashboard');
        })
        .catch(function(err) {
            console.log(err);
            req.flash('error_msg', 'Fill all the fields');
            res.render('/dashboard/new', {
                title,
                description, 
                content
            });
        });
}); 

module.exports = router;