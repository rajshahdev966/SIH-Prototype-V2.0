import React from 'react';

const LoadingState = ({ message = 'Loading content...', subMessage = 'Please wait while we prepare the data.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <h3 className="text-base font-semibold text-slate-200">{message}</h3>
      {subMessage && <p className="text-xs text-slate-400 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};

export default LoadingState;
