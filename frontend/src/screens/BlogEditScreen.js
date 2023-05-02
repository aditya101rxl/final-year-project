import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export default function BlogEditScreen() {
  const navigate = useNavigate();
  const params = useParams(); // /product/:id
  const { id: blogId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: false,
      error: '',
    });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/blogs/edit/${blogId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setImage(data.image);
        setTopics(data.topics);
        console.log('aditya', data.topics);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (blogId) {
      fetchData();
    }
  }, [blogId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const url = blogId ? `/api/blogs/edit/${blogId}` : `/api/blogs`;

      const blog = {
        title,
        description,
        category,
        image,
        topics,
      };
      const { data } = await axios.post(url, blog, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success(data.message);
      navigate(`/blog/${data.blog.slug}`);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });

      if (forImages) {
        // setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success('Image uploaded successfully. click Update to apply it');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };
  const addTopicHandler = () => {
    setTopics([...topics, { id: Date.now().toString(), title: '', body: '' }]);
  };

  const updateTopic = (topic, e, field) => {
    setTopics(
      topics.map((t) => {
        if (t.id === topic.id) {
          if (field === 'title') {
            topic.title = e.target.value;
          }
          if (field === 'body') {
            topic.body = e.target.value;
          }
          return topic;
        }
        return t;
      })
    );
  };

  const removeTopic = (topic) => {
    setTopics(topics.filter((t) => t.id !== topic.id));
  };
  return (
    <Container className="small-container">
      <Helmet>
        {blogId ? <title>Edit Blog ${blogId}</title> : <title>New Blog</title>}
      </Helmet>
      {blogId ? <h1>Edit Blog {blogId}</h1> : <h1>Create New Blog</h1>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Blog heading</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image File</Form.Label>
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="imageFile">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="additionalImage">
            <Form.Label>Topics</Form.Label>
            {topics.length === 0 && <MessageBox>No topics</MessageBox>}
            <ListGroup variant="flush">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-2 mb-2"
                  style={{
                    border: '1px solid gray',
                    borderRadius: '8px',
                    backgroundColor: 'lightblue',
                  }}
                >
                  <Form.Group className="mb-3" controlId="imageFile">
                    <Form.Label>Topic title</Form.Label>
                    <Form.Control
                      type="text"
                      value={topic.title}
                      onChange={(e) => updateTopic(topic, e, 'title')}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="imageFile">
                    <Form.Label>Topic description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={topic.body}
                      rows={2}
                      onChange={(e) => updateTopic(topic, e, 'body')}
                    />
                  </Form.Group>
                  <Button variant="danger" onClick={() => removeTopic(topic)}>
                    remove <i className="fa fa-times-circle"></i>
                  </Button>
                </div>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="additionalTopics">
            <Form.Label style={{ marginRight: '16px' }}>
              Add Topics:{' '}
            </Form.Label>
            <Button variant="light" onClick={addTopicHandler}>
              <i className="fa-solid fa-plus-large"></i> +
            </Button>
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              {blogId ? 'Update' : 'Create'}
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
