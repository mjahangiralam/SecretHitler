export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsRequest {
  text: string;
  model_id?: string;
  voice_settings?: ElevenLabsVoiceSettings;
}

const DEFAULT_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
};

export async function playElevenLabsAudio(
  apiKey: string, 
  text: string, 
  voiceId: string = 'pNInz6obpgDQGcFmaJgB' // Default to Adam voice
): Promise<void> {
  if (!apiKey || !text.trim()) {
    console.warn('ElevenLabs: Missing API key or text');
    return;
  }

  try {
    const requestBody: ElevenLabsRequest = {
      text: text.trim(),
      model_id: 'eleven_monolingual_v1',
      voice_settings: DEFAULT_VOICE_SETTINGS
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    
    // Return a promise that resolves when audio finishes playing
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', error);
        reject(error);
      };
      
      audio.play().catch(error => {
        URL.revokeObjectURL(audioUrl);
        console.error('Audio play error:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('ElevenLabs audio generation failed:', error);
    throw error;
  }
}

export function getRoleNarrationText(role: string): string {
  switch (role) {
    case 'liberal':
      return 'You are a Liberal. Your objective is to enact five Liberal policies or eliminate Hitler to save democracy from the fascist threat.';
    case 'fascist':
      return 'You are a Fascist. Your objective is to support Hitler and enact six Fascist policies, or help Hitler become Chancellor after three Fascist policies are enacted.';
    case 'hitler':
      return 'You are Hitler. Your objective is to be elected Chancellor after three Fascist policies are enacted, or ensure six Fascist policies are passed to seize control.';
    default:
      return 'Your role has been assigned. Good luck in the game.';
  }
}

export function getAIVoiceId(personality?: { voiceId?: string }): string {
  return personality?.voiceId || 'pNInz6obpgDQGcFmaJgB'; // Default to Adam
}

// Utility to check if ElevenLabs is available
export function isElevenLabsEnabled(apiKey?: string): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}