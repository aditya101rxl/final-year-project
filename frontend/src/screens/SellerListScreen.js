import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
// import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loading: true };
    case 'UPDATE_LIST':
      const newList = state.sellers.map((seller) =>
        seller._id === action.payload._id ? action.payload : seller
      );
      return { ...state, sellers: newList, loading: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        sellers: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function SellerListScreen() {
  // const navigate = useNavigate();
  const [{ loading, error, sellers, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/sellers`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const verifySellerHandler = async (seller) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const { data } = await axios.get(`/api/sellers/verify/${seller._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success('seller verified successfully');
      dispatch({ type: 'UPDATE_LIST', payload: data });
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const deleteHandler = async (seller) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/sellers/${seller._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('seller deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };
  return (
    <div>
      <Helmet>
        <title>Sellers</title>
      </Helmet>
      <h1>Sellers</h1>

      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>MOBILE</th>
              <th>ADDRESS</th>
              <th>CATEGORIES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr
                key={seller._id}
                style={{
                  background: seller.isVerified ? '#b6ffb7' : '#ffaca3',
                }}
              >
                <td>
                  <b>{seller.user.name}</b>
                </td>
                <td>{seller.user.email}</td>
                <td>{seller.address.mobile}</td>
                <td>{seller.address.address}</td>
                <td>{seller.productCategories}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    disabled={seller.isVerified}
                    onClick={() => verifySellerHandler(seller)}
                  >
                    {seller.isVerified ? 'Verified' : 'Verify'}
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(seller)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
