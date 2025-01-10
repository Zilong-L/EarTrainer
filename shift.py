import librosa
import soundfile as sf
from pydub import AudioSegment
import os
import numpy as np

# List of input pronunciation files (Do.wav, Ra.wav, etc.)
input_files = [
    "public/answers/Solfege/Do.wav",
    "public/answers/Solfege/Ra.wav",
    "public/answers/Solfege/Re.wav",
    "public/answers/Solfege/Me.wav",
    "public/answers/Solfege/Mi.wav",
    "public/answers/Solfege/Fa.wav",
    "public/answers/Solfege/Se.wav",
    "public/answers/Solfege/Sol.wav",
    "public/answers/Solfege/La.wav",
    "public/answers/Solfege/Le.wav",
    "public/answers/Solfege/Te.wav",
    "public/answers/Solfege/Ti.wav"
]

# Define the chromatic pitch range from C1 to C6 (MIDI notes 24 to 72)
target_pitches = [
    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72
]

# Function to load, truncate or pad audio to 1 second
def process_audio(input_file, target_pitch, sr):
    # Load audio file
    audio, _ = librosa.load(input_file, sr=sr, mono=False)  # Load stereo if available
    
    # Truncate or pad to exactly 1 second
    audio_length = audio.shape[1] / sr
    if audio_length > 1:
        audio = audio[:, :sr]  # Truncate to 1 second
    elif audio_length < 1:
        # Pad with silence (zeroes) to reach 1 second
        pad_length = sr - audio.shape[1]
        silence = np.zeros((audio.shape[0], pad_length))
        audio = np.concatenate([audio, silence], axis=1)
    
    # Shift audio to the target pitch
    semitone_shift = target_pitch - 36  # C2 is MIDI 36
    shifted_audio = librosa.effects.pitch_shift(audio, sr=sr, n_steps=semitone_shift)
    
    return shifted_audio

# Sample rate (use original sample rate from one of the files)
sr = librosa.get_samplerate(input_files[0])

# Directory to store the temporary shifted files
temp_dir = "temp_shifted_files"
os.makedirs(temp_dir, exist_ok=True)

# Store the paths of the shifted files to later concatenate
shifted_files = []

# Iterate over the input files (Do, Ra, Re, etc.)
for input_file in input_files:
    # For each pronunciation, shift it across all target pitches (C1 to C6)
    for i, target_pitch in enumerate(target_pitches):
        # Process the audio (truncate/pad and pitch shift)
        shifted_audio = process_audio(input_file, target_pitch, sr)

        # Create the output path for the shifted audio file
        shifted_filename = f"{input_file.split('/')[-1].split('.')[0]}_shifted_{target_pitch}.wav"
        shifted_filepath = os.path.join(temp_dir, shifted_filename)

        # Save the shifted audio file
        sf.write(shifted_filepath, shifted_audio.T, sr)
        shifted_files.append(shifted_filepath)
        print(f"Saved: {shifted_filepath}")

# Concatenate all shifted files using pydub
final_audio = AudioSegment.empty()  # Start with an empty audio segment

# Load and concatenate all the shifted audio files
for file_path in shifted_files:
    audio_segment = AudioSegment.from_wav(file_path)
    final_audio += audio_segment  # Concatenate

# Export the final concatenated audio to an MP3 file
final_output_path = "final_sound_asset.mp3"
final_audio.export(final_output_path, format="mp3", bitrate="320k")
print(f"Final sound asset saved: {final_output_path}")

