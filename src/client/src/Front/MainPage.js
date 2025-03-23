import React, { useState, useEffect } from 'react';
import Menu from './Menu.js';
import Solo from './Solo.js';
import Multi from './Multi.js';
import ConfigControls from './Config_touche.js';
import MenuSolo from './MenuSolo.js';
import Leaderboard from './Leaderboard.js';

function MainPage({ setCurrentPage, setVolume, volume }) {
  const [currentpage, setcurrentpage] = useState('menu');

  useEffect(() => {
    setCurrentPage(currentpage);
  }, [currentpage, setCurrentPage]);

  const renderPage = () => {
    if (typeof currentpage === 'object' && currentpage.page === 'solo') {
      return <Solo changepage={setcurrentpage} mode={currentpage.mode} />;
    }

    switch (currentpage) {
      case 'menu':
        return <Menu changepage={setcurrentpage} />;
      case 'menuSolo':
        return <MenuSolo changepage={setcurrentpage} />;
      case 'Multi':
        return <Multi changepage={setcurrentpage} />;
      case 'leaderboard':
        return <Leaderboard changepage={setcurrentpage} />;
      case 'config':
        return <ConfigControls changepage={setcurrentpage} setVolume={setVolume} volume={volume} />;
      default:
        return <Menu changepage={setcurrentpage} />;
    }
  };

  return (
    <div className="mainPage">
      {renderPage()}
    </div>
  );
}

export default MainPage;