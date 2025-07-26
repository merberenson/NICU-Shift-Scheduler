import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorizedPage = () => {
  return (
    <div>
      <h1>Not Authorized</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/login">Go to your main page</Link>
    </div>
  );
};

export default NotAuthorizedPage;