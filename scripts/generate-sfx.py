#!/usr/bin/env python3
"""
Generates Suna's placeholder sound effects as short WAV files.

The sounds are synthesized here from sine tones (no samples, no third-party
audio), so they carry no license obligations. Final, designed SFX replace
them in Phase 5 without code changes: keep the file names.

Usage: python3 scripts/generate-sfx.py [out_dir]   (default: assets/sfx)
"""
import math
import os
import struct
import sys
import wave

RATE = 22050


def tone(freq, ms, volume=0.5, attack_ms=4, decay=6.0, freq_end=None):
    n = int(RATE * ms / 1000)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / n
        f = freq if freq_end is None else freq + (freq_end - freq) * t
        phase += 2 * math.pi * f / RATE
        attack = min(1.0, i / max(1, RATE * attack_ms / 1000))
        env = attack * math.exp(-decay * t)
        # A soft second harmonic keeps it warm rather than beepy.
        out.append(volume * env * (math.sin(phase) + 0.25 * math.sin(2 * phase)) / 1.25)
    return out


def silence(ms):
    return [0.0] * int(RATE * ms / 1000)


def mix(*parts):
    length = max(len(p) for p in parts)
    return [sum(p[i] for p in parts if i < len(p)) for i in range(length)]


def write(path, samples):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32767)) for s in samples))


SOUNDS = {
    # Light tick when a card is picked up.
    'pick': tone(880, 45, volume=0.35, decay=8),
    # Bubbly pop when a card snaps into a slot.
    'place': tone(520, 90, volume=0.5, decay=7, freq_end=780),
    # Gentle, low "not yet" for a wrong check. Never harsh.
    'retry': tone(392, 120, volume=0.35, decay=5) + tone(330, 160, volume=0.35, decay=5),
    # Rising major arpeggio with a soft sparkle for a solved puzzle.
    'success': mix(
        tone(523, 140, 0.4, decay=4)
        + tone(659, 140, 0.4, decay=4)
        + tone(784, 140, 0.4, decay=4)
        + tone(1047, 420, 0.45, decay=5),
        silence(420) + tone(2093, 300, 0.12, decay=6),
    ),
}

if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else 'assets/sfx'
    os.makedirs(out_dir, exist_ok=True)
    for name, samples in SOUNDS.items():
        write(os.path.join(out_dir, f'{name}.wav'), samples)
        print(f'{name}.wav: {len(samples) / RATE * 1000:.0f} ms')
