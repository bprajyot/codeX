export const Console = ({ output, error, loading }) => {
  const parseTestCases = (text = '') => {
    const regex = /Test Case\s*(\d+):\s*([\s\S]*?)(?=(?:Test Case\s*\d+:)|$)/g;
    const labelRegex = /^\s*(Input|Expected Output|Your Output|Status|Runtime|Memory)\s*:\s*(.*)$/i;

    const cases = [];
    let m;
    while ((m = regex.exec(text)) !== null) {
      const id = Number(m[1]);
      const block = m[2].replace(/\r/g, '');
      const lines = block.split('\n');

      let input = [];
      let expected = '';
      let yourOutput = '';
      let status = '';
      let runtime = '';
      let memory = '';

      let currentSection = null;

      for (let line of lines) {
        const labelMatch = line.match(labelRegex);
        if (labelMatch) {
          const key = labelMatch[1].trim();
          const value = (labelMatch[2] || '').trim();

          if (/input/i.test(key)) {
            currentSection = 'input';
            if (value) input.push(value);
          } else if (/expected output/i.test(key)) {
            currentSection = 'expected';
            if (value) expected = value;
          } else if (/your output/i.test(key)) {
            currentSection = 'output';
            if (value) yourOutput = value;
          } else if (/status/i.test(key)) {
            status = value;
          } else if (/runtime/i.test(key)) {
            runtime = value;
          } else if (/memory/i.test(key)) {
            memory = value;
          } else {
            currentSection = null;
          }
        } else {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (currentSection === 'input') {
            input.push(line.replace(/^\s{4}/, '')); // clean indentation
          } else if (currentSection === 'expected' && !expected) {
            expected = trimmed;
          } else if (currentSection === 'output' && !yourOutput) {
            yourOutput = trimmed;
          }
        }
      }

      // Smart array detection fallback
      if (!expected) {
        const expMatch = block.match(/Expected\s+Output[^\[]*\[([\s\S]*?)\]/i);
        if (expMatch) expected = `[${expMatch[1]}]`;
      }
      if (!yourOutput) {
        const outMatch = block.match(/Your\s+Output[^\[]*\[([\s\S]*?)\]/i);
        if (outMatch) yourOutput = `[${outMatch[1]}]`;
        else if (block.match(/Your\s+Output\s*:\s*null/i)) yourOutput = 'null';
      }

      const passed = /pass/i.test(status) && !/fail/i.test(status);

      cases.push({
        id,
        input,
        expected: expected || '(empty)',
        yourOutput: yourOutput || '(empty)',
        status: status || (passed ? 'Passed' : 'Failed'),
        runtime,
        memory,
        passed
      });
    }
    return cases;
  };

  const testCases = parseTestCases(output || '');
  const allPassed = testCases.length > 0 && testCases.every(tc => tc.passed);

  return (
    <div className="h-full flex flex-col bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-900/20 to-transparent border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Console Output</h3>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>Running...</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium animate-pulse">Executing test cases...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-400 font-semibold mb-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Execution Error
            </div>
            <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap break-all">
              {error}
            </pre>
          </div>
        )}

        {/* Test Cases Display */}
        {!loading && !error && testCases.length > 0 && (
          <div className="space-y-5">
            {testCases.map((tc) => (
              <div
                key={tc.id}
                className={`rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 ${
                  tc.passed
                    ? 'bg-emerald-900/20 border-emerald-700/50 shadow-emerald-500/10 shadow-lg'
                    : 'bg-red-900/20 border-red-700/50 shadow-red-500/10 shadow-lg'
                }`}
              >
                <div className="mb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className={`text-2xl font-bold ${tc.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      Case {tc.id}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      tc.passed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {tc.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>

                  {(tc.runtime || tc.memory) && (
                    <div className="text-xs text-slate-400 font-mono">
                      {tc.runtime && <span>{tc.runtime} </span>}
                      {tc.memory && <span>• {tc.memory}</span>}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="mb-5">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Input</div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200">
                    {tc.input.length > 0 ? (
                      tc.input.map((line, i) => (
                        <div key={i}>{line || <span className="text-slate-600 italic">empty</span>}</div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No input</span>
                    )}
                  </div>
                </div>

                {/* Expected vs Actual */}
                <div className="grid grid-rows-2 gap-6">
                  <div>
                    <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                      Expected
                    </div>
                    <div className="bg-slate-800/50 border border-emerald-700/30 rounded-lg p-4 font-mono text-sm text-emerald-300">
                      {tc.expected}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                      Your Output
                    </div>
                    <div className={`bg-slate-800/50 border ${tc.passed ? 'border-emerald-700/30' : 'border-red-700/40'} rounded-lg p-4 font-mono text-sm ${tc.passed ? 'text-emerald-300' : 'text-red-300'}`}>
                      {tc.yourOutput}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Final Summary */}
            <div className={`mt-8 p-6 rounded-2xl text-center font-bold text-xl border-2 ${
              allPassed
                ? 'bg-emerald-900/30 border-emerald-600/60 text-emerald-300 shadow-emerald-500/20 shadow-2xl'
                : 'bg-red-900/30 border-red-600/60 text-red-300 shadow-red-500/20 shadow-2xl'
            }`}>
              {allPassed ? (
                <div className="flex flex-col items-center gap-3">
                  <span>All Test Cases Passed!</span>
                  {/* <span className="text-4xl">Submission Ready</span> */}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span>{testCases.filter(t => t.passed).length}/{testCases.length} Passed</span>
                  <span className="text-4xl">Keep Trying!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && testCases.length === 0 && !output && (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-dashed border-slate-600 mb-6">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No output yet</p>
            <p className="text-sm mt-2">Click <span className="text-purple-400 font-bold">Run Code</span> to test your solution</p>
          </div>
        )}

        {/* Raw Output Fallback */}
        {!loading && !error && testCases.length === 0 && output && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};