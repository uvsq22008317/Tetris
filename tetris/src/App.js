import React, { useState } from 'react';
import Menu from './Front/Menu';
import Solo from './Front/Solo';
import Multi from './Front/Multi';
import ConfigControls from './Front/Config_touche';

function App() {
  const [currentpage, setcurrentpage] = useState('menu');

  const renderPage = () => {
    switch (currentpage) {
      case 'menu':
        return <Menu changepage = {setcurrentpage} />;
      case 'solo':
        return <Solo changepage = {setcurrentpage} />;
      case 'Multi':
        return <Multi changepage = {setcurrentpage} />;
      case 'config':
        return <ConfigControls changepage = {setcurrentpage} />;
      default:
        return <Menu changepage = {setcurrentpage} />;
    }
  };

  return (
    <div className = "App">
      {renderPage()}
    </div>
  );
}


export default App;
