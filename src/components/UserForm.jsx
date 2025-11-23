import React, { useState } from 'react';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone input - only allow numbers, spaces, dashes, parentheses, plus, and x
    if (name === 'phone') {
      const phoneRegex = /^[0-9\s\-\(\)\+xX]*$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!user) {
      setFormData({ name: '', email: '', phone: '' });
    }
  };

  return (
    <div className="modal-form-section">
      <h2>{user ? 'Edit User' : 'Add New User'}</h2>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone (e.g., 0123-456-789 x123)"
          value={formData.phone}
          onChange={handleChange}
          pattern="[0-9\s\-\(\)\+xX]*"
          title="Only numbers and phone formatting characters (spaces, dashes, parentheses, plus, x) are allowed"
          required
        />
        <button type="submit">{user ? 'Update User' : 'Add User'}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default UserForm;
