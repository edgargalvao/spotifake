import React from 'react';
import "../../Login.css";
import Login from '../Login/Login';

const MainPage = () => {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-content">
          <h3>Menu</h3>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-area">
          <Login />
        </div>
      </main>

      <footer className="bottom-bar">
        <div className="bottom-bar-content">
          <p>Barra inferior</p>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;