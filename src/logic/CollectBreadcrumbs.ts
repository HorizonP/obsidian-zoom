import { foldable } from "@codemirror/language";
import { EditorState } from "@codemirror/state";

import { cleanTitle } from "./utils/cleanTitle";
import {
  BreadcrumbType,
  detectBreadcrumbType,
} from "./utils/detectBreadcrumbType";

export interface Breadcrumb {
  title: string;
  pos: number | null;
  type: BreadcrumbType;
}

export interface GetDocumentTitle {
  getDocumentTitle(state: EditorState): string;
}

export class CollectBreadcrumbs {
  constructor(private getDocumentTitle: GetDocumentTitle) {}

  public collectBreadcrumbs(state: EditorState, pos: number) {
    const breadcrumbs: Breadcrumb[] = [
      {
        title: this.getDocumentTitle.getDocumentTitle(state),
        pos: null,
        type: { kind: "root" },
      },
    ];

    const posLine = state.doc.lineAt(pos);

    for (let i = 1; i < posLine.number; i++) {
      const line = state.doc.line(i);
      const f = foldable(state, line.from, line.to);
      if (f && f.to > posLine.from) {
        breadcrumbs.push({
          title: cleanTitle(line.text),
          pos: line.from,
          type: detectBreadcrumbType(line.text),
        });
      }
    }

    breadcrumbs.push({
      title: cleanTitle(posLine.text),
      pos: posLine.from,
      type: detectBreadcrumbType(posLine.text),
    });

    return breadcrumbs;
  }
}
