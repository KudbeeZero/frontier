export function speakText(text: string) {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.8;
  utterance.rate = 0.9;
  utterance.volume = 0.8;

  window.speechSynthesis.speak(utterance);
}
