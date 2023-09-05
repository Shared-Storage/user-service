const logger = require("./../../../util/logger");
const Product = require("./../model/product");

exports.create = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;

  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  });

  product
    .save()
    .then((result) => {
      logger.info(result);
      res.status(201).send({ created: true });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send({ created: false });
    });
};

exports.getAll = (req, res, next) => {
  Product.find()
    .then((result) => {
      res.status(200).send({ result: result });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send({ err: "Couldn't extract" });
    });
};
