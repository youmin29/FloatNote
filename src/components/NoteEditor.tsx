import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import type { KeyboardEvent } from "react";
import type { Block, BlockType } from "../types";
import { useToastStore } from "../store/toastStore";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseBlocks(content: string): Block[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return [{ id: uid(), type: "text", content: content ?? "", checked: false }];
}

function computeOrderedNumbers(blocks: Block[]): number[] {
  const nums: number[] = [];
  let count = 0;
  for (const b of blocks) {
    if (b.type === "ordered") {
      count++;
      nums.push(count);
    } else {
      count = 0;
      nums.push(0);
    }
  }
  return nums;
}

export interface NoteEditorHandle {
  convertFocused: (type: BlockType) => void;
  getFocusedType: () => BlockType;
}

interface Props {
  content: string;
  noteHeight: number;
  onChange: (content: string) => void;
  onFocusedTypeChange?: (type: BlockType) => void;
}

const NoteEditor = forwardRef<NoteEditorHandle, Props>(
  ({ content, noteHeight, onChange, onFocusedTypeChange }, ref) => {
    const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(content));
    const [allSelected, setAllSelected] = useState(false);
    const blocksRef = useRef(blocks);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const focusedIdx = useRef(0);
    const lastCmdATime = useRef(0);
    const showToast = useToastStore((s) => s.show);

    // blocks state 업데이트 시 ref도 동기화
    const update = (next: Block[]) => {
      blocksRef.current = next;
      setBlocks(next);
      onChange(JSON.stringify(next));
    };

    useImperativeHandle(ref, () => ({
      convertFocused: (type: BlockType) => {
        const next = blocksRef.current.map((b, i) =>
          i === focusedIdx.current ? { ...b, type } : b,
        );
        update(next);
        onFocusedTypeChange?.(type);
        setTimeout(() => inputRefs.current[focusedIdx.current]?.focus(), 0);
      },
      getFocusedType: () =>
        blocksRef.current[focusedIdx.current]?.type ?? "text",
    }));

    const handleChange = (idx: number, value: string) => {
      update(
        blocksRef.current.map((b, i) =>
          i === idx ? { ...b, content: value } : b,
        ),
      );
    };

    const handleToggle = (idx: number) => {
      update(
        blocksRef.current.map((b, i) =>
          i === idx ? { ...b, checked: !b.checked } : b,
        ),
      );
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
      const cur = blocksRef.current; // 항상 최신 blocks

      // Cmd+A: 1번 → 현재 줄 선택, 2번 → 전체 선택
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        const now = Date.now();
        if (now - lastCmdATime.current < 600) {
          // 두 번째 Cmd+A → 전체 선택 모드
          e.preventDefault();
          setAllSelected(true);
          // 전체 텍스트 클립보드에 복사
          const allText = blocksRef.current.map((b) => b.content).join("\n");
          navigator.clipboard
            .writeText(allText)
            .then(() => showToast("📋 클립보드에 복사되었습니다"))
            .catch(() => showToast("전체 선택됨"));
          // 첫 번째 입력에 포커스 후 전체 선택
          const first = inputRefs.current[0];
          if (first) {
            first.focus();
            first.select();
          }
        } else {
          // 첫 번째 Cmd+A → 현재 줄만 선택 (브라우저 기본 동작)
          setAllSelected(false);
        }
        lastCmdATime.current = now;
        return;
      }

      // 다른 키 누르면 전체 선택 해제
      if (allSelected && e.key !== "Meta" && e.key !== "Control") {
        setAllSelected(false);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        // DOM에서 직접 읽어서 state 불일치 방지
        const domValue = e.currentTarget.value;
        const cursorPos = e.currentTarget.selectionStart ?? domValue.length;
        const before = domValue.slice(0, cursorPos);
        const after = domValue.slice(cursorPos);
        const newBlock: Block = {
          id: uid(),
          type: cur[idx].type,
          content: after,
          checked: false,
        };
        const next = [...cur];
        next[idx] = { ...next[idx], content: before };
        next.splice(idx + 1, 0, newBlock);
        update(next);
        setTimeout(() => {
          const input = inputRefs.current[idx + 1];
          if (input) {
            input.focus();
            input.setSelectionRange(0, 0);
          }
        }, 0);
      }

      if (e.key === "ArrowUp" && idx > 0) {
        e.preventDefault();
        const col = e.currentTarget.selectionStart ?? 0;
        setTimeout(() => {
          const prev = inputRefs.current[idx - 1];
          if (prev) {
            prev.focus();
            const pos = Math.min(col, prev.value.length);
            prev.setSelectionRange(pos, pos);
          }
        }, 0);
      }

      if (e.key === "ArrowDown" && idx < cur.length - 1) {
        e.preventDefault();
        const col = e.currentTarget.selectionStart ?? 0;
        setTimeout(() => {
          const next = inputRefs.current[idx + 1];
          if (next) {
            next.focus();
            const pos = Math.min(col, next.value.length);
            next.setSelectionRange(pos, pos);
          }
        }, 0);
      }

      if (e.key === "Backspace") {
        const cursorPos = e.currentTarget.selectionStart ?? 0;
        const domValue = e.currentTarget.value;

        if (domValue === "" && cur.length > 1) {
          // 빈 줄 삭제 후 위 줄로
          e.preventDefault();
          const next = cur.filter((_, i) => i !== idx);
          update(next);
          const targetIdx = Math.max(0, idx - 1);
          setTimeout(() => {
            const input = inputRefs.current[targetIdx];
            if (input) {
              const len = input.value.length;
              input.focus();
              input.setSelectionRange(len, len);
            }
          }, 0);
        } else if (cursorPos === 0 && idx > 0) {
          // 줄 맨 앞 → 위 줄 끝에 병합
          e.preventDefault();
          const prevContent = cur[idx - 1].content;
          const merged = prevContent + domValue;
          const next = cur
            .map((b, i) => (i === idx - 1 ? { ...b, content: merged } : b))
            .filter((_, i) => i !== idx);
          update(next);
          setTimeout(() => {
            const input = inputRefs.current[idx - 1];
            if (input) {
              input.focus();
              input.setSelectionRange(prevContent.length, prevContent.length);
            }
          }, 0);
        }
      }
    };

    const handleFocus = (idx: number) => {
      focusedIdx.current = idx;
      onFocusedTypeChange?.(blocksRef.current[idx]?.type ?? "text");
    };

    const orderedNums = computeOrderedNumbers(blocks);

    return (
      <div
        className="overflow-y-auto overflow-x-hidden"
        style={{ height: noteHeight - 44 }}
      >
        <div className="p-3 space-y-0.5">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className={`flex items-center gap-2 group min-h-[26px] rounded px-1 -mx-1 transition-colors duration-75
                ${allSelected ? "bg-blue-100/60" : ""}`}
            >
              {block.type === "check" && (
                <button
                  tabIndex={-1}
                  onClick={() => handleToggle(idx)}
                  className={`flex-shrink-0 w-[17px] h-[17px] rounded border-2 transition-all
                    ${block.checked ? "bg-emerald-400 border-emerald-400" : "border-gray-300 hover:border-gray-400 bg-transparent"}`}
                >
                  {block.checked && (
                    <svg
                      viewBox="0 0 10 10"
                      className="w-full h-full fill-none stroke-white"
                      strokeWidth="2.2"
                    >
                      <polyline
                        points="2,5 4,7.5 8,3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )}

              {block.type === "ordered" && (
                <span className="flex-shrink-0 text-xs font-semibold text-gray-400 w-5 text-right leading-none">
                  {orderedNums[idx]}.
                </span>
              )}

              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                value={block.content}
                onChange={(e) => handleChange(idx, e.target.value)}
                onFocus={() => handleFocus(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                placeholder={
                  idx === 0 && blocks.length === 1 ? "내용을 입력하세요..." : ""
                }
                className={`flex-1 min-w-0 bg-transparent text-sm outline-none leading-relaxed placeholder-gray-300 transition-all
                  ${block.checked ? "text-gray-300 line-through" : "text-gray-600"}`}
              />
            </div>
          ))}

          <div
            className="min-h-[40px] cursor-text"
            onClick={() => inputRefs.current[blocks.length - 1]?.focus()}
          />
        </div>
      </div>
    );
  },
);

NoteEditor.displayName = "NoteEditor";
export default NoteEditor;
