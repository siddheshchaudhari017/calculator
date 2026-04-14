import React, { useState, useEffect } from 'react';

function App() {
  const [currentInput, setCurrentInput] = useState('0');
  const [previousEquation, setPreviousEquation] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDegrees, setIsDegrees] = useState(true);

  // Fetch history on mount
  useEffect(() => {
    fetch('https://calculator-irvq.onrender.com/api/history')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setHistory(data);
      })
      .catch(err => console.error('Error fetching history:', err));
  }, []);

  const saveHistory = (equation, result) => {
    fetch('https://calculator-irvq.onrender.com/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equation, result: result.toString() })
    })
    .then(res => res.json())
    .then(data => {
      setHistory(prev => [data, ...prev]);
    })
    .catch(err => console.error('Error saving history:', err));
  };

  const handleClear = () => {
    setCurrentInput('0');
    setPreviousEquation('');
  };

  const handleDelete = () => {
    if (currentInput.length > 1) {
      setCurrentInput(currentInput.slice(0, -1));
    } else {
      setCurrentInput('0');
    }
  };

  const handleInput = (val) => {
    if (currentInput === '0' && val !== '.') {
      setCurrentInput(val);
    } else {
      setCurrentInput(currentInput + val);
    }
  };

  const handleCalculate = () => {
    try {
      const sanitized = currentInput.replace(/×/g, '*').replace(/−/g, '-').replace(/÷/g, '/');
      const result = new Function('return ' + sanitized)(); 
      
      const formattedResult = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();
      
      if (currentInput !== formattedResult) {
        saveHistory(currentInput, formattedResult);
        setPreviousEquation(currentInput + ' =');
        setCurrentInput(formattedResult);
      }
    } catch (e) {
      setCurrentInput('Error');
    }
  };

  const handleAdvanced = (funcName) => {
    try {
      const sanitized = currentInput.replace(/×/g, '*').replace(/−/g, '-').replace(/÷/g, '/');
      const val = new Function('return ' + sanitized)();
      
      let result = 0;
      let angle = isDegrees ? val * (Math.PI / 180) : val;

      switch(funcName) {
        case 'sin': result = Math.sin(angle); break;
        case 'cos': result = Math.cos(angle); break;
        case 'tan': result = Math.tan(angle); break;
        case 'log': result = Math.log(val) / Math.LN10; break;
      }
      
      if (Math.abs(result) < 1e-10) result = 0;
      
      const formattedResult = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();
      
      saveHistory(`${funcName}(${val})`, formattedResult);
      setPreviousEquation(`${funcName}(${val}) =`);
      setCurrentInput(formattedResult);
    } catch(e) {
      setCurrentInput('Error');
    }
  };

  const handlePercent = () => {
    try {
      const sanitized = currentInput.replace(/×/g, '*').replace(/−/g, '-').replace(/÷/g, '/');
      const val = new Function('return ' + sanitized)();
      const result = val / 100;
      setCurrentInput(parseFloat(result.toFixed(8)).toString());
    } catch(e) {
      setCurrentInput('Error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#0c0e11]/80 backdrop-blur-2xl bg-gradient-to-b from-[#111417] to-transparent">
        <div className="flex justify-between items-center px-6 h-16 w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#81ecff]">calculate</span>
            <span className="text-[#81ecff] font-bold tracking-[0.2em] text-lg font-headline uppercase">LUMINAL</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowHistory(!showHistory)} className="material-symbols-outlined text-[#aaabaf] hover:text-[#81ecff] transition-colors cursor-pointer active:scale-95 duration-150">
              history
            </button>
            <span className="material-symbols-outlined text-[#81ecff] transition-colors cursor-pointer active:scale-95 duration-150">
              settings
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16 pb-24 flex flex-col max-w-md mx-auto relative overflow-hidden w-full">
        {showHistory ? (
          <section className="px-6 py-8 flex flex-col flex-grow">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Calculation History</h2>
            <div className="flex flex-col gap-4 overflow-y-auto">
              {history.map(item => (
                <div key={item._id} className="bg-surface-variant rounded-lg p-4 cursor-pointer hover:bg-surface-container-high transition-colors" onClick={() => setCurrentInput(item.result)}>
                  <div className="text-on-surface-variant font-headline text-sm">{item.equation}</div>
                  <div className="text-primary font-headline text-2xl font-bold mt-1">{item.result}</div>
                  <div className="text-on-surface-variant opacity-50 text-xs mt-2">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
              ))}
              {history.length === 0 && <div className="text-on-surface-variant">No history found.</div>}
            </div>
          </section>
        ) : (
          <>
            {/* Display Area */}
            <section className="px-6 py-8 flex flex-col items-end justify-end flex-grow">
              {previousEquation && (
                <div className="mb-4 flex flex-wrap justify-end gap-2 overflow-x-auto no-scrollbar max-w-full">
                  <span className="px-3 py-1 bg-surface-variant rounded-full text-on-surface-variant font-headline text-sm tracking-wide">
                    {previousEquation}
                  </span>
                </div>
              )}
              <div className="w-full text-right overflow-hidden mt-4">
                <h1 className="text-on-surface font-headline text-[3.5rem] leading-none font-bold break-all tracking-tight">
                  {currentInput}
                </h1>
              </div>
            </section>

            {/* Scientific Controls */}
            <section className="px-6 pb-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-label text-xs font-bold uppercase tracking-widest border border-outline-variant/10 active:scale-90 transition-transform">
                  2nd
                </button>
                <button 
                  onClick={() => setIsDegrees(!isDegrees)}
                  className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label text-xs font-medium uppercase tracking-widest border border-outline-variant/10 active:scale-90 transition-transform">
                  {isDegrees ? 'Deg' : 'Rad'}
                </button>
              </div>
              <div className="flex items-center gap-1 text-on-tertiary-fixed font-label text-[10px] font-bold uppercase tracking-tighter cursor-pointer group">
                <span className="material-symbols-outlined text-[1rem] group-hover:text-primary transition-colors">science</span>
                <span className="group-hover:text-primary transition-colors">Advanced</span>
              </div>
            </section>

            {/* Keypad */}
            <section className="px-6 pb-6 select-none">
              <div className="grid grid-cols-4 gap-3">
                {/* Advanced row */}
                <button className="h-12 flex items-center justify-center text-on-surface-variant hover:text-primary font-body text-sm transition-all active:scale-90" onClick={() => handleAdvanced('sin')}>sin</button>
                <button className="h-12 flex items-center justify-center text-on-surface-variant hover:text-primary font-body text-sm transition-all active:scale-90" onClick={() => handleAdvanced('cos')}>cos</button>
                <button className="h-12 flex items-center justify-center text-on-surface-variant hover:text-primary font-body text-sm transition-all active:scale-90" onClick={() => handleAdvanced('tan')}>tan</button>
                <button className="h-12 flex items-center justify-center text-on-surface-variant hover:text-primary font-body text-sm transition-all active:scale-90" onClick={() => handleAdvanced('log')}>log</button>

                {/* Main Keys */}
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary font-headline text-lg font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={handleClear}>AC</button>
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary font-headline text-lg font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={handleDelete}>
                  <span className="material-symbols-outlined">backspace</span>
                </button>
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-headline text-lg font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={handlePercent}>%</button>
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-headline text-2xl font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={() => handleInput('÷')}>÷</button>

                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('7')}>7</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('8')}>8</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('9')}>9</button>
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-headline text-2xl font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={() => handleInput('×')}>×</button>

                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('4')}>4</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('5')}>5</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('6')}>6</button>
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-headline text-3xl font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={() => handleInput('−')}>−</button>

                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('1')}>1</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('2')}>2</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('3')}>3</button>
                <button className="h-16 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-headline text-2xl font-bold shadow-sm active:bg-surface-container-highest active:scale-95 transition-all w-full" onClick={() => handleInput('+')}>+</button>

                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('0')}>0</button>
                <button className="h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-headline text-2xl font-medium shadow-sm active:bg-surface-container-high active:scale-95 transition-all w-full" onClick={() => handleInput('.')}>.</button>
                <button className="h-16 col-span-2 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-headline text-3xl font-bold shadow-[0_0_15px_rgba(129,236,255,0.3)] active:scale-[0.97] transition-all duration-150 w-full" onClick={handleCalculate}>=</button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-8 pb-4 bg-[#171a1d]/90 backdrop-blur-3xl border-t border-[#46484b]/15 shadow-[0_-20px_40px_rgba(0,0,0,0.4)] rounded-t-3xl">
        <button className="flex flex-col items-center justify-center text-[#81ecff] font-bold scale-110" onClick={() => setShowHistory(false)}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
          <span className="font-label text-[10px] font-medium tracking-tight uppercase">Calculator</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#aaabaf] opacity-60 hover:opacity-100 transition-all active:scale-90 duration-200" onClick={() => setShowHistory(true)}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: showHistory ? "'FILL' 1" : "'FILL' 0", color: showHistory ? "#81ecff" : ""}}>history</span>
          <span className="font-label text-[10px] font-medium tracking-tight uppercase" style={{color: showHistory ? "#81ecff" : ""}}>History</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#aaabaf] opacity-60 hover:opacity-100 transition-all active:scale-90 duration-200">
          <span className="material-symbols-outlined">swap_horiz</span>
          <span className="font-label text-[10px] font-medium tracking-tight uppercase">Converter</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
