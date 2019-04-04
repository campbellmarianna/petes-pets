const Pet = require('../models/pet');

module.exports = (app) => {

  /* GET home page. */
  app.get('/', (req, res) => {
    Pet.paginate().then((result) => {
      res.render('pets-index', { pets: rsults.docs });
    });
  });
}
