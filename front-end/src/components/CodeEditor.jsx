import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import LanguageSelector from './LanguageSelector';
import { CODE_SNIPPETS } from './constants';
import Output from './Output';

function CodeEditor() {
    const [val, setVal] = useState('');
    const [lang, setLang] = useState('Java');
    const editorRef = useRef();

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language) => {
        setLang(language);
        setVal(CODE_SNIPPETS[language]);
    };

    return (
        <div className="flex flex-row items-center justify-center h-screen">
            <Output editorRef={editorRef} lang={lang} />
            <div className="w-1/2 p-4">
                <LanguageSelector language={lang} onSelect={onSelect} />
                <Editor
                    className="mt-3 rounded-lg shadow-lg"
                    height="85vh"
                    width="100%"
                    theme="vs-dark"
                    language={lang.toLowerCase()}
                    defaultValue="// some comment"
                    onMount={onMount}
                    value={val}
                    onChange={(value) => setVal(value)}
                />
            </div>
        </div>
    );
}

export default CodeEditor;
