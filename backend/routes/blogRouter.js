import express from 'express';
import Blog from '../models/blogModel.js';
import { isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const blogRouter = express.Router();

blogRouter.get('/', async (req, res) => {
  const blogs = await Blog.find(
    {},
    { title: 1, description: 1, slug: 1, image: 1, createdAt: 1, likeCount: 1 }
  );
  res.send(blogs);
});

blogRouter.get('/:slug', async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (blog) {
    res.send(blog);
  } else {
    res.status(500).send({ message: 'Blog not found' });
  }
});

blogRouter.get(
  '/my/all',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const blogs = await Blog.find({ user: req.user._id });
    if (blogs) {
      res.send(blogs);
    } else {
      res.status(500).send({ message: 'Blog not found' });
    }
  })
);

const PAGE_SIZE = 3;

blogRouter.get('/search/blogs', async (req, res) => {
  const { query } = req;
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const order = query.order || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          title: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};

  const topicsFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          'topics.title': {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};
  const categoryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          category: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};
  const sortOrder =
    order === 'oldest'
      ? { createdAt: 1 }
      : order === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  // const blogs = await Blog.aggregate([
  //   {
  //     $unwind: '$topics',
  //   },
  //   {
  //     $match: {
  //       $or: [{ ...queryFilter }, { ...topicsFilter }, { ...categoryFilter }],
  //     },
  //   },
  //   {
  //     $sort: {
  //       ...sortOrder,
  //     },
  //   },
  //   { $skip: pageSize * (page - 1) },
  //   { $limit: pageSize },
  // ]);
  const blogs = await Blog.find({
    ...queryFilter,
  })
    .sort(sortOrder)
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const countBlogs = await Blog.countDocuments({
    ...queryFilter,
  });
  res.send({
    blogs,
    countBlogs,
    page,
    pages: Math.ceil(countBlogs / pageSize),
  });
});

blogRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const newBlog = new Blog({
        user: req.user._id,
        title: req.body.title,
        description: req.body.description,
        slug: req.body.title.replace(/ /g, '_') + '_' + Date.now(),
        image: req.body.image || 'https://i.ibb.co/ZXwTfW2/8.jpg',
        category: req.body.category,
        likeCount: 0,
      });

      req.body.topics.map((topic) => {
        const newTopic = {
          title: topic.title,
          body: topic.body,
        };
        newBlog.topics.push(newTopic);
      });

      const blog = await newBlog.save();
      return res.send({ blog, message: 'successfully created' });
    } catch (error) {
      console.log('aditya', error);
      return res
        .status(401)
        .send({ message: 'Failed to create new blog, please try again' });
    }
  })
);

blogRouter.get(
  '/edit/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const blog = await Blog.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (blog) {
        return res.send(blog);
      } else {
        return res.status(400).send({ message: 'You are not allowed to edit' });
      }
    } catch (error) {
      return res
        .status(500)
        .send({ message: 'some error occur, please try again' });
    }
  })
);

blogRouter.post(
  '/edit/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const blog = await Blog.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (blog) {
        blog.title = req.body.title;
        blog.description = req.body.description;
        blog.image = req.body.image;
        blog.topics = [];
        req.body.topics.map((topic) => {
          const newTopic = {
            title: topic.title,
            body: topic.body,
          };
          blog.topics.push(newTopic);
        });
        const updatedBlog = await blog.save();
        return res.send({ blog: updatedBlog, message: 'updated created' });
      } else {
        return res.status(400).send({ message: 'You are not allowed to edit' });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ message: 'some error occur, please try again' });
    }
  })
);

blogRouter.put('/like/:id', async (req, res) => {
  try {
    await Blog.updateOne({ _id: req.params.id }, { $inc: { likeCount: 1 } });
    const blog = await Blog.findById(req.params.id);
    res.status(201).send(blog);
  } catch (error) {
    res.status(500).send({ message: 'failed' });
  }
});

/** {
  "title": "The Boys",
  "topics": [
    {
      "title": "About the boys",
      "body": "The Boys is an American superhero television series developed by Eric Kripke for Amazon Prime Video. Based on the comic book of the same name by Garth Ennis and Darick Robertson, it follows the eponymous team of vigilantes as they combat superpowered individuals who abuse their abilities.",
      "image": ""
    },
    {
      "title": "Why the boys",
      "body": "The Boys isn’t subtle. Amazon’s hit superhero adaptation has been taking shots at the entire political spectrum since its debut, happy to poke fun at the cynical exploitation of rainbow capitalism, America’s toxic gun culture, and the rise of dangerous rhetoric in the current social landscape. It’s both a parody of the genre and a blunt dissection of our own world.",
      "image": ""
    }
  ]
} */

blogRouter.post(
  '/comment/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const newComment = {
        user: req.user._id,
        name: req.user.name,
        comment: req.body.comment,
      };
      await Blog.updateOne(
        { _id: req.params.id },
        { $push: { comments: { ...newComment } } }
      );
      const blog = await Blog.findById(req.params.id);
      res.send(blog);
    } catch (error) {
      res.status(401).send({ message: 'commented failed' });
    }
  })
);

blogRouter.delete(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const blog = await Blog.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (blog) {
        await blog.remove();
        return res.status(200).send({ message: 'Blog deleted successfully' });
      } else {
        return res
          .status(400)
          .send({ message: 'You are not allowed to delete' });
      }
    } catch (error) {
      res.status(401).send({ message: 'deletion failed' });
    }
  })
);

export default blogRouter;
