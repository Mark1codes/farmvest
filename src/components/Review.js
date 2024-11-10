import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { IoCartOutline, IoStar, IoStarOutline } from 'react-icons/io5';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

const Review = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [productList, setProductList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [quantity, setQuantity] = useState('1'); 
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [productReviews, setProductReviews] = useState([]);
  const [userProfilePic, setUserProfilePic] = useState(null);

  useEffect(() => {
    const loadFonts = async () => {
      setFontLoaded(true);
    };

    loadFonts();

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        fetchUserProfilePic(user.uid);
      } else {
        setUserId(null);
      }
    });

    const fetchProducts = async () => {
      const productsCollection = collection(db, 'products');
      const snapshot = await getDocs(productsCollection);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductList(products);
      setLoading(false);
    };

    fetchProducts();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const fetchUserProfilePic = async (userId) => {
    try {
      const docRef = db.collection('buyers').doc(userId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const { profilePic } = docSnap.data();
        setUserProfilePic(profilePic);
      }
    } catch (error) {
      console.error('Error fetching user profile picture:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!userId) {
      alert('Not Logged In: Please log in to add products to the cart.');
      return;
    }

    if (selectedProduct) {
      try {
        await addDoc(collection(db, 'cart'), {
          ...selectedProduct,
          userId,
          sellerId: selectedProduct.userId,
          quantity: parseInt(quantity),
          imageUrl: selectedProduct.imageUrls[0],
        });
        alert('Product Added: The product has been added to your cart.');
        setQuantity('1');
        closeProductDetails();
      } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Error: Failed to add product to cart.');
      }
    }
  };

  const handleReviewSubmit = async () => {
    if (!userId) {
      alert('Not Logged In: Please log in to submit a review.');
      return;
    }

    if (reviewText.trim() === '' || rating === 0) {
      alert('Invalid Input: Please provide a review and a rating.');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        productId: selectedProduct.id,
        userId,
        reviewText,
        rating,
        createdAt: new Date(),
        profilePic: userProfilePic,
      });
      alert('Review Submitted: Thank you for your feedback!');
      setReviewText('');
      setRating(0);
      fetchProductReviews(selectedProduct.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error: Failed to submit review.');
    }
  };

  const fetchProductReviews = async (productId) => {
    const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', productId));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProductReviews(reviews);
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setReviewText('');
    setRating(0);
    fetchProductReviews(product.id);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setProductReviews([]);
  };

  const filteredProducts = productList.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = (product) => (
    <div className="product-card" onClick={() => openProductDetails(product)} style={styles.productCard}>
      <img src={product.imageUrls[0]} alt={product.name} className="product-image" style={styles.productImage} />
      <h4 className="product-name" style={styles.productName}>{product.name}</h4>
      <p className="product-price" style={styles.productPrice}>₱{product.price.toFixed(2)}</p>
      <span className="see-more" style={styles.seeMore}>See more</span>
      <button className="add-button" onClick={(e) => { e.stopPropagation(); handleAddToCart(); }} style={styles.addButton}>
        <IoCartOutline size={24} />
      </button>
    </div>
  );

  if (!fontLoaded) {
    return <p className="loading-text" style={styles.loadingText}>Loading...</p>;
  }

  return (
    <div style={styles.mainContainer}>
      {selectedProduct ? (
        <div style={styles.detailsContainer}>
          <h2 style={styles.productTitle}>{selectedProduct.name}</h2>
          <img src={selectedProduct.imageUrls[0]} alt={selectedProduct.name} style={styles.productImageDetail} />
          <p style={styles.productPriceDetail}>₱{selectedProduct.price.toFixed(2)}</p>
          <p style={styles.productDescription}>{selectedProduct.description}</p>

          {/* Added details here */}
          <div style={styles.availableContainer}>
            <span style={styles.productQuantity}>Available: {selectedProduct.quantity}</span>
            <span style={styles.kgLabel}>kg</span>
          </div>
          <p style={styles.productAddress}>Address: {selectedProduct.address}</p>
          <p style={styles.productContactInfo}>Message me here: {selectedProduct.contactInfo || 'N/A'}</p>

          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            style={styles.quantityInput} 
          />
          <button onClick={handleAddToCart} style={styles.contactButton}>Add to Cart</button>
          <button onClick={closeProductDetails} style={styles.cancelButton}>Back</button>

          <div style={styles.reviewContainer}>
            <h3>Leave a Review</h3>
            <div style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} style={styles.starButton}>
                  {star <= rating ? <IoStar size={24} /> : <IoStarOutline size={24} />}
                </button>
              ))}
            </div>
            <textarea 
              value={reviewText} 
              onChange={(e) => setReviewText(e.target.value)} 
              placeholder="Write your review..." 
              style={styles.reviewInput}
            />
            <button onClick={handleReviewSubmit} style={styles.submitReviewButton}>Submit Review</button>
          </div>

          <h3>Customer Reviews</h3>
          <div style={styles.reviewsList}>
            {productReviews.length ? (
              productReviews.map(review => (
                <div key={review.id} style={styles.review}>
                  {review.profilePic && (
                    <img src={review.profilePic} alt="Profile" style={styles.profileImage} />
                  )}
                  <p style={styles.reviewRating}>Rating: {review.rating} / 5</p>
                  <p style={styles.reviewText}>{review.reviewText}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </div>
      ) : loading ? (
        <div style={styles.loadingSpinner}>Loading...</div>
      ) : (
        <>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search products..." 
            style={styles.searchInput}
          />
          <div style={styles.productList}>
            {filteredProducts.map(renderProduct)}
          </div>
        </>
      )}
    </div>
  );
};

