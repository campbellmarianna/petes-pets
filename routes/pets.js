// MODELS
const Pet = require('../models/pet');
// UPLOADING TO AWS S3
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const client = require('../lib/uploader').petClient;

// PET ROUTES
module.exports = (app) => {
    // INDEX PET => index.js

    // NEW PET
    app.get('/pets/new', (req, res) => {
      res.render('pets-new');
    });

    // CREATE PET
    app.post('/pets', upload.single('avatar'), async(req, res, next) => {
        console.log(req.file)
        var pet = new Pet(req.body);
        pet.save(function (err) {
            // if (err) {return res.status(400).send({ err }) };
            if (req.file) {
                client.upload(req.file.path, {}, function (err, versions, meta) {
                    // STATUS OF 400 FOR VALIDATIONS
                    if (err) {return res.status(400).send({ err }) };

                    const imgUrl = versions[0].url.split('-');
                    imgUrl.pop();
                    imgUrl.join('-');
                    pet.avatarUrl = imgUrl;
                    pet.save();

                    res.send({ pet: pet });
                });
            } else {
                res.send({ pet: pet});
            }
        });
    });

    // CREATE PET (ASYNC)
    // app.post('/pets', upload.single('avatar'), async (req, res) => {
    //     var pet = new Pet(req.body);
    //
    //     try {
    //       var pet = await pet.save();
    //       if (req.file) {
    //           client.upload(req.file.path, {}, function (err, versions, meta) {
    //               // STATUS OF 400 FOR VALIDATIONS
    //               if (err) {return res.status(400).send({ err }) };
    //
    //               versions.forEach(function (image) {
    //                   var urlArray = image.url.split('-');
    //                   urlArray.pop();
    //                   var url = urlArray.join('-');
    //                   pet.avatarUrl = url;
    //                   pet.save();
    //               });
    //
    //               res.send({ pet: pet });
    //           });
    //          res.send({ pet });
    //      }
    //     } catch (err) {
    //       res.status(400).send(err.errors);
    //     }
    // });

    // SHOW PET
    app.get('/pets/:id', (req, res) => {
      Pet.findById(req.params.id).exec((err, pet) => {
        res.render('pets-show', { pet: pet });
      });
    });

    // EDIT PET
    app.get('/pets/:id/edit', (req, res) => {
      Pet.findById(req.params.id).exec((err, pet) => {
        res.render('pets-edit', { pet: pet });
      });
    });

    // UPDATE PET
    app.put('/pets/:id', (req, res) => {
      Pet.findByIdAndUpdate(req.params.id, req.body)
        .then((pet) => {
          res.redirect(`/pets/${pet._id}`)
        })
        .catch((err) => {
          // Handle Errors
        });
    });

    // DELETE PET
    app.delete('/pets/:id', (req, res) => {
      Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
        return res.redirect('/')
      });
    });

    // SEARCH PET
    app.get('/search', (req, res) => {
        Pet
            .find(
                { $text : { $search : req.query.term } },
                { score : {$meta: "textScore" } }
            )
            .sort({ score : { $meta : 'textScore' } })
            .limit(20)
            .exec(function(err, pets) {
                if (err) { return res.status(400).send(err) }

                if (req.header('Content-Type') == 'application/json') {
                    return res.json({ pets: pets });
                } else {
                    return res.render('pets-index', { pets: pets, term: req.query.term });
                }
            });
    });

    // PURCHASE PET
    app.post('/pets/:id/purchase', (req, res) => {
        console.log('req.body:', req.body);
        // Set your secret key: remember to change this to your live secret key in production
        // See your keys here: https://dashboard.stripe.com/account/apikeys
        var stripe = require("stripe")(process.env.PRIVATE_STRIPE_API_KEY);

        // Token is created using Checkout or Elements!
        // Get the payment token ID submitted by the form:
        const token = req.body.stripeToken; // Using Express

        // req.body.petId can become null through seeding,
        // this way we'll insure we use a non-null value
        let petId = req.body.petId || req.params.id;
        Pet
            .findById(petId) // finds the pet
            .exec((err, pet) => {
              if(err) {
                console.log('Error: ' + err);
                res.redirect(`/pets/${req.params.id}`);
              }
              const charge = stripe.charges.create({
                amount: pet.price * 100,
                currency: 'usd',
                description: `Example charge`,
                source: token,
              })
              .then((chg) => {
                res.redirect(`/pets/${req.params.id}`);
                })
              })
              .catch(err => {
                console.log('Error: ' + err);
              }); // end of catch
        // })
    });
      // });
    // something@something.something
    // 4242 4242 4242 4242
    // 08/21
    // 393
    // 94102
};
