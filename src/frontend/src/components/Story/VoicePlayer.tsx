import { useEffect } from "react";
import {
  AEGIS_VOICE_ID,
  playVoiceLine,
} from "../../services/elevenLabsService";
import { useStoryStore } from "../../stores/storyStore";

export function VoicePlayer() {
  const currentEvent = useStoryStore((s) => s.currentEvent);
  const isVisible = useStoryStore((s) => s.isVisible);

  useEffect(() => {
    if (currentEvent && isVisible) {
      playVoiceLine(currentEvent.dialogue, AEGIS_VOICE_ID);
    }
  }, [currentEvent, isVisible]);

  return null;
}
