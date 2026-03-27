import {
  EditorState,
  Extension,
  StateField,
  Transaction,
} from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";

import { calculateSharedIndentationPrefix } from "./utils/calculateSharedIndentationPrefix";
import { zoomInEffect, zoomOutEffect } from "./utils/effects";

interface ZoomRange {
  from: number;
  to: number;
}

interface RemoveSharedIndentationState {
  range: ZoomRange | null;
  decorations: DecorationSet;
  sharedPrefix: string;
}

export interface SharedIndentationState {
  active: boolean;
  sharedPrefix: string;
}

const hiddenIndentation = Decoration.replace({});

const emptyState: RemoveSharedIndentationState = {
  range: null,
  decorations: Decoration.none,
  sharedPrefix: "",
};

function isIndentedListItem(text: string) {
  return /^\s+([-*+]|\d+\.)\s+/.test(text);
}

function mapRange(range: ZoomRange, tr: Transaction) {
  return {
    from: tr.changes.mapPos(range.from, -1),
    to: tr.changes.mapPos(range.to, 1),
  };
}

function buildDecorations(state: EditorState, range: ZoomRange) {
  const firstLine = state.doc.lineAt(range.from);
  const lastLine = state.doc.lineAt(range.to);
  const lines: string[] = [];
  const decorations: ReturnType<typeof hiddenIndentation.range>[] = [];

  if (!isIndentedListItem(firstLine.text)) {
    return {
      decorations: Decoration.none,
      sharedPrefix: "",
    };
  }

  for (let lineNo = firstLine.number; lineNo <= lastLine.number; lineNo++) {
    const line = state.doc.line(lineNo);
    lines.push(line.text);
  }

  const sharedPrefix = calculateSharedIndentationPrefix(lines);

  if (!sharedPrefix) {
    return {
      decorations: Decoration.none,
      sharedPrefix,
    };
  }

  for (let lineNo = firstLine.number; lineNo <= lastLine.number; lineNo++) {
    const line = state.doc.line(lineNo);

    if (line.text.startsWith(sharedPrefix)) {
      decorations.push(
        hiddenIndentation.range(line.from, line.from + sharedPrefix.length)
      );
    }
  }

  return {
    decorations: Decoration.set(decorations, true),
    sharedPrefix,
  };
}

const removeSharedIndentationStateField =
  StateField.define<RemoveSharedIndentationState>({
    create: () => emptyState,

    update: (value, tr) => {
      let range = value.range ? mapRange(value.range, tr) : null;
      let shouldRebuild = tr.docChanged && range !== null;

      for (const effect of tr.effects) {
        if (effect.is(zoomInEffect)) {
          range = effect.value;
          shouldRebuild = true;
        }

        if (effect.is(zoomOutEffect)) {
          range = null;
          shouldRebuild = true;
        }
      }

      if (!range) {
        return emptyState;
      }

      if (!shouldRebuild) {
        return {
          ...value,
          range,
        };
      }

      const { decorations, sharedPrefix } = buildDecorations(tr.state, range);

      return {
        range,
        decorations,
        sharedPrefix,
      };
    },

    provide: (field) =>
      EditorView.decorations.from(field, (value) => value.decorations),
  });

export class RemoveSharedIndentation {
  public getExtension(): Extension {
    return removeSharedIndentationStateField;
  }

  public getSharedIndentationState(state: EditorState): SharedIndentationState {
    const value = state.field(removeSharedIndentationStateField);

    return {
      active: value.sharedPrefix.length > 0,
      sharedPrefix: value.sharedPrefix,
    };
  }
}
