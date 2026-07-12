const QuestionCard = ({ question, index, total }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-dark-300 font-medium">
          Question <span className="text-dark-50 text-xl font-bold">{index + 1}</span> / {total}
        </div>
        <div className="flex gap-2">
          {question?.topic && (
            <span className="px-3 py-1 rounded-full bg-dark-800 text-xs text-dark-300 border border-dark-700">
              {question.topic}
            </span>
          )}
          {question?.difficulty && (
            <span className="px-3 py-1 rounded-full bg-dark-800 text-xs text-dark-300 border border-dark-700">
              {question.difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="glass-light rounded-3xl p-6 sm:p-8 border border-dark-700/50 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dark-50 leading-relaxed">
          {question?.question}
        </h2>
      </div>
    </>
  );
};

export default QuestionCard;
