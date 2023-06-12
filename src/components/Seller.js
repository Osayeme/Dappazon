import close from '../assets/close.svg'
// Components

const Seller = ({ seller, togglePopSeller}) => {
    return (
        <div className='seller__section ' >
          
          
          <div className='card'>
            <div className='seller__image'>
              <img src={seller.image} alt="Item" />
            </div>
            <div className='seller__info'>
              <h4>{seller.name}</h4>
              <hr />
              <p>GigaChad is very, very based</p>
            </div>

          </div>

          <button onClick={togglePopSeller} className="product__close">
          <img src={close} alt="Close" />
          </button>
        </div>
    );
}

export default Seller;