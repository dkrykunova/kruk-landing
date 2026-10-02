import Markdoc, { type Node } from "@markdoc/markdoc";
import React from "react";

// Текст матеріалу з Markdoc → React. Стилі — клас .kr-article у globals.css.
export function ArticleBody({ node }: { node: Node }) {
  const tree = Markdoc.transform(node);
  return <div className="kr-article">{Markdoc.renderers.react(tree, React)}</div>;
}
