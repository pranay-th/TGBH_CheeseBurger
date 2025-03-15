declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (moduleId: string, label: string) => Worker;
    };
  }
}

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor/esm/vs/editor/editor.api';
}

export {}; 