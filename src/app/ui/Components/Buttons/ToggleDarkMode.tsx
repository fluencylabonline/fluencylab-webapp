import '../Components.css';
import {useState, useEffect} from "react"

export function ToggleDarkMode(){
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode');
    setIsChecked(storedDarkMode === 'true');
  }, []);

  const handleCheckboxChange = () => {
    setIsChecked((prevChecked) => {
      const newChecked = !prevChecked;
      localStorage.setItem('isDarkMode', newChecked.toString());
      document.body.classList.toggle('dark', newChecked);
      return newChecked;
    });
  };  

  return (
    <div className='flex items-center'>
      <input id="toggle" className="toggle" type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
    </div>
  );
};