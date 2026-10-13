# Implementation Plan: Enhanced Audio Mic Voice Recording & Speech-to-Text in Mock Interview

## User Intent & Requirements
The user wants to record their interview answers through the audio microphone with enhanced live speech-to-text transcription directly into the answer text box.
Based on the clarifying preferences:
- Deliver an enhanced live voice recording experience with real-time speech-to-text dictation streamed directly into the answer box.
- Provide responsive audio recording feedback (live audio wave animation, recording timer sync, mic permission handling, and graceful error recovery).
- Transcribe speech directly into the answer textarea so the candidate can inspect, refine, or expand their response before submitting for AI scoring.

---

## Proposed Changes

### `components/InterviewSimulation.tsx`
1. **Audio Microphone & Speech Recognition Architecture**:
   - Implement dual-engine support: Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`) with seamless speech recognition lifecycle management.
   - Real-time transcript streaming: capture both interim and final results smoothly without duplicating words or resetting manually entered text.
   - Auto-restart resilience on natural speech pauses during long interview responses (ensures continuous listening up to 3–5 minutes).
2. **Audio Wave & Recording UI Experience**:
   - Enhanced **Record Answer via Mic** button with distinct visual states:
     - **Idle**: Clean microphone icon with "Start Voice Recording" label.
     - **Listening / Active**: Pulsing rose/red indicator, animated sound wave frequency bars (live visualizer effect), and active recording timer.
     - **Interim Speech Indicator**: Subtle "Listening to your voice..." status badge showing words as they are recognized.
3. **Browser Permission & Compatibility Helper**:
   - Explicit microphone permission helper if the browser blocks access or requires permission grant.
   - Clear fallback banner if running in a browser environment without Web Speech API support, with guidance on enabling speech dictation.
4. **Answer Box Synchronization**:
   - Live word count counter synced in real-time as speech is recognized.
   - Single-click "Stop & Review" action so the user can easily switch between speaking and typing.

---

## Verification Plan
1. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to verify zero TypeScript errors.
2. **Browser Compatibility Check**: Verify `window.SpeechRecognition` and `window.webkitSpeechRecognition` fallback initialization.
3. **Recording Lifecycle**: Test start, pause, resume, interim result handling, and stopping dictation with transcript retention.
