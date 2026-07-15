export const VoicePlayer = ({ audioUrl }) => {
  if (!audioUrl) return null;

  return (
    <div className="w-full mt-4 flex justify-center">
      <audio 
        controls 
        src={audioUrl} 
        className="w-full max-w-md rounded-lg outline-none" 
        controlsList="nodownload"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};
