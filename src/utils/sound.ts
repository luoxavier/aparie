export const playSound = (type: 'correct' | 'incorrect') => {
  const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
  if (!soundEnabled) return;

  const audio = new Audio();
  audio.src = type === 'correct' 
    ? '/sounds/correct.mp3'  // You'll need to add these sound files to the public folder
    : '/sounds/incorrect.mp3';
  audio.play().catch(console.error);
};

export const vibrate = (type: 'correct' | 'incorrect') => {
  const vibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';
  if (!vibrationEnabled || !navigator.vibrate) return;

  if (type === 'correct') {
    navigator.vibrate(200); // Short vibration for correct
  } else {
    navigator.vibrate([100, 50, 100]); // Pattern for incorrect
  }
};