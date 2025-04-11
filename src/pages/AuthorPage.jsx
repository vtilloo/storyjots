import React from 'react';
import { useParams } from 'react-router-dom';

function AuthorPage() {
  const { id } = useParams();

  return (
    <div className="container">
      <h2>Author Page for Author ID: {id}</h2>
      <div className="book-list">
        {/* Example book item */}
        <div className="book-item">
          <img src="book-cover.jpg" alt="Book Cover" className="book-image" />
          <div className="book-title">Book Title</div>
          <div className="review-stars">★★★★☆</div>
        </div>
      </div>
    </div>
  );
}

export default AuthorPage;
