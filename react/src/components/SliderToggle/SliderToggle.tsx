import { useState } from 'react';
import './SliderToggle.css';

type ChildToggleKeys = 'america' | 'asia';

const SliderToggle = () => {
  const [childToggles, setChildToggles] = useState({
    america: false,
    asia: false,
  });

  // Derive parent state from children
  const worldNewsToggle = childToggles.america && childToggles.asia;

  const handleWorldNewsToggle = () => {
    const newState = !worldNewsToggle;
    setChildToggles({
      america: newState,
      asia: newState,
    });
  };

  const handleChildToggle = (child: ChildToggleKeys) => {
    const newChildToggles = {
      ...childToggles,
      [child]: !childToggles[child],
    };
    setChildToggles(newChildToggles);
  };

  return (
    <div className='padding'>
      {/* World News Slider */}
      <div className="toggle-row">
        <div id="world" className="slider-container" onClick={handleWorldNewsToggle}>
          <div
            className={`slider ${worldNewsToggle ? 'slider-on' : 'slider-off'}`}
          >
            <div className="slider-thumb"></div>
          </div>
        </div>
        <span className="toggle-label">World News</span>
      </div>

      {/* Child Sliders */}
      <div className="toggle-row child-row">
        <div
          id="america"
          className="slider-container"
          onClick={() => handleChildToggle('america')}
        >
          <div
            className={`slider ${childToggles.america ? 'slider-on' : 'slider-off'
              }`}
          >
            <div className="slider-thumb"></div>
          </div>
        </div>
        <span className="toggle-label">America</span>
      </div>

      <div className="toggle-row child-row">
        <div
          id="asia"
          className="slider-container"
          onClick={() => handleChildToggle('asia')}
        >
          <div
            className={`slider ${childToggles.asia ? 'slider-on' : 'slider-off'
              }`}
          >
            <div className="slider-thumb"></div>
          </div>
        </div>
        <span className="toggle-label">Asia</span>
      </div>
    </div>
  );
};

export default SliderToggle;