// Styles
const styles = {
  mainContainer: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '10px',
    margin: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  productImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  productName: {
    fontSize: '1.1em',
    margin: '10px 0',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: '1em',
    color: '#4CAF50',
  },
  seeMore: {
    fontSize: '0.8em',
    color: '#007BFF',
  },
  addButton: {
    backgroundColor: '#FF6347',
    border: 'none',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2em',
    marginTop: '20px',
  },
  detailsContainer: {
    background: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  productImageDetail: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
  productPriceDetail: {
    fontSize: '1.5em',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: '0.9em',
    margin: '10px 0',
    color: '#555',
  },
  availableContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
  },
  productQuantity: {
    fontWeight: 'bold',
    marginRight: '5px',
  },
  kgLabel: {
    fontSize: '0.9em',
    color: '#555',
  },
  productAddress: {
    fontSize: '0.9em',
    marginTop: '10px',
    color: '#555',
  },
  productContactInfo: {
    fontSize: '0.9em',
    marginTop: '5px',
    color: '#555',
  },
  quantityInput: {
    width: '60px',
    textAlign: 'center',
    marginRight: '10px',
  },
  contactButton: {
    backgroundColor: '#0F6A2F',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    marginTop: '10px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    marginTop: '10px',
    cursor: 'pointer',
  },
  reviewContainer: {
    marginTop: '20px',
  },
  ratingContainer: {
    display: 'flex',
    marginBottom: '10px',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  reviewInput: {
    width: '100%',
    height: '60px',
    marginTop: '10px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    resize: 'none',
  },
  submitReviewButton: {
    backgroundColor: '#0F6A2F',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    cursor: 'pointer',
  },
  reviewsList: {
    marginTop: '20px',
  },
  review: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    marginRight: '10px',
  },
  reviewRating: {
    fontWeight: 'bold',
    margin: '0',
  },
  reviewText: {
    padding: '10px',
    margin: '5px 0 0 0',
  },
  loadingSpinner: {
    textAlign: 'center',
    fontSize: '1.5em',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #0F6A2F',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  productList: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

export default Review;