function homepage(req, res, next) {
    res.render('index', {
        title: "Hii",
        ballots: []
    });
}

module.exports = {
    homepage: homepage
}