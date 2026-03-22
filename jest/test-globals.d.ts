declare namespace jest {
  interface Matchers<R> {
    toEqualEditorState(s: string): Promise<R>;
    toEqualEditorState(s: string[]): Promise<R>;
  }
}

interface IFold {
  from: number;
  to: number;
}

interface ISelection {
  anchor: number;
  head: number;
}

interface IState {
  hidden: number[];
  folds: IFold[];
  selections: ISelection[];
  value: string;
}

interface IZoomVisibilitySettings {
  hideInlineTitle?: boolean;
  hideProperties?: boolean;
  hideEmbeddedBacklinks?: boolean;
  customHiddenSelectors?: string[];
}

interface IViewChromeState {
  active: boolean;
  rootAttrPresent: boolean;
  rootClassPresent: boolean;
  selectors: string[];
}

interface IHeaderItemState {
  text: string;
  title: string;
  headingLevel?: string;
  kind: string;
  textOverflow: string;
  whiteSpace: string;
  overflow: string;
  maxInlineSize: string;
}

interface IHeaderState {
  active: boolean;
  justifyContent: string;
  items: IHeaderItemState[];
}

declare function applyState(state: string): Promise<void>;
declare function applyState(state: string[]): Promise<void>;
declare function applySettings(
  settings: IZoomVisibilitySettings
): Promise<void>;
declare function parseState(state: string): Promise<IState>;
declare function parseState(state: string[]): Promise<IState>;
declare function simulateKeydown(keys: string): Promise<void>;
declare function replaceSelection(char: string): Promise<void>;
declare function executeCommandById(keys: string): Promise<void>;
declare function getCurrentState(): Promise<IState>;
declare function getCurrentViewChromeState(): Promise<IViewChromeState>;
declare function getCurrentHeaderState(): Promise<IHeaderState>;
