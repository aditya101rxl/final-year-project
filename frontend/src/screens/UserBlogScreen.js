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
import { useContext } from 'react';
import { Store } from '../Store';
import Button from 'react-bootstrap/esm/Button';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, blogs: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return {
        ...state,
        loadingDelete: false,
        error: action.payload,
        successDelete: false,
      };
    default:
      return state;
  }
};

export default function UserBlogScreen() {
  const [{ loading, error, blogs, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      blogs: [],
      loading: true,
      successDelete: false,
      error: '',
    });

  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/blogs/my/all', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: 'FETCH_FAIL' });
      }
    };
    fetchBlogs();
  }, [userInfo, successDelete]);

  const deleteHandle = async (blog) => {
    console.log('aditya', blog);
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/blogs/${blog._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success('Deleted successfully');
      dispatch({ type: 'DELETE_SUCCESS' });
    } catch (error) {
      toast.error('Deletion failed');
      dispatch({ type: 'DELETE_FAIL' });
    }
  };

  return (
    <div>
      <Helmet>
        <title>My all blogs</title>
      </Helmet>
      <div className="blogs">
        <h2>My All Blogs</h2>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : blogs.length === 0 ? (
          <MessageBox variant="success">
            You have not created any blogs.
          </MessageBox>
        ) : (
          <Row>
            {blogs.map((blog) => (
              <Col key={blog.slug} sm={6} md={4} lg={3} className="mb-3">
                <Blog blog={blog}></Blog>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <Button onClick={() => navigate(`/blog/edit/${blog._id}`)}>
                    edit
                  </Button>
                  <Button onClick={() => deleteHandle(blog)}>Delete</Button>
                  {loadingDelete && <LoadingBox />}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
