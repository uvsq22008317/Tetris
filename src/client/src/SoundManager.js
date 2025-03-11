export const playSound = (soundName) => {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.7; 
    audio.play().catch(err => console.log(`Erreur lors de la lecture de ${soundName}:`, err));
};
