export type Section = {
  id: string;
  title: string;
  note: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
};

export type CodeBlockProps = {
  html?: string | null;
  code: string;
  filename?: string;
};
