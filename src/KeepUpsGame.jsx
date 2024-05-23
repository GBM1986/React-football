import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import KeepUpsLogo from './assets/KeepUpsLogo.png';

const KeepUpsGame = () => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [highScores, setHighScores] = useState(() => {
    const storedScores = localStorage.getItem('highScores');
    return storedScores ? JSON.parse(storedScores) : {};
  });
  const [hasPromptedForName, setHasPromptedForName] = useState(false); // New state
  const ballRef = useRef(null);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const gravity = 0.5;
  const friction = 0.67;

  const handleClick = () => {
    setCount(count + 1);
    setIsAnimating(true);
    setVelocity({ x: (Math.random() - 0.5) * 10, y: -10 });
  };

  const startGame = () => {
    setIsGameStarted(true);
    setCount(0);
    setPosition({ top: 50, left: 50 });
    setVelocity({ x: 0, y: 0 });
  };

  const endGame = () => {
    setIsGameStarted(false);
    setIsAnimating(false);
    setHasPromptedForName(false); // Reset the state when the game ends
  };

  useEffect(() => {
    if (!isGameStarted) return;

    let animationFrameId;
    let timerId;

    const moveBall = () => {
      setPosition((prevPosition) => {
        let newTop = prevPosition.top + velocity.y;
        let newLeft = prevPosition.left + velocity.x;
        let newVelocity = { ...velocity };

        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;
        const ballSize = ballRef.current.clientWidth;

        newVelocity.y += gravity;
        newVelocity.x *= friction;
        newVelocity.y *= friction;

        if (newTop <= 0) {
          newVelocity.y = -newVelocity.y;
          newTop = 0;
        } else if (newTop >= containerHeight - ballSize) {
          // Reset the count if the ball hits the ground
          endGame();
          newVelocity.y = -newVelocity.y;
          newTop = containerHeight - ballSize;
        }

        if (newLeft <= 0) {
          newVelocity.x = -newVelocity.x;
          newLeft = 0;
        } else if (newLeft >= containerWidth - ballSize) {
          newVelocity.x = -newVelocity.x;
          newLeft = containerWidth - ballSize;
        }

        setVelocity(newVelocity);

        return { top: newTop, left: newLeft };
      });

      animationFrameId = requestAnimationFrame(moveBall);
    };

    if (isAnimating) {
      animationFrameId = requestAnimationFrame(moveBall);

      timerId = setTimeout(() => {
        setIsAnimating(false);
        cancelAnimationFrame(animationFrameId);
      }, 1000); // Stop animation after 1 second
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timerId);
    };
  }, [isAnimating, velocity, isGameStarted, count]);

  useEffect(() => {
    if (!isGameStarted && count > 0 && !hasPromptedForName) { // Check if name prompt has been shown
      setHasPromptedForName(true); // Set the state to indicate name prompt has been shown
      const playerName = prompt('Enter name:');
      if (playerName && playerName.trim() !== '') {
        const truncatedName = playerName.slice(0, 12);
        const existingScore = highScores[truncatedName] || 0;
        const newHighScores = {
          ...highScores,
          [truncatedName]: Math.max(count, existingScore)
        };
        localStorage.setItem('highScores', JSON.stringify(newHighScores));
        setHighScores(newHighScores);
      }
    }
  }, [isGameStarted, count, highScores, hasPromptedForName]); // Include hasPromptedForName in dependency array
  
  const sortedHighScores = Object.entries(highScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  return (
    <div className="game-container" ref={containerRef}>
      {!isGameStarted && (
        <div className="start-screen">
         <img src={KeepUpsLogo} alt="KeepUps Logo" /><br /> {/* Replace with your logo */}
          <button onClick={startGame}>Start Game</button>
          <p>High Scores:</p>
           <ul>
            {sortedHighScores.map(([name, score]) => (
              <li key={name}>{name}: {score}</li>
            ))}
          </ul>
        </div>
      )}
      {isGameStarted && (
        <>
          <h1>Football Keep-Ups</h1>
          <div
            className="football"
            onClick={handleClick}
            style={{ top: position.top, left: position.left }}
            ref={ballRef}
          ></div>
          <p>Keep-ups: {count}</p>
        </>
      )}
    </div>
  );
};

export default KeepUpsGame;
