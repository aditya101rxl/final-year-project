import axios from 'axios';
import React from 'react';
import { useReducer } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import Blog from '../components/Blog';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, blogs: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function BlogsScreen() {
  const [{ loading, error, blogs }, dispatch] = useReducer(reducer, {
    blogs: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/blogs');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: 'FETCH_FAIL' });
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Blogs</title>
      </Helmet>
      <div className="blogs">
        <h2>All Blogs</h2>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : blogs.length === 0 ? (
          <MessageBox variant="success">No blogs founds</MessageBox>
        ) : (
          <Row>
            {blogs.map((blog) => (
              <Col key={blog.slug} sm={6} md={4} lg={3} className="mb-3">
                <Blog blog={blog}></Blog>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
