"""
Speech Service - Speech-to-Text and Text-to-Speech using Google Cloud
"""
import os
from typing import Dict, Any, List, Optional
from google.cloud import speech_v1 as speech
from google.cloud import texttospeech
from google.cloud.speech_v1 import types


class SpeechService:
    """
    Service for speech-to-text transcription and text-to-speech synthesis
    """

    def __init__(self):
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'your-project-id')

        # Initialize clients
        try:
            self.speech_client = speech.SpeechClient()
            self.tts_client = texttospeech.TextToSpeechClient()
        except Exception as e:
            print(f"Error initializing Speech clients: {e}")
            self.speech_client = None
            self.tts_client = None

    def transcribe_lecture(
            self,
            audio_content: bytes,
            language_code: str = 'en-US',
            enable_word_time_offsets: bool = True
    ) -> Dict[str, Any]:
        """
        Transcribe lecture audio for note-taking and accessibility
        
        Args:
            audio_content: Audio file content
            language_code: Language of the audio
            enable_word_time_offsets: Enable word-level timestamps
            
        Returns:
            Transcription with timestamps and confidence scores
        """
        if not self.speech_client:
            return self._mock_transcription()

        try:
            audio = speech.RecognitionAudio(content=audio_content)

            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                enable_word_time_offsets=enable_word_time_offsets,
                enable_automatic_punctuation=True,
                model='default',
                use_enhanced=True
            )

            response = self.speech_client.recognize(config=config, audio=audio)

            # Process results
            transcription = {
                'transcript': '',
                'words': [],
                'confidence': 0.0,
                'timestamps': []
            }

            for result in response.results:
                alternative = result.alternatives[0]
                transcription['transcript'] += alternative.transcript + ' '
                transcription['confidence'] = alternative.confidence

                # Extract word-level timing
                for word_info in alternative.words:
                    word = word_info.word
                    start_time = word_info.start_time.total_seconds()
                    end_time = word_info.end_time.total_seconds()

                    transcription['words'].append({
                        'word': word,
                        'start_time': start_time,
                        'end_time': end_time
                    })

            transcription['transcript'] = transcription['transcript'].strip()

            return transcription

        except Exception as e:
            print(f"Error transcribing lecture: {e}")
            return self._mock_transcription()

    def transcribe_long_audio(
            self,
            gcs_uri: str,
            language_code: str = 'en-US'
    ) -> str:
        """
        Transcribe long audio files from Google Cloud Storage (async)
        
        Args:
            gcs_uri: GCS URI of the audio file
            language_code: Language of the audio
            
        Returns:
            Operation name for tracking
        """
        if not self.speech_client:
            return "mock_operation_id"

        try:
            audio = speech.RecognitionAudio(uri=gcs_uri)

            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_time_offsets=True
            )

            operation = self.speech_client.long_running_recognize(config=config, audio=audio)

            return operation.operation.name

        except Exception as e:
            print(f"Error in long audio transcription: {e}")
            return "error_operation_id"

    def transcribe_with_speaker_diarization(
            self,
            audio_content: bytes,
            language_code: str = 'en-US',
            min_speaker_count: int = 2,
            max_speaker_count: int = 6
    ) -> Dict[str, Any]:
        """
        Transcribe audio with speaker identification (useful for group discussions)
        """
        if not self.speech_client:
            return self._mock_diarized_transcription()

        try:
            audio = speech.RecognitionAudio(content=audio_content)

            diarization_config = speech.SpeakerDiarizationConfig(
                enable_speaker_diarization=True,
                min_speaker_count=min_speaker_count,
                max_speaker_count=max_speaker_count
            )

            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                diarization_config=diarization_config
            )

            response = self.speech_client.recognize(config=config, audio=audio)

            # Process results with speaker tags
            result = response.results[-1]
            words_info = result.alternatives[0].words

            speakers = {}
            current_speaker = None
            current_text = []

            for word_info in words_info:
                speaker_tag = word_info.speaker_tag
                word = word_info.word

                if speaker_tag != current_speaker:
                    if current_speaker is not None and current_text:
                        if current_speaker not in speakers:
                            speakers[current_speaker] = []
                        speakers[current_speaker].append(' '.join(current_text))
                    current_speaker = speaker_tag
                    current_text = [word]
                else:
                    current_text.append(word)

            # Add last segment
            if current_speaker is not None and current_text:
                if current_speaker not in speakers:
                    speakers[current_speaker] = []
                speakers[current_speaker].append(' '.join(current_text))

            return {
                'speakers': speakers,
                'num_speakers': len(speakers),
                'full_transcript': result.alternatives[0].transcript
            }

        except Exception as e:
            print(f"Error in speaker diarization: {e}")
            return self._mock_diarized_transcription()

    def transcribe_form_input(
            self,
            audio_content: bytes,
            language_code: str = 'en-US'
    ) -> str:
        """
        Transcribe voice input for form filling (accessibility feature)
        """
        if not self.speech_client:
            return "Mock transcribed text for form filling"

        try:
            audio = speech.RecognitionAudio(content=audio_content)

            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                enable_automatic_punctuation=False,
                model='command_and_search'  # Optimized for short commands
            )

            response = self.speech_client.recognize(config=config, audio=audio)

            if response.results:
                return response.results[0].alternatives[0].transcript
            return ""

        except Exception as e:
            print(f"Error transcribing form input: {e}")
            return ""

    def synthesize_speech(
            self,
            text: str,
            language_code: str = 'en-US',
            voice_name: str = 'en-US-Neural2-C',
            speaking_rate: float = 1.0
    ) -> bytes:
        """
        Convert text to speech (useful for accessibility)
        """
        if not self.tts_client:
            return b''

        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)

            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name
            )

            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate
            )

            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )

            return response.audio_content

        except Exception as e:
            print(f"Error synthesizing speech: {e}")
            return b''

    def create_lecture_notes(
            self,
            audio_content: bytes,
            language_code: str = 'en-US'
    ) -> Dict[str, Any]:
        """
        Create searchable lecture notes from audio with chapters and key points
        """
        # First transcribe
        transcription = self.transcribe_lecture(audio_content, language_code)

        if not transcription.get('transcript'):
            return {
                'transcript': '',
                'chapters': [],
                'key_points': [],
                'searchable_text': ''
            }

        # Extract potential chapters based on pauses and content
        # This is simplified - in production, use NLP to identify chapter breaks
        transcript_text = transcription['transcript']
        words = transcription.get('words', [])

        chapters = self._identify_chapters(words, transcript_text)
        key_points = self._extract_key_points(transcript_text)

        return {
            'transcript': transcript_text,
            'chapters': chapters,
            'key_points': key_points,
            'searchable_text': transcript_text,
            'word_count': len(transcript_text.split()),
            'duration': words[-1]['end_time'] if words else 0
        }

    def _identify_chapters(self, words: List[Dict], transcript: str) -> List[Dict[str, Any]]:
        """Identify chapter breaks in lecture"""
        chapters = []

        # Simple heuristic: long pauses or topic-indicating phrases
        topic_indicators = ['today we will discuss', 'moving on to', 'next topic', 'chapter', 'section']

        current_chapter_start = 0
        current_chapter_text = []

        for i, word in enumerate(words):
            current_chapter_text.append(word['word'])

            # Check for chapter break (simplified)
            if any(indicator in ' '.join(current_chapter_text[-10:]).lower() for indicator in topic_indicators):
                if current_chapter_text:
                    chapters.append({
                        'start_time': current_chapter_start,
                        'end_time': word['start_time'],
                        'title': self._generate_chapter_title(current_chapter_text),
                        'content': ' '.join(current_chapter_text)
                    })
                current_chapter_start = word['start_time']
                current_chapter_text = []

        # Add last chapter
        if current_chapter_text:
            chapters.append({
                'start_time': current_chapter_start,
                'end_time': words[-1]['end_time'] if words else 0,
                'title': self._generate_chapter_title(current_chapter_text),
                'content': ' '.join(current_chapter_text)
            })

        return chapters

    def _generate_chapter_title(self, words: List[str]) -> str:
        """Generate a chapter title from words"""
        # Take first 5-10 words as title
        title_words = words[:min(10, len(words))]
        title = ' '.join(title_words)
        return title[:50] + ('...' if len(title) > 50 else '')

    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from transcript"""
        # Simplified extraction - in production, use NLP summarization
        sentences = text.split('.')
        key_points = []

        # Look for sentences with key indicators
        key_indicators = ['important', 'remember', 'key point', 'note that', 'crucial', 'essential']

        for sentence in sentences:
            if any(indicator in sentence.lower() for indicator in key_indicators):
                key_points.append(sentence.strip())

        # If no key indicators found, take longer sentences (likely more important)
        if not key_points:
            key_points = [s.strip() for s in sentences if len(s.split()) > 15][:5]

        return key_points[:10]  # Return top 10 key points

    # Mock methods

    def _mock_transcription(self) -> Dict[str, Any]:
        """Mock transcription for testing"""
        return {
            'transcript': 'This is a mock transcription of a lecture. Today we will discuss important concepts in education technology.',
            'words': [
                {'word': 'This', 'start_time': 0.0, 'end_time': 0.2},
                {'word': 'is', 'start_time': 0.2, 'end_time': 0.3},
                {'word': 'a', 'start_time': 0.3, 'end_time': 0.4},
                {'word': 'mock', 'start_time': 0.4, 'end_time': 0.6},
                {'word': 'transcription', 'start_time': 0.6, 'end_time': 1.0}
            ],
            'confidence': 0.95,
            'timestamps': []
        }

    def _mock_diarized_transcription(self) -> Dict[str, Any]:
        """Mock speaker diarization"""
        return {
            'speakers': {
                1: ['Hello, welcome to the class.'],
                2: ['Thank you, professor.']
            },
            'num_speakers': 2,
            'full_transcript': 'Hello, welcome to the class. Thank you, professor.'
        }


# Singleton instance
speech_service = SpeechService()
