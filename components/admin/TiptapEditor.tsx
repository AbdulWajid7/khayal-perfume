"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false })],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[300px] p-4 rounded-lg bg-pure border border-border focus:outline-none focus:ring-1 focus:ring-gold text-ink",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const button = (label: string, action: () => void, active = false) => (
    <button
      type="button"
      onClick={action}
      className={`px-3 py-1 text-xs rounded border border-border transition ${
        active
          ? "bg-gold text-pure"
          : "bg-pure text-ink hover:bg-cream-dark hover:text-gold"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {button(
          "Bold",
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold")
        )}
        {button(
          "Italic",
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic")
        )}
        {button(
          "H2",
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive("heading", { level: 2 })
        )}
        {button(
          "H3",
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          editor.isActive("heading", { level: 3 })
        )}
        {button(
          "Bullet",
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList")
        )}
        {button(
          "Number",
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive("orderedList")
        )}
        {button(
          "Link",
          () => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          },
          editor.isActive("link")
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
