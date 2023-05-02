import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Address from '../models/AddressModel.js';

import {
  isAuth,
  isAdmin,
  generateToken,
  baseUrl,
  mailgun,
  sendMail,
} from '../utils.js';
import nodemailer from 'nodemailer';
import Seller from '../models/sellerModel.js';

const sellerRoute = express.Router();

sellerRoute.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const sellers = await Seller.find()
      .populate('user')
      .populate('address')
      .sort({ createdAt: -1 });
    res.send(sellers);
  })
);

sellerRoute.post(
  '/new',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newSellerAddress = await Address(req.body.address);
    const sellerAddress = await newSellerAddress.save();
    const newSeller = new Seller({
      user: req.user._id,
      productCategories: req.body.productCategories,
      address: sellerAddress._id,
    });
    await newSeller.save();
    res.status(201).send({
      message: 'Seller request sent to Admin, will notify you once verified',
    });
  })
);

sellerRoute.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const seller = await Seller.findOne({ user: req.params.id });
    if (seller) {
      return res.status(201).send(seller);
    } else {
      return res.status(401).send({
        message: `Your haven't yet applied for application or your application may have been rejected`,
      });
    }
  })
);

sellerRoute.get(
  '/verify/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.params.id)
      .populate('user')
      .populate('address');
    const user = await User.findById(seller.user);
    try {
      user.isSeller = true;
      seller.isVerified = true;
      await user.save();
      await seller.save();
      res.status(201).send(seller);
    } catch (error) {
      res.status(401).send({ message: 'Requiest failed, try again' });
    }
  })
);

sellerRoute.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const seller = Seller.findById(req.params.id);
    await seller.remove();
    const user = User.findById(seller.user);
    user.isSeller = false;
    await user.save();
    return res.status(201).send({ message: 'deleted successfully' });
  })
);

export default sellerRoute;
