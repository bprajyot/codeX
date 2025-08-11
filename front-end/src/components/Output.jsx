import React, { useState } from 'react';
import { executeCode } from '../api';

function Output({ editorRef, lang }) {
  const [output, setOutput] = useState(null);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      const result = await executeCode(lang, sourceCode);
      setOutput(result.run.output);
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput('Error executing code.');
    }
  };

  return (
    <div className="w-1/2 h-9/10 bg-gray-900 rounded-xl text-white p-4 overflow-auto">
      <div className='text-center border-b-2 shadow-xs mb-4 '>
        <button
          type="button"
          className="mr-10 cursor-pointer py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={runCode}
        >
          Run
        </button>
        <button
          type="button"
          className="cursor-pointer focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Submit
        </button>
      </div>

      {output !== null ? (
        <pre className="whitespace-pre-wrap">{output}</pre>
      ) : (
        <p>Run the code to see the output</p>
      )}
    </div>
  );
}

export default Output;
