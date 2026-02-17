import React from 'react';
import { Link } from 'react-router-dom';

function NavPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Temporary Navigation Page</h1>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <Link to="/app" className="text-blue-500 hover:underline">
            Main App (Index Page)
          </Link>
        </li>
        <li>
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </li>
        <li>
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </li>
        <li>
          <Link to="/complete-profile" className="text-blue-500 hover:underline">
            Complete Profile
          </Link>
        </li>
        <li>
          <Link to="/app/guides" className="text-blue-500 hover:underline">
            New Guides
          </Link>
        </li>
        <li>
          <Link to="/app/travelers" className="text-blue-500 hover:underline">
            Fellow Travelers
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default NavPage;
