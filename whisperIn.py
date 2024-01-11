from whisper_mic.whisper_mic import WhisperMic

def main(model: str, english: bool) -> None:

    mic = WhisperMic(model=model, english=english, verbose=False)
    while True:
        result = mic.listen()
        # trim the result and lower case
        result = result.strip().lower()
        print(result)
  
if __name__ == "__main__":
    main("tiny", True)