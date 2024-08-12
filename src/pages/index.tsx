import { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface Element {
  id: number;
  x: number;
  y: number;
  isClicked: boolean;
}

export default function Home() {
  const [time, setTime] = useState<number>(0); // State to track the elapsed time
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // State to track if the game is playing
  const [inputValue, setInputValue] = useState<number>(0); // State to track input value
  const [elements, setElements] = useState<Element[]>([]); // State to store elements
  const [clickedCount, setClickedCount] = useState<number>(0); // State to track number of clicked elements
  const [gameOver, setGameOver] = useState<boolean>(false); // State to track if the game is over
  const [success, setSuccess] = useState<boolean>(false); // State to track if the game is won
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the container

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 0.1);
      }, 100);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const generateElements = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      const newElements: Element[] = Array.from({ length: inputValue }, (_, index) => {
        const size = 40; // Size of the element
        const x = Math.random() * (containerWidth - size);
        const y = Math.random() * (containerHeight - size);
        return { id: index + 1, x, y, isClicked: false };
      });

      // Sort elements by id in ascending order (smaller id on top)
      newElements.sort((a, b) => a.id - b.id);

      setElements(newElements);
    }
  };

  const handlePlayClick = () => {
    if (inputValue === 0) return; // Không làm gì nếu inputValue bằng 0

    setTime(0); // Reset the timer
    setClickedCount(0);
    setGameOver(false);
    setSuccess(false); // Reset success state
    setIsPlaying(true); // Start the timer
    generateElements(); // Generate the elements
  };

  const handleElementClick = (id: number) => {
    if (gameOver || success) return;

    if (id === clickedCount + 1) {
      // Correct order
      const updatedElements = [...elements];
      const elementIndex = updatedElements.findIndex((element) => element.id === id);
      updatedElements[elementIndex].isClicked = true;
      setElements(updatedElements);
      setClickedCount(clickedCount + 1);

      setTimeout(() => {
        // Remove the clicked element after 0.2 seconds
        setElements((prevElements) =>
          prevElements.filter((element) => element.id !== id)
        );
      }, 200);

      if (clickedCount + 1 === inputValue) {
        setIsPlaying(false);
        setSuccess(true);
      }
    } else {
      // Incorrect order
      setGameOver(true);
      setIsPlaying(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    setInputValue(value);
  };

  const getTitleText = () => {
    if (success) return <p className="text-green-700">ALL CLEARED</p>;
    if (gameOver) return <p className="text-red-700">GAME OVER</p>;
    return "LET'S PLAY";
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center py-2 px-24 ${inter.className}`}
    >
      <div className="">
        <h1 className="text-2xl font-bold mb-4 mt-5">{getTitleText()}</h1>
        <div className="flex items-center mt-2">
          <p>Points:</p>
          <input
            type="text"
            className="bg-transparent border border-gray-400 pl-1 rounded ml-28 focus:outline-blue-500"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <p>Time:</p>
          <p className="ml-[105px]">{time.toFixed(1)}s</p> {/* Display the time */}
        </div>
        <button
          onClick={handlePlayClick}
          className="bg-gray-200 w-28 border border-gray-400 rounded font-medium mt-2"
        >
          {isPlaying ? "Restart" : "Play"}
        </button>
        <div
          ref={containerRef}
          className="relative w-[700px] h-[600px] border-2 border-black mt-4 overflow-hidden "
        >
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute rounded-full text-black flex items-center justify-center cursor-pointer ${
                element.isClicked ? "bg-red-500" : "bg-white border-black"
              }`}
              style={{
                width: "40px",
                height: "40px",
                top: `${element.y}px`,
                left: `${element.x}px`,
                zIndex: 100 - element.id, // Ensure smaller IDs are on top (larger zIndex)
                border: "2px solid black" // Black border
              }}
              onClick={() => handleElementClick(element.id)}
            >
              {element.id}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
