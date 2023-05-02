import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import BazaarScreen from './screens/BazaarScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import MapScreen from './screens/MapScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import BlogsScreen from './screens/BlogsScreen';
import SellerScreen from './screens/SellerScreen';
import { Navigate } from 'react-router-dom';
import SellerListScreen from './screens/SellerListScreen';
import SellerRoute from './components/SellerRoute';
import BlogScreen from './screens/BlogScreen';
import BlogEditScreen from './screens/BlogEditScreen';
import UserBlogScreen from './screens/UserBlogScreen';
import BlogSearchScreen from './screens/BlogSearchScreen';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo, cityList, userShopCity } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  // const [currentLocation, setCurrentLocation] = useState('home');

  const [isHomePage, setIsHomePage] = useState(
    localStorage.getItem('page_location') &&
      localStorage.getItem('page_location') === 'home'
      ? true
      : false
  );
  let userType =
    userInfo && userInfo.isAdmin
      ? 'admin'
      : userInfo && userInfo.isSeller
      ? 'seller'
      : 'user';

  const setPageLocation = (page) => {
    if (page === 'home') {
      setIsHomePage(true);
    } else {
      setIsHomePage(false);
    }
    localStorage.setItem('page_location', page);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/constants`);
        setCategories(data.categories);
        setBrands(data.brands);
        setBlogCategories(data.blogCategories);
        ctxDispatch({ type: 'SET_CITYLIST', payload: data.cityList });
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
    if (window.location.pathname === '/') {
      return localStorage.setItem('page_location', 'home');
    }
    if (window.location.pathname.includes('/blog')) {
      return localStorage.setItem('page_location', 'blog');
    }
    if (window.location.pathname.includes('/bazaar')) {
      return localStorage.setItem('page_location', 'bazaar');
    }
  }, [ctxDispatch]);

  const onSelect = (e) => {
    ctxDispatch({ type: 'CHANGE_CITY', payload: e.target.value });
  };

  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox
            ? 'site-container d-flex flex-column full-box'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>
              <LinkContainer to="/">
                <Navbar.Brand onClick={() => setPageLocation('home')}>
                  Home
                </Navbar.Brand>
              </LinkContainer>
              <LinkContainer to="/bazaar">
                <Navbar.Brand onClick={() => setPageLocation('bazaar')}>
                  Bazaar
                </Navbar.Brand>
              </LinkContainer>
              <LinkContainer to="/blogs">
                <Navbar.Brand onClick={() => setPageLocation('blog')}>
                  Blogs
                </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                {/* <SelectCity /> */}
                {!isHomePage ? (
                  <>
                    <div className="select-city">
                      <select className="form-select" onChange={onSelect}>
                        <option key="selected" selected value={userShopCity}>
                          {userShopCity}
                        </option>
                        <hr></hr>
                        {cityList &&
                          cityList.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div style={{ width: '16px' }}></div>
                    <SearchBox />
                  </>
                ) : (
                  <div className="w-50"></div>
                )}
                <Nav className="me-auto  w-50  justify-content-end">
                  <Link to="/cart" className="nav-link">
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      {userInfo && !userInfo.isAdmin && !userInfo.isSeller && (
                        <LinkContainer to="/seller/new">
                          <NavDropdown.Item>Apply for Seller</NavDropdown.Item>
                        </LinkContainer>
                      )}
                      <LinkContainer to="/blog/new">
                        <NavDropdown.Item>Create blog</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/blogs/my/all">
                        <NavDropdown.Item>My Blog</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}
                  {userInfo && (userInfo.isAdmin || userInfo.isSeller) && (
                    <NavDropdown title={userType} id="admin-nav-dropdown">
                      <LinkContainer
                        to={
                          userType === 'admin'
                            ? '/admin/dashboard'
                            : '/seller/dashboard'
                        }
                      >
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer
                        to={
                          userType === 'admin'
                            ? '/admin/products'
                            : '/seller/products'
                        }
                      >
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      {userInfo.isSeller && (
                        <LinkContainer to="/seller/product/new">
                          <NavDropdown.Item>Add Product</NavDropdown.Item>
                        </LinkContainer>
                      )}
                      <LinkContainer
                        to={
                          userType === 'admin'
                            ? '/admin/orders'
                            : '/seller/orders'
                        }
                      >
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      {userInfo.isAdmin && (
                        <LinkContainer to="/admin/users">
                          <NavDropdown.Item>Users</NavDropdown.Item>
                        </LinkContainer>
                      )}
                      {userInfo.isAdmin && (
                        <LinkContainer to="/admin/sellers">
                          <NavDropdown.Item>Sellers</NavDropdown.Item>
                        </LinkContainer>
                      )}
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <div>
              <h2>
                Your Bazaar{' '}
                <span
                  style={{ color: 'tomato', cursor: 'pointer' }}
                  onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
                >
                  X
                </span>
              </h2>
              <hr></hr>
            </div>
            <Nav.Item>
              <strong>Product Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{ pathname: '/search', search: `category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
            <Nav.Item>
              <strong>Product Brands</strong>
            </Nav.Item>
            {brands.map((brand) => (
              <Nav.Item key={brand}>
                <LinkContainer
                  to={{ pathname: '/search', search: `brand=${brand}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{brand}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
            <Nav.Item>
              <strong>Blog Categories</strong>
            </Nav.Item>
            {blogCategories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{
                    pathname: 'blogs/search',
                    search: `category=${category}`,
                  }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <main>
          <div className={isHomePage ? '' : 'container mt-3'}>
            <Routes>
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/blogs/search" element={<BlogSearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route
                path="/forget-password"
                element={<ForgetPasswordScreen />}
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPasswordScreen />}
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/shipping"
                element={<ShippingAddressScreen />}
              ></Route>
              <Route path="/payment" element={<PaymentMethodScreen />}></Route>
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/sellers"
                element={
                  <AdminRoute>
                    <SellerListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route path="/seller/new" element={<SellerScreen />} />
              <Route
                path="/seller/dashboard"
                element={
                  <SellerRoute>
                    <DashboardScreen />
                  </SellerRoute>
                }
              ></Route>
              <Route
                path="/seller/products"
                element={
                  <SellerRoute>
                    <ProductListScreen />
                  </SellerRoute>
                }
              ></Route>
              <Route
                path="/seller/product/edit/:id"
                element={
                  <SellerRoute>
                    <ProductEditScreen />
                  </SellerRoute>
                }
              ></Route>
              <Route
                path="/seller/product/new"
                element={
                  <SellerRoute>
                    <ProductEditScreen />
                  </SellerRoute>
                }
              ></Route>
              <Route
                path="/seller/orders"
                element={
                  <SellerRoute>
                    <OrderListScreen />
                  </SellerRoute>
                }
              ></Route>
              <Route
                path="/"
                element={<HomeScreen changePage={setPageLocation} />}
              />
              <Route path="/bazaar" element={<BazaarScreen />} />
              <Route path="/blogs" element={<BlogsScreen />} />
              <Route path="/blogs/my/all" element={<UserBlogScreen />} />
              <Route path="/blog/:slug" element={<BlogScreen />} />
              <Route path="/blog/new" element={<BlogEditScreen />} />
              <Route path="/blog/edit/:id" element={<BlogEditScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <footer>
          <div className="text-center">All rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
