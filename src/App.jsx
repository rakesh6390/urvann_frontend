import React, { useState, useEffect } from 'react';
import './App.css';

// AdminLogin Component
const AdminLogin = ({ setAdminToken, setShowLogin, setShowForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      console.log({username,password});
      console.log(response);

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setAdminToken(data.token);
        setShowLogin(false);
        setShowForm(true);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Admin Login</h2>
          <button className="modal-close" onClick={() => setShowLogin(false)}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="plant-form">
          {error && <div className="form-error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowLogin(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PlantCard Component
const PlantCard = ({ plant }) => {
  return (
    <div className="plant-card">
      <div className="card-image-container">
        <div className="card-badge">{plant.availability ? 'In Stock' : 'Out of Stock'}</div>
        {plant.imageUrl ? (
          <img src={plant.imageUrl} alt={plant.name} className="card-image" />
        ) : (
          <div className="card-image-placeholder">
            <span className="plant-emoji">🌿</span>
          </div>
        )}
        <button className="card-wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className="card-content">
        <h3 className="card-title">{plant.name}</h3>
        <div className="card-categories">
          {plant.categories.map((category, index) => (
            <span key={index} className="category-tag">{category}</span>
          ))}
        </div>
        <div className="card-footer">
          <p className="card-price">${plant.price.toFixed(2)}</p>
          <button className="card-cart-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// SearchAndFilter Component
const SearchAndFilter = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <span className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search plants by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-dropdown">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
        <span className="dropdown-arrow">▼</span>
      </div>
    </div>
  );
};

// PlantForm Component (Admin)
const PlantForm = ({ showForm, setShowForm, fetchPlants, adminToken }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categories: [],
    availability: true,
    imageUrl: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(category => category !== categoryToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/plants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price)
          }),
        });
        
        if (response.ok) {
          const newPlant = await response.json();
          console.log('Plant added:', newPlant);
          setFormData({
            name: '',
            price: '',
            categories: [],
            availability: true,
            imageUrl: ''
          });
          setShowForm(false);
          fetchPlants();
        } else if (response.status === 401) {
          setSubmitError('Session expired. Please login again.');
          localStorage.removeItem('adminToken');
        } else {
          setSubmitError('Failed to add plant');
        }
      } catch (error) {
        setSubmitError('Error connecting to server');
        console.error('Error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Plant name is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    
    if (formData.categories.length === 0) {
      errors.categories = 'At least one category is required';
    }
    
    return errors;
  };

  if (!showForm) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Plant</h2>
          <button className="modal-close" onClick={() => setShowForm(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="plant-form">
          {submitError && <div className="form-error-message">{submitError}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Plant Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g., Snake Plant"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="price" className="form-label">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="categories" className="form-label">Categories *</label>
            <div className="categories-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Add a category (e.g., Indoor)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="button" className="category-add-btn" onClick={handleAddCategory}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add
              </button>
            </div>
            {errors.categories && <span className="form-error">{errors.categories}</span>}
            
            <div className="categories-list">
              {formData.categories.map((category, index) => (
                <span key={index} className="selected-category">
                  {category}
                  <button type="button" onClick={() => handleRemoveCategory(category)} className="category-remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="availability" className="form-label">Availability</label>
              <div className="availability-toggle">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.checked})}
                  className="toggle-input"
                />
                <label htmlFor="availability" className="toggle-label">
                  <span className="toggle-handle"></span>
                </label>
                <span className="toggle-text">{formData.availability ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="imageUrl" className="form-label">Image URL (optional)</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/plant.jpg"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  </svg>
                  Adding Plant...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Plant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [showLogin, setShowLogin] = useState(false);

  // Update the add plant button click handler
  const handleAddPlantClick = () => {
    if (adminToken) {
      setShowForm(true);
    } else {
      setShowLogin(true);
    }
  };
  // console.log(import.meta.env.VITE_BACKEND_URL);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
  };

  // Fetch plants from backend
  const fetchPlants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/plants`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }
      
      const plantsData = await response.json();
      setPlants(plantsData);
      setFilteredPlants(plantsData);
      
      // Extract unique categories
      const allCategories = plantsData.flatMap(plant => plant.categories);
      const uniqueCategories = [...new Set(allCategories)].sort();
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // Filter plants based on search term and selected category
  useEffect(() => {
    let results = plants;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(plant => 
        plant.name.toLowerCase().includes(term) || 
        plant.categories.some(category => category.toLowerCase().includes(term))
      );
    }
    
    if (selectedCategory) {
      results = results.filter(plant => 
        plant.categories.includes(selectedCategory)
      );
    }
    
    setFilteredPlants(results);
  }, [searchTerm, selectedCategory, plants]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading our plant collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchPlants} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <h1>Urvann</h1>
          </div>
          <div className="header-actions">
            {adminToken && (
              <>
                <span className="admin-badge">Admin</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            <button className="add-plant-btn" onClick={handleAddPlantClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Plant
            </button>
          </div>
        </div>
      </header>
      
      <div className="hero-section">
        <div className="hero-content">
          <h2>Find Your Perfect Plant</h2>
          <p>Discover our collection of indoor and outdoor plants to bring nature into your home</p>
        </div>
      </div>
      
      <main className="app-main">
        <SearchAndFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        
        <div className="results-info">
          <p>Showing {filteredPlants.length} of {plants.length} plants</p>
        </div>
        
        <div className="plants-grid">
          {filteredPlants.length > 0 ? (
            filteredPlants.map(plant => (
              <PlantCard key={plant._id} plant={plant} />
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3>No plants found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Update the PlantForm component call */}
      <PlantForm 
        showForm={showForm}
        setShowForm={setShowForm}
        fetchPlants={fetchPlants}
        adminToken={adminToken}
      />
      
      {/* Add the AdminLogin component */}
      {showLogin && (
        <AdminLogin 
          setAdminToken={setAdminToken}
          setShowLogin={setShowLogin}
          setShowForm={setShowForm}
        />
      )}
    </div>
  );
}

export default App;