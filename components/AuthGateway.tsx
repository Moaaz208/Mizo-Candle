
import React, { useState, useEffect } from 'react';

interface AuthGatewayProps {
  passcode: string;
  onSuccess: () => void;
  onCancel: () => void;
  isGlobalLock: boolean;
}

const AuthGateway: React.FC<AuthGatewayProps> = ({ passcode, onSuccess, onCancel, isGlobalLock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input === passcode) {
      onSuccess();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 500);
    }
  };

  useEffect(() => {
    if (input.length === passcode.length) {
      handleSubmit();
    }
  }, [input]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-fadeIn">
      <div className={`bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl transition-transform duration-300 ${error ? 'animate-bounce' : ''}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {isGlobalLock ? 'System Encrypted' : 'Security Clearance'}
          </h2>
          <p className="text-sm text-gray-500">Enter master passcode to continue</p>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          {[...Array(passcode.length)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                input.length > i ? 'bg-black border-black scale-110' : 'bg-transparent border-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((val) => (
            <button
              key={val}
              onClick={() => {
                if (val === 'C') setInput('');
                else if (val === '✓') handleSubmit();
                else if (input.length < passcode.length) setInput(prev => prev + val);
              }}
              className="h-16 rounded-2xl bg-gray-50 text-xl font-bold text-gray-800 hover:bg-gray-100 active:scale-90 transition-all"
            >
              {val}
            </button>
          ))}
        </div>

        {!isGlobalLock && (
          <button 
            onClick={onCancel}
            className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel Access Request
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthGateway;
