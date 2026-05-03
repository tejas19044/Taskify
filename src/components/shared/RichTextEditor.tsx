'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, Pilcrow, List, ListOrdered, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minimal?: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700',
        active && 'bg-slate-100 text-slate-800'
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className, minimal }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder ?? 'Add details, context, or notes…',
      }),
      TaskList,
      TaskItem.configure({ nested: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: {
        class: cn(
          'tiptap outline-none text-slate-800 focus:outline-none',
          minimal ? 'min-h-[200px]' : 'min-h-[160px]'
        ),
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML() && (value === '' || value === '<p></p>')) {
      editor.commands.setContent('')
    }
  }, [value, editor])

  if (typeof window === 'undefined' || !editor) return null

  const toolbar = (
    <div className={cn(
      'flex items-center gap-0.5 px-1 py-1',
      minimal ? 'border-b border-slate-100' : 'border-b border-slate-200 px-2 py-1.5'
    )}>
      <ToolbarButton title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')}>
        <Pilcrow className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <div className="mx-1 h-4 w-px bg-slate-200" />
      <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <div className="mx-1 h-4 w-px bg-slate-200" />
      <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Checklist" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}>
        <ListChecks className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  )

  if (minimal) {
    return (
      <div className={cn('group rounded-lg transition-all', className)}>
        {/* Toolbar shown on focus */}
        <div className="opacity-0 group-focus-within:opacity-100 transition-opacity">
          {toolbar}
        </div>
        <div className="px-0 py-1">
          <EditorContent editor={editor} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-slate-50 transition-all focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-3 focus-within:ring-indigo-100', className)}>
      {toolbar}
      <div className="px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
