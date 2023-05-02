import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function SellerScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [categories, setCategories] = useState('');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [mobile, setMobile] = useState('');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/sellers/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (data.isVerified) {
          setSubmissionMessage(
            'Congratulation, Your verification is successfull.'
          );
        } else {
          setSubmissionMessage('Successfully submitted, Form under process.');
        }
      } catch (error) {
        toast.error(getError(error));
        setSubmissionMessage('');
      }
    };
    fetchData();
  }, [userInfo, navigate]);
  const [country, setCountry] = useState(shippingAddress.country || '');
  const submitHandler = async (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        mobile,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        mobile,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );

    try {
      setIsLoading(true);
      const { data } = await axios.post(
        '/api/sellers/new',
        {
          productCategories: categories,
          address: shippingAddress,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success(data.message);
      setSubmissionMessage('Successfully submitted, Form goes under process.');
    } catch (error) {
      toast.error(getError(error));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [ctxDispatch, fullBox]);

  return (
    <div>
      <Helmet>
        <title>New Seller Application</title>
      </Helmet>

      {submissionMessage !== '' ? (
        <h1 style={{ color: 'green' }}>{submissionMessage}</h1>
      ) : (
        <div className="container small-container">
          <h1 className="my-3">New Seller Application Form</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="categories">
              <Form.Label>
                List all product categories with comma(,) seperated
              </Form.Label>
              <Form.Control
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="postalCode">
              <Form.Label>Postal Code</Form.Label>
              <Form.Control
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="country">
              <Form.Label>Country</Form.Label>
              <Form.Control
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="mobile">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Button
                id="chooseOnMap"
                type="button"
                variant="light"
                onClick={() => navigate('/map')}
              >
                Choose Location On Map
              </Button>
              {shippingAddress.location && shippingAddress.location.lat ? (
                <div>
                  LAT: {shippingAddress.location.lat}
                  LNG:{shippingAddress.location.lng}
                </div>
              ) : (
                <div>No location</div>
              )}
            </div>

            {isLoading ? (
              <LoadingBox />
            ) : (
              <div className="mb-3">
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </div>
            )}
          </Form>
        </div>
      )}
    </div>
  );
}
