import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, isSellerOrAdmin, isSeller } from '../utils.js';
import Seller from '../models/sellerModel.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const { query } = req;
  const userCity = query.city || 'india';
  const cityFilter = userCity === 'india' ? {} : { origin: userCity };
  const products = await Product.find({ ...cityFilter });
  return res.send(products);
});

productRouter.post(
  '/',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    try {
      const newProduct = new Product({
        name: 'sample name ' + Date.now(),
        slug: 'sample-name-' + Date.now(),
        image: '/images/p1.jpg',
        price: 0,
        category: 'sample category',
        brand: 'sample brand',
        countInStock: 0,
        rating: 0,
        numReviews: 0,
        seller: req.seller,
        origin: req.seller.address.city,
        description: 'sample description',
      });
      const product = await newProduct.save();
      res.status(201).send({ message: 'Product Created', product });
    } catch (error) {
      res.status(401).send({ message: 'creation failed, please try again' });
    }
  })
);

productRouter.post(
  '/edit/:id',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findOne({
      _id: productId,
      seller: req.seller._id,
    });
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      product.seller = req.seller;
      product.origin = req.seller.address;
      const updatedProdeuct = await product.save();
      res.send({ product: updatedProdeuct, message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.post(
  '/new',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    try {
      const newProduct = new Product({
        name: req.body.name,
        slug: req.body.slug,
        price: req.body.price,
        image: req.body.image,
        images: req.body.images,
        category: req.body.category,
        brand: req.body.brand,
        countInStock: req.body.countInStock,
        description: req.body.description,
        seller: req.seller,
        origin: req.seller.address.city,
      });
      const product = await newProduct.save();
      return res.send({ product, message: 'Product Created successfully' });
    } catch (error) {
      console.log('aditya', error);
      return res.status(401).send({ message: 'Failed to create' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.status(201).send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      // if (product.reviews.find((x) => x.name === req.user.name)) {
      //   return res
      //     .status(400)
      //     .send({ message: 'You already submitted a review' });
      // }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review Created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

const PAGE_SIZE = 3;

productRouter.get(
  '/seller-admin',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    try {
      var products, countProducts;
      if (req.seller) {
        products = await Product.find({ seller: req.seller._id })
          .skip(pageSize * (page - 1))
          .limit(pageSize);
        countProducts = await Product.countDocuments({
          seller: req.seller._id,
        });
      } else {
        products = await Product.find()
          .skip(pageSize * (page - 1))
          .limit(pageSize);
        countProducts = await Product.countDocuments();
      }
      return res.status(200).send({
        products,
        countProducts,
        page,
        pages: Math.ceil(countProducts / pageSize),
      });
    } catch (error) {
      console.log('aditya', error);
      return res.status(401).send({ message: 'Some error occurs, try again' });
    }
  })
);

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const brand = query.brand || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';
    const city = query.city || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const brandFilter = brand && brand !== 'all' ? { brand } : {};
    const cityFilter = city && city !== 'india' ? { origin: city } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter,
      ...priceFilter,
      ...ratingFilter,
      ...cityFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter,
      ...priceFilter,
      ...ratingFilter,
      ...cityFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    const brands = await Product.find().distinct('brand');
    const cityList = await Product.find().distinct('origin');
    const blogCategories = await Blog.find().distinct('category');
    cityList.sort();
    res.send({ categories, brands, cityList });
  })
);

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.get(
  '/edit/:id',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.seller._id,
    });
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

export default productRouter;
