import { useNavigate } from 'react-router-dom';

function HomeScreen(props) {
  const navigate = useNavigate();

  return (
    <div>
      <img
        style={{ width: '100%', height: '89vh' }}
        alt="background"
        src="https://res.cloudinary.com/dtexbsyml/image/upload/v1682996075/uda1gphitafo0qcaoack.jpg"
      />
      <div className="well-come">
        <h1> Welcome To Our</h1>
        <h1 className="welcome"> Page.</h1>
      </div>
      <div
        className="our-bazaar our-products"
        // onClick={() => navigate('/bazaar')}
        onClick={() => {
          props.changePage('bazaar');
          navigate('/bazaar');
        }}
      >
        <img
          // style={{ width: '300px', height: '300px' }}
          alt="shop"
          className="image shop"
          src="https://res.cloudinary.com/dtexbsyml/image/upload/v1682997074/wlfwhdqvvlysegn7c4ip.jpg"
        />
        <h1
          style={{
            color: 'white',
            marginLeft: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          Shopping
        </h1>
      </div>
      <div
        className="our-blogs our-products"
        // onClick={() => navigate('/blogs')}
        onClick={() => {
          props.changePage('blog');
          navigate('/blogs');
        }}
      >
        <img
          // style={{ width: '300px', height: '300px' }}
          className="image shop"
          alt="blog"
          src="https://res.cloudinary.com/dtexbsyml/image/upload/v1682997136/esh00pqvq97hkalzd3dz.jpg"
        />
        <h1
          style={{
            color: 'white',
            marginLeft: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          Bloging
        </h1>
      </div>
    </div>
  );
}
export default HomeScreen;
