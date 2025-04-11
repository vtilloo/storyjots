import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import './HomePage.css';
import Header from '../components/Header';

// Static data as initial state
const initialBooks = [
  {
    id: 1,
    title: 'Lucky',
    author: 'Chris Hill',
    cover: 'lucky.jpg',
  },
  {
    id: 2,
    title: 'The Battle',
    author: 'Karuna Riazi',
    cover: 'battle.jpg',
  },
  {
    id: 3,
    title: 'Fablehaven',
    author: 'Brandon Mull',
    cover: 'fablehaven.png',
  },
  {
    id: 4,
    title: 'Eddie Red Undercover',
    author: 'Marcia Wells',
    cover: 'undercover.jpg',
  },
  {
    id: 5,
    title: 'Not If I Can Help It',
    author: 'Carolyn Mackler',
    cover: 'not.jpg',
  },
  {
    id: 6,
    title: 'Dust and Grim',
    author: 'Chuck Wendig',
    cover: 'dust.jpg',
  }
];

function HomePage() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState(initialBooks);
  const bookListRef = useRef(null);

  useEffect(() => {
    // Get the current user session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch books from Supabase
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
      } else if (data && data.length > 0) {
        setBooks(data);
      }
    };

    fetchBooks();

    return () => subscription?.unsubscribe();
  }, []);

  const scrollLeft = () => {
    if (bookListRef.current) {
      bookListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (bookListRef.current) {
      bookListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      <Header user={user} />

      <main>
        <section className="suggested-books">
          <h2 className="suggested-title">Featured Books</h2>
          <button className="scroll-arrow left-arrow" onClick={scrollLeft}>&#9664;</button>
          <div className="book-list" ref={bookListRef}>
            {books.map(book => (
              <Link to={`/book/${book.id}`} key={book.id} className="book-item">
                <img src={book.image_url} alt={`${book.title}`} />
                <div className="book-details">
                  <span className="book-title">{book.title}</span>
                  <span className="book-author">by {book.author}</span>
                </div>
              </Link>
            ))}
          </div>
          <button className="scroll-arrow right-arrow" onClick={scrollRight}>&#9654;</button>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
