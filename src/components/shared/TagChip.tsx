export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 tracking-wide">
      {tag}
    </span>
  )
}
