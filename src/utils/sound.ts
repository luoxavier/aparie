export const playSound = (type: 'correct' | 'incorrect' | 'complete') => {
  const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
  if (!soundEnabled) return;

  const audio = new Audio();
  audio.src = type === 'correct' 
    ? '/sounds/correct.mp3'
    : type === 'incorrect'
    ? '/sounds/incorrect.mp3'
    : '/sounds/complete.mp3';
  audio.play().catch(console.error);
};

export const vibrate = (type: 'correct' | 'incorrect' | 'complete' | 'button') => {
  const vibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';
  if (!vibrationEnabled || !navigator.vibrate) return;

  switch (type) {
    case 'correct':
      navigator.vibrate(200); // Single long vibration for correct
      break;
    case 'incorrect':
      navigator.vibrate([100, 50, 100]); // Pattern for incorrect
      break;
    case 'complete':
      navigator.vibrate([100, 30, 100, 30, 100]); // Triple pulse for completion
      break;
    case 'button':
      navigator.vibrate(50); // Short pulse for button press
      break;
  }
};