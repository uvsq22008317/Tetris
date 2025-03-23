import React, { useState, useEffect } from 'react';
import Menu from './Menu.js';
import Solo from './Solo.js';
import Multi from './Multi.js';
import ConfigControls from './Config_touche.js';
import MenuSolo from './MenuSolo.js';
import Leaderboard from './Leaderboard.js';

function MainPage({ currentPage, setCurrentPage, setIsLoggedIn, setVolume, volume }) {
  const [localPage, setLocalPage] = useState(currentPage);

  useEffect(() => {
    setCurrentPage(localPage);
  }, [localPage, setCurrentPage]);

  const renderPage = () => {
    if (typeof localPage === 'object' && localPage.page === 'solo') {
      return <Solo changepage={setLocalPage} mode={localPage.mode} />;
    }
    switch (localPage) {
      case 'menu':
        return <Menu changepage={setLocalPage} setIsLoggedIn={setIsLoggedIn}/>;
      case 'menuSolo':
        return <MenuSolo changepage={setLocalPage} />;
      case 'Multi':
        return <Multi changepage={setLocalPage} />;
      case 'leaderboard':
        return <Leaderboard changepage={setLocalPage} />;
      case 'config':
        return <ConfigControls changepage={setLocalPage} setVolume={setVolume} volume={volume} />;
      default:
        return <Menu changepage={setLocalPage} />;
    }
  };

  return (
    <div className="mainPage">
      {renderPage()}
    </div>
  );
}

export default MainPage;