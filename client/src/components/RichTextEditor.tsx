/* TalentKenya rich text editor — lightweight contentEditable toolbar (bold, italic, bullet/numbered
   lists, undo/redo, clear). Used for the AI cover letter flow so candidates can format drafted text.
   Style: sharp 6px radius, pill toolbar buttons, green primary — matches the platform palette. */
import { useCallback, useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Undo2, Redo2, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  // Track whether the current content is HTML (has real markup) — needed for
  // extracting plain text when the candidate hasn't formatted anything yet.
  const hasHtml = /<(b|strong|i|em|ul|ol|li|br)>/i.test(value);

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    sync();
  };

  const sync = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    onChange(html);
  }, [onChange]);

  // Keep the editor in sync if the AI regenerates the draft externally
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (prevValueRef.current === value) return;
    prevValueRef.current = value;
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const clearFormatting = () => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = "";
    el.focus();
    sync();
  };

  const btn =
    "p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150";

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-white", className)}>
      <div className="flex items-center gap-0.5 border-b border-border bg-secondary px-2 py-1.5 flex-wrap">
        <button type="button" onClick={() => exec("bold")} className={btn} title="Bold"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("italic")} className={btn} title="Italic"><Italic className="h-3.5 w-3.5" /></button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className={btn} title="Bullet list"><List className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("insertOrderedList")} className={btn} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => exec("undo")} className={btn} title="Undo"><Undo2 className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("redo")} className={btn} title="Redo"><Redo2 className="h-3.5 w-3.5" /></button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={clearFormatting} className={cn(btn, "text-[#b91c1c] hover:text-[#991b1b]")} title="Clear"><Eraser className="h-3.5 w-3.5" /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={() => { isComposingRef.current = false; sync(); }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        className="prose prose-sm max-w-none p-3 text-sm outline-none min-h-[120px] focus:bg-[#fafffe] transition-colors duration-200 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-0.5 [&_p]:mb-2 [&_b]:font-semibold [&_strong]:font-semibold"
        style={{ caretColor: "#166534" }}
      />
      {/* hidden textarea keeps form behavior consistent if consumers read text */}
      <input type="hidden" value={hasHtml ? value : value} />
    </div>
  );
}

/* Convert HTML to plain text for the plain-text fallback submission path */
export function htmlToText(html: string): string {
  if (!html) return "";
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerText.replace(/\n{3,}/g, "\n\n").trim();
}
