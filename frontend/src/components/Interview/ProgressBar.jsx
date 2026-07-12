const ProgressBar = ({ current, total }) => {
  const percentage = ((current + 1) / total) * 100;
  
  return (
    <div className="w-full h-1.5 bg-dark-800 rounded-full mb-10 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
