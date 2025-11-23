import { useState, useEffect } from 'react';
import './App.css';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import Modal from './components/Modal';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        showMessage('Error loading users: ' + error.message, 'error');
      }
    };
    
    loadUsers();
  }, []);

  // Add new user
  const handleAddUser = async (userData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Failed to add user');
      
      const newUser = await response.json();
      // Generate unique ID for new user
      const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
      newUser.id = maxId + 1;
      newUser.isNew = true; // Mark as locally created
      
      const updatedUsers = [newUser, ...users];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setCurrentPage(1);
      setIsAddModalOpen(false);
      
      showMessage('User added successfully!', 'success');
    } catch (error) {
      showMessage('Error adding user: ' + error.message, 'error');
    }
  };

  // Update user
  const handleUpdateUser = async (userData) => {
    try {
      // Check if this is a newly added user (not from API)
      if (editingUser.isNew) {
        // Update locally without API call
        const updatedUsers = users.map(u => 
          u.id === editingUser.id ? { ...u, ...userData, isNew: true } : u
        );
        
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setIsModalOpen(false);
        setEditingUser(null);
        
        showMessage('User updated successfully!', 'success');
      } else {
        // Update via API for original users
        const response = await fetch(`${API_URL}/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Failed to update user');

        const updatedUsers = users.map(u => 
          u.id === editingUser.id ? { ...u, ...userData } : u
        );
        
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setIsModalOpen(false);
        setEditingUser(null);
        
        showMessage('User updated successfully!', 'success');
      }
    } catch (error) {
      showMessage('Error updating user: ' + error.message, 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const user = users.find(u => u.id === userId);
      
      // Only call API for original users, not newly added ones
      if (!user?.isNew) {
        const response = await fetch(`${API_URL}/${userId}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete user');
      }

      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      const totalPages = Math.ceil(updatedUsers.length / usersPerPage);
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(totalPages);
      }
      
      showMessage('User deleted successfully!', 'success');
    } catch (error) {
      showMessage('Error deleting user: ' + error.message, 'error');
    }
  };

  // Search users
  const handleSearch = (searchTerm) => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  };

  // Clear search
  const handleClearSearch = () => {
    setFilteredUsers(users);
    setCurrentPage(1);
  };

  // Open edit modal
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Show message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container">
      <h1>User Management System</h1>

      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

      <button className="add-user-btn" onClick={() => setIsAddModalOpen(true)}>
        <span className="plus-icon">+</span> Add New User
      </button>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <UserTable 
        users={currentUsers} 
        onEdit={handleEditUser} 
        onDelete={handleDeleteUser} 
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <UserForm 
          user={editingUser} 
          onSubmit={handleUpdateUser}
          onCancel={handleCloseModal}
        />
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <UserForm 
          onSubmit={handleAddUser}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default App;
