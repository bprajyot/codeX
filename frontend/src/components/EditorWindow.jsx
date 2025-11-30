import { Editor } from '@monaco-editor/react';
import { Code2 } from 'lucide-react'; // Optional: for a subtle icon in the corner

export const EditorWindow = ({ value, onChange, language = 'python' }) => {
  const handleEditorChange = (newValue) => {
    onChange(newValue || '');
  };

  return (
    <div className="h-full w-full p-4 bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <div className="h-full w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden ring-1 ring-white/20 transition-all duration-300 hover:ring-white/30">
        {/* Optional elegant header bar */}
        {/* <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10">
          <Code2 className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300 tracking-wider">
            {language.toUpperCase()} Editor
          </span>
          <div className="flex gap-2 ml-auto">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
        </div> */}

        {/* Monaco Editor with premium feel */}
        <div className="h-[calc(100%)]">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, 'Courier New', monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
              cursorBlinking: 'smooth',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: { indentation: true },
              wordWrap: 'on',
              padding: { top: 24, bottom: 24 },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalHasArrows: false,
                horizontalScrollbarSize: 8,
                verticalScrollbarSize: 12,
              },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              selectionHighlight: true,
              suggestOnTriggerCharacters: true,
              folding: true,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
};