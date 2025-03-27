import { useState, useEffect } from 'react';
import axios from "../../axiosConfig";
import './SliderToggle.css';

type ChildToggleKeys = 'america' | 'asia';

const SliderToggle = () => {
  const [childToggles, setChildToggles] = useState({
    america: false,
    asia: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const worldNewsToggle = childToggles.america && childToggles.asia;

  // Fetch initial state from backend
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await axios.get("/slider");
        console.log('Initial state from backend:', response.data);
        setChildToggles(response.data);
      } catch (error) {
        console.error('Error fetching slider state:', error);
        // Fallback to default state
        setChildToggles({ america: false, asia: false });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, []);

  // Save state to backend
  const saveSliderState = async (newState: typeof childToggles) => {
    console.log('Saving state to backend:', newState);
    const payload = {
      america: Boolean(childToggles.america),
      asia: Boolean(childToggles.asia)
    };
    await axios.put('/slider', payload);
    try {
      await axios.put("/slider", newState);
    } catch (error) {
      console.error('Error saving slider state:', error);
    }
  };

  const handleWorldNewsToggle = () => {
    const newState = !worldNewsToggle;
    const updatedToggles = {
      america: newState,
      asia: newState
    };
    setChildToggles(updatedToggles);
    saveSliderState(updatedToggles);
  };

  const handleChildToggle = (child: ChildToggleKeys) => {
    const updatedToggles = {
      ...childToggles,
      [child]: !childToggles[child]
    };
    setChildToggles(updatedToggles);
    saveSliderState(updatedToggles);
  };

  if (isLoading) {
    return <div className="loading">Loading slider states...</div>;
  }

  return (
    <div className="padding">
      {/* World News Slider */}
      <div className="toggle-row">
        <div
          id="world"
          className="slider-container"
          onClick={handleWorldNewsToggle}
        >
          <div className={`slider ${worldNewsToggle ? 'slider-on' : 'slider-off'}`}>
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
          <div className={`slider ${childToggles.america ? 'slider-on' : 'slider-off'}`}>
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
          <div className={`slider ${childToggles.asia ? 'slider-on' : 'slider-off'}`}>
            <div className="slider-thumb"></div>
          </div>
        </div>
        <span className="toggle-label">Asia</span>
      </div>
    </div>
  );
};

export default SliderToggle;