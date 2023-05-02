import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Blog from '../models/blogModel.js';

const constantRouter = express.Router();

constantRouter.get('/', async (req, res) => {
  const categories = await Product.find().distinct('category');
  const brands = await Product.find().distinct('brand');
  const cityList = await Product.find().distinct('origin');
  const blogCategories = await Blog.find().distinct('category');
  cityList.sort();
  res.send({ categories, brands, cityList, blogCategories });
});

export default constantRouter;
