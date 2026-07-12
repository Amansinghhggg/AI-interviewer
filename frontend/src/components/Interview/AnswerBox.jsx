const AnswerBox = ({ question, value, onChange }) => {
  if (!question) return null;

  // Render different answer inputs based on question type
  switch (question.type) {
    case "text":
    default:
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder="Type your answer here..."
          className="flex-1 w-full min-h-[300px] bg-dark-800/50 border border-dark-700 rounded-3xl p-6 text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 resize-none transition-all placeholder-dark-500 text-lg leading-relaxed"
        />
      );
  }
};

export default AnswerBox;
