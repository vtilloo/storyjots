import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import AuthorPage from './pages/AuthorPage';
import AddBookPage from './pages/AddBookPage'; 
import AddReview from './pages/AddReview';
import AddReviewSearch from './pages/AddReviewSearch';
import ReviewDetailPage from './pages/ReviewDetailPage';
import MyReviews from './pages/MyReviews';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
        <Route path="/author/:id" element={<AuthorPage />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        <Route path="/add-book/:bookId" element={<AddBookPage />} />
        <Route path="/add-review/:id" element={<AddReview />} />
        <Route path="/add-review-search" element={<AddReviewSearch />} />
        <Route path="/review/:id" element={<ReviewDetailPage />} />
      </Routes>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
