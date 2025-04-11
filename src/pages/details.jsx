import React from 'react';
import './Details.css'; // Import your CSS file for styling

function Details({ book }) {
  return (
    <div className="details-container">
      <header>
        <div className="header-content">
          <nav className="nav-left">
            <a href="/" className="nav-link">Home</a>
            <a href="#books" className="nav-link">Books for you</a>
            <a href="/my-reviews" className="nav-link">My Reviews</a>
            <a href="/addareview" className="nav-link">Add a Review</a>
          </nav>
          <div className="logo">
            <h1>Story Glimpse</h1>
          </div>
          <div className="nav-right">
            <a href="/login" className="login-button">Login</a>
          </div>
        </div>
      </header>

      <main>
        <h2 className="book-title">{book.title}</h2>
        <div className="book-content">
          <div className="book-image-container">
            <img src={book.image_url} alt={book.title} className="book-image" />
          </div>

          <div className="book-details">
            <h3>{book.title} by {book.author}</h3>
            <h5>Age Rating: {book.age_rating} Years</h5>
            <div className="description">
              <p>{book.description}</p>
            </div>
          </div>
        </div>

        <div className="review-image-container">
          {book.review_image_url && (
            <img src={book.review_image_url} alt="Review" className="review-image" />
          )}
        </div>
      </main>
    </div>
  );
}

export default Details;