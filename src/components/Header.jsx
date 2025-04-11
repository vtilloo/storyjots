import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import './Header.css';

function Header({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });

      if (error) {
        console.error("Sign in error:", error.message);
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('books')
          .select('id, title, author')
          .or(`title.ilike.%${value}%, author.ilike.%${value}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectBook = (bookId) => {
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/book/${bookId}`);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <div className="header-content">
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <nav className={`nav-left ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/my-reviews" className="nav-link" onClick={() => setMenuOpen(false)}>My Reviews</Link>
          <Link to="/add-review-search" className="nav-link" onClick={() => setMenuOpen(false)}>Add a Review</Link>
        </nav>

        <div className="logo">
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="Story Jots"
              className="logo-image"
            />
          </Link>
        </div>

        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search books..."
            className="search-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  className="search-result-item"
                  onClick={() => handleSelectBook(book.id)}
                >
                  <span className="result-title">{book.title}</span>
                  <span className="result-author">by {book.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span className="user-name">Welcome, {user.user_metadata?.full_name || user.email}</span>
              <button onClick={handleLogout} className="login-button">Sign Out</button>
            </>
          ) : (
            <button onClick={handleLogin} className="login-button">Login</button>
          )}
        </div>
      </div>
      <div className="banner">
        <p>Discover your next great read with Story Jots!</p>
      </div>
    </header>
  );
}

export default Header; 