export const NARRATOR_VOICE_ID = "narrator_placeholder";
export const AEGIS_VOICE_ID = "aegis_placeholder";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

let currentAudio: HTMLAudioElement | null = null;

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  window.speechSynthesis?.cancel();
}

export async function playVoiceLine(
  text: string,
  voiceId: string,
): Promise<void> {
  stopCurrent();

  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

  if (apiKey) {
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
        return;
      }
    } catch {
      // fall through to browser synthesis
    }
  }

  // Browser speechSynthesis fallback
  if (typeof window !== "undefined" && window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.8;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}
