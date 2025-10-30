import { Block, BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";

interface BlocknoteViewerProps {
  content: string;
}

const BlocknoteViewer = ({ content }: BlocknoteViewerProps) => {
  const editor: BlockNoteEditor | null = useBlockNote({
    editable: false,
    initialContent: content ? (JSON.parse(content) as Block[]) : undefined,
  });

  return <BlockNoteView editor={editor} />;
};

export default BlocknoteViewer;
