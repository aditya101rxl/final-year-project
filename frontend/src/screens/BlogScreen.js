import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useReducer } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useParams } from 'react-router-dom';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, blog: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'COMMENT_REQUEST':
      return { ...state, loadingCreateComment: true };
    case 'COMMENT_SUCCESS':
      return { ...state, loadingCreateComment: false, blog: action.payload };
    case 'COMMENT_FAIL':
      return { ...state, loadingCreateComment: false, error: action.payload };
    case 'LIKE_REQUEST':
      return { ...state, loadingLike: true };
    case 'LIKE_SUCCESS':
      return { ...state, loadingLike: false, blog: action.payload };
    case 'LIKE_FAIL':
      return { ...state, loadingLike: false, error: action.payload };
    default:
      return state;
  }
};

export default function BlogScreen() {
  const [
    { loading, loadingCreateComment, loadingLike, error, blog },
    dispatch,
  ] = useReducer(reducer, {
    blog: null,
    loading: true,
    loadingCreateComment: false,
    loadingLike: false,
    error: '',
  });
  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { slug } = params;
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/blogs/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    fetchBlog();
  }, [slug]);

  const addNewComment = async (e) => {
    e.preventDefault();
    if (comment === '') {
      toast.error('Comment must be filled');
      return;
    }
    try {
      dispatch({ type: 'COMMENT_REQUEST' });
      const { data } = await axios.post(
        `/api/blogs/comment/${blog._id}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'COMMENT_SUCCESS', payload: data });
      toast.success('Comment success');
      setComment('');
    } catch (error) {
      dispatch({ type: 'COMMENT_FAIL', payload: getError(error) });
      toast.error(getError(error));
    }
  };

  const likeBlog = async () => {
    try {
      dispatch({ type: 'LIKE_REQUEST' });
      const { data } = await axios.put(`/api/blogs/like/${blog._id}`);
      dispatch({ type: 'LIKE_SUCCESS', payload: data });
      toast.success('Liked success');
    } catch (error) {
      dispatch({ type: 'LIKE_FAIL', payload: getError(error) });
      toast.error(getError(error));
    }
  };

  return (
    <div>
      <Helmet>
        <title>
          {loading ? 'loading...' : blog ? blog.title : 'Not Found'}
        </title>
      </Helmet>
      <div className="blogs">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <div>
            <h2 className="text-decoration-underline mb-3">{blog.title}</h2>
            <img
              src={blog.image}
              className="card-img-top img-fluid mb-5"
              style={{ height: '300px', width: '100%' }}
              alt={blog.title}
            />
            <div>
              {blog.topics.map((topic) => (
                <div>
                  <h4>{topic.title}</h4>
                  <p>{topic.body}</p>
                </div>
              ))}
            </div>
            <hr></hr>
            <div>
              <Button onClick={likeBlog} disabled={loadingLike}>
                👍
              </Button>{' '}
              {loadingLike && <LoadingBox />}
              Likes count : {blog.likeCount} ❤️ | Comments Count :{' '}
              {blog.comments.length} 💬
            </div>
            <hr></hr>
            {userInfo && (
              <div>
                <form onSubmit={addNewComment}>
                  <h4>Add new comment 💬</h4>
                  <FloatingLabel
                    controlId="floatingTextarea"
                    label="Comments"
                    className="mb-3"
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Leave a comment here"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </FloatingLabel>

                  <div className="mb-3">
                    <Button disabled={loadingCreateComment} type="submit">
                      Comment
                    </Button>
                    {loadingCreateComment && <LoadingBox></LoadingBox>}
                  </div>
                </form>
                <hr></hr>
              </div>
            )}
            <div>
              <h4>All Comments 💬</h4>
              {blog.comments.map((comment) => (
                <div style={{ border: '1px solid black' }} className="mb-2">
                  <h6>
                    <span className="text-decoration-underline">user</span> (👦)
                    : {comment.name}
                  </h6>
                  <p>
                    <span className="text-decoration-underline">comment</span>
                    {' : '}
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
