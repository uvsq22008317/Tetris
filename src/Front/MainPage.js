import React, { useState } from 'react';
import '../App.css';
import Menu from './Menu';
import Solo from './Solo';
import Multi from './Multi';
import ConfigControls from './Config_touche';
import MenuSolo from './MenuSolo';

function MainPage() {
  const [currentpage, setcurrentpage] = useState('menu');

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
      case 'config':
        return <ConfigControls changepage={setcurrentpage} />;
      default:
        return <Menu changepage={setcurrentpage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default MainPage;
