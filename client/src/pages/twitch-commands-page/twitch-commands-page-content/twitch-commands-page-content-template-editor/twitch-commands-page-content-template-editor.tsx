import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { classNames } from '@/utils/classNames';
import {
  DEFAULT_ELO_TEXT,
  REQUIRED_ELO_PLACEHOLDER_NAME,
} from '../utils/twitchCommandTemplates';
import {
  parseTemplateSegments,
  type TemplatePlaceholderSegment,
  type TemplateSegment,
} from '../utils/parseTemplateSegments';
import { serializeTemplateSegments } from '../utils/serializeTemplateSegments';
import { insertPlaceholderAtOffset } from '../utils/insertPlaceholderAtOffset';
import { insertPlaceholderSegment } from '../utils/insertPlaceholderSegment';
import { removePlaceholderSegment } from '../utils/removePlaceholderSegment';
import { ensureRequiredEloPlaceholder } from '../utils/ensureRequiredEloPlaceholder';
import { getPlaceholderOffset } from '../utils/getPlaceholderOffset';
import { getInsertOffsetFromPoint } from '../utils/getInsertOffsetFromPoint';
import { findAdjacentTextSegment } from '../utils/findAdjacentTextSegment';
import { getTextCaretOffset } from '../utils/getTextCaretOffset';
import { findTextPositionAtOffset } from '../utils/findTextPositionAtOffset';
import './twitch-commands-page-content-template-editor.scss';

const DRAG_THRESHOLD_PX = 6;
const LEVEL_PLACEHOLDER_NAME = 'level' as const;
const LEVEL_ADD_LABEL = 'Добавить уровень фейсита';
const LEVEL_REMOVE_LABEL = 'Удалить уровень фейсита';

function parseTemplateValue(text: string): TemplateSegment[] {
  return ensureRequiredEloPlaceholder(parseTemplateSegments(text));
}

interface DragState {
  kind: 'move' | 'insert';
  placeholder: TemplatePlaceholderSegment;
  pointerId: number;
  /** Смещение указателя от левого края бейджа при захвате. */
  grabOffsetX: number;
}

export interface TwitchCommandsPageContentTemplateEditorProps {
  /** Текущий шаблон со строковыми плейсхолдерами `{elo}` / `{level}`. */
  value: string;
  /** Вызывается после любого изменения текста или порядка чипов. */
  onChange: (value: string) => void;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function TwitchCommandsPageContentTemplateEditor(
  props: TwitchCommandsPageContentTemplateEditorProps,
) {
  const { value, onChange, className } = props;
  const [ segments, setSegments ] = useState(() => parseTemplateValue(value));
  const [ drag, setDrag ] = useState<DragState | null>(null);
  const [ dragBase, setDragBase ] = useState<TemplateSegment[] | null>(null);
  const [ dropOffset, setDropOffset ] = useState<number | null>(null);
  const segmentsRef = useRef(segments);
  const measureRef = useRef<HTMLDivElement>(null);
  const textInputRefs = useRef(new Map<string, HTMLInputElement>());
  const dragRef = useRef<DragState | null>(null);
  const dragBaseRef = useRef<TemplateSegment[] | null>(null);
  const dropOffsetRef = useRef<number | null>(null);
  const caretOffsetRef = useRef(serializeTemplateSegments(segments).length);

  useEffect(() => {
    const next = parseTemplateValue(value);
    const serialized = serializeTemplateSegments(next);
    if (serialized !== serializeTemplateSegments(segmentsRef.current)) {
      segmentsRef.current = next;
      setSegments(next);
    }
    if (serialized !== value) {
      onChange(serialized);
    }
  }, [ onChange, value ]);

  const commit = useCallback((next: TemplateSegment[]) => {
    const ensured = ensureRequiredEloPlaceholder(next);
    segmentsRef.current = ensured;
    setSegments(ensured);
    onChange(serializeTemplateSegments(ensured));
  }, [ onChange ]);

  const hasLevel = useMemo(
    () => segments.some(
      (segment) => segment.type === 'placeholder' && segment.name === LEVEL_PLACEHOLDER_NAME,
    ),
    [ segments ],
  );

  const lastTextSegmentId = useMemo(() => {
    for (let index = segments.length - 1; index >= 0; index -= 1) {
      const segment = segments[index];
      if (segment?.type === 'text') {
        return segment.id;
      }
    }
    return null;
  }, [ segments ]);

  const canReset = !drag && serializeTemplateSegments(segments) !== DEFAULT_ELO_TEXT;

  const dragWithout = useMemo(() => {
    if (!drag || !dragBase) {
      return null;
    }
    return dragBase.filter((segment) => segment.id !== drag.placeholder.id);
  }, [ drag, dragBase ]);

  const handleTextChange = useCallback((segmentId: string, nextValue: string) => {
    commit(
      segmentsRef.current.map((segment) => (
        segment.id === segmentId && segment.type === 'text'
          ? { ...segment, value: nextValue }
          : segment
      )),
    );
  }, [ commit ]);

  const rememberCaret = useCallback((segmentId: string, input: HTMLInputElement) => {
    caretOffsetRef.current = getTextCaretOffset(
      segmentsRef.current,
      segmentId,
      input.selectionStart ?? input.value.length,
    );
  }, []);

  const focusTextAt = useCallback((segmentId: string, localOffset: number) => {
    const input = textInputRefs.current.get(segmentId);
    if (!input) {
      return;
    }
    input.focus();
    const position = Math.max(0, Math.min(localOffset, input.value.length));
    input.setSelectionRange(position, position);
    caretOffsetRef.current = getTextCaretOffset(segmentsRef.current, segmentId, position);
  }, []);

  const focusTextSegment = useCallback((segmentId: string, caret: 'start' | 'end') => {
    const input = textInputRefs.current.get(segmentId);
    if (!input) {
      return;
    }
    focusTextAt(segmentId, caret === 'start' ? 0 : input.value.length);
  }, [ focusTextAt ]);

  const handleTextKeyDown = useCallback((
    event: KeyboardEvent<HTMLInputElement>,
    segmentIndex: number,
  ) => {
    const input = event.currentTarget;
    const list = segmentsRef.current;
    const segment = list[segmentIndex];
    if (!segment || segment.type !== 'text') {
      return;
    }

    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;
    const isCollapsed = selectionStart === selectionEnd;

    if (event.key === 'ArrowRight' && isCollapsed && selectionStart === segment.value.length) {
      const nextText = findAdjacentTextSegment(list, segmentIndex, 1);
      if (nextText) {
        event.preventDefault();
        focusTextSegment(nextText.id, 'start');
      }
      return;
    }

    if (event.key === 'ArrowLeft' && isCollapsed && selectionStart === 0) {
      const previousText = findAdjacentTextSegment(list, segmentIndex, -1);
      if (previousText) {
        event.preventDefault();
        focusTextSegment(previousText.id, 'end');
      }
      return;
    }

    if (
      event.key === 'Backspace'
      && isCollapsed
      && selectionStart === 0
    ) {
      const previous = list[segmentIndex - 1];
      if (previous?.type === 'placeholder') {
        event.preventDefault();
        commit(removePlaceholderSegment(list, previous.id));
      }
      return;
    }

    if (
      event.key === 'Delete'
      && isCollapsed
      && selectionStart === segment.value.length
    ) {
      const next = list[segmentIndex + 1];
      if (next?.type === 'placeholder') {
        event.preventDefault();
        commit(removePlaceholderSegment(list, next.id));
      }
    }
  }, [ commit, focusTextSegment ]);

  const handleRemoveChip = useCallback((placeholderId: string) => {
    commit(removePlaceholderSegment(segmentsRef.current, placeholderId));
  }, [ commit ]);

  const handleReset = useCallback(() => {
    if (drag) {
      return;
    }
    const next = parseTemplateValue(DEFAULT_ELO_TEXT);
    commit(next);
    caretOffsetRef.current = serializeTemplateSegments(next).length;
  }, [ commit, drag ]);

  const finishDrag = useCallback((shouldCommit: boolean) => {
    const currentDrag = dragRef.current;
    const currentBase = dragBaseRef.current;
    const currentDropOffset = dropOffsetRef.current;

    dragRef.current = null;
    dragBaseRef.current = null;
    dropOffsetRef.current = null;
    setDrag(null);
    setDragBase(null);
    setDropOffset(null);

    if (
      shouldCommit
      && currentDrag
      && currentBase
      && currentDropOffset !== null
    ) {
      commit(insertPlaceholderAtOffset(
        currentBase,
        currentDrag.placeholder,
        currentDropOffset,
      ));
    }
  }, [ commit ]);

  const updateDropAtPoint = useCallback((clientX: number, clientY: number) => {
    const measure = measureRef.current;
    const currentDrag = dragRef.current;
    if (!measure || !currentDrag) {
      return;
    }
    const nextOffset = getInsertOffsetFromPoint(
      measure,
      clientX - currentDrag.grabOffsetX,
      clientY,
    );
    if (dropOffsetRef.current === nextOffset) {
      return;
    }
    dropOffsetRef.current = nextOffset;
    setDropOffset(nextOffset);
  }, []);

  const beginDrag = useCallback((
    nextDrag: DragState,
    startDropOffset: number,
    clientX: number,
    clientY: number,
  ) => {
    const base = segmentsRef.current;
    dragRef.current = nextDrag;
    dragBaseRef.current = base;
    dropOffsetRef.current = startDropOffset;
    setDragBase(base);
    setDrag(nextDrag);
    setDropOffset(startDropOffset);
    requestAnimationFrame(() => {
      updateDropAtPoint(clientX, clientY);
    });
  }, [ updateDropAtPoint ]);

  useEffect(() => {
    if (!drag) {
      return undefined;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) {
        return;
      }
      updateDropAtPoint(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) {
        return;
      }
      finishDrag(true);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [ drag, finishDrag, updateDropAtPoint ]);

  const handleChipPointerDown = useCallback((
    event: ReactPointerEvent<HTMLSpanElement>,
    placeholder: TemplatePlaceholderSegment,
  ) => {
    if (event.button !== 0 || drag) {
      return;
    }
    event.preventDefault();

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const grabOffsetX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    let started = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId || started) {
        return;
      }
      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (distance < DRAG_THRESHOLD_PX) {
        return;
      }
      started = true;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      beginDrag(
        {
          kind: 'move',
          placeholder,
          pointerId,
          grabOffsetX,
        },
        getPlaceholderOffset(segmentsRef.current, placeholder.id),
        moveEvent.clientX,
        moveEvent.clientY,
      );
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) {
        return;
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      if (!started && placeholder.name !== REQUIRED_ELO_PLACEHOLDER_NAME) {
        handleRemoveChip(placeholder.id);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }, [ beginDrag, drag, handleRemoveChip ]);

  const handleLevelToggle = useCallback(() => {
    if (drag) {
      return;
    }

    if (hasLevel) {
      const levelSegment = segmentsRef.current.find(
        (segment) => segment.type === 'placeholder' && segment.name === LEVEL_PLACEHOLDER_NAME,
      );
      if (levelSegment) {
        commit(removePlaceholderSegment(segmentsRef.current, levelSegment.id));
      }
      return;
    }

    let insertAt = caretOffsetRef.current;
    const active = document.activeElement;
    if (active instanceof HTMLInputElement) {
      for (const [ segmentId, input ] of textInputRefs.current) {
        if (input === active) {
          insertAt = getTextCaretOffset(
            segmentsRef.current,
            segmentId,
            active.selectionStart ?? active.value.length,
          );
          break;
        }
      }
    }

    commit(insertPlaceholderSegment(
      segmentsRef.current,
      LEVEL_PLACEHOLDER_NAME,
      insertAt,
    ));

    const focusOffset = insertAt + `{${LEVEL_PLACEHOLDER_NAME}}`.length;
    requestAnimationFrame(() => {
      const position = findTextPositionAtOffset(segmentsRef.current, focusOffset);
      if (position) {
        focusTextAt(position.segmentId, position.localOffset);
      }
    });
  }, [ commit, drag, focusTextAt, hasLevel ]);

  const renderChip = (
    placeholder: TemplatePlaceholderSegment,
    options?: { isPreview?: boolean | undefined },
  ) => (
    <span
      key={placeholder.id}
      className={classNames(
        'twitch-commands-page-content-template-editor__chip',
        options?.isPreview && 'twitch-commands-page-content-template-editor__chip--preview',
      )}
      onPointerDown={options?.isPreview || drag ? undefined : (event) => {
        handleChipPointerDown(event, placeholder);
      }}
    >
      <span className='twitch-commands-page-content-template-editor__chip-label'>
        {placeholder.name}
      </span>
    </span>
  );

  const renderInsertMark = (offset: number, key: string) => (
    <span
      key={key}
      className='twitch-commands-page-content-template-editor__mark'
      data-insert-offset={offset}
    />
  );

  const renderMeasureLayer = (without: TemplateSegment[]) => {
    const nodes: ReactNode[] = [];
    let offset = 0;

    for (const segment of without) {
      if (segment.type === 'text') {
        for (let index = 0; index < segment.value.length; index += 1) {
          nodes.push(renderInsertMark(offset + index, `${segment.id}-m-${index}`));
          nodes.push(
            <span
              key={`${segment.id}-c-${index}`}
              className='twitch-commands-page-content-template-editor__char'
            >
              {segment.value[index]}
            </span>,
          );
        }
        nodes.push(renderInsertMark(offset + segment.value.length, `${segment.id}-m-end`));
        offset += segment.value.length;
        continue;
      }

      const tokenLength = `{${segment.name}}`.length;
      nodes.push(renderInsertMark(offset, `${segment.id}-before`));
      nodes.push(renderChip(segment));
      nodes.push(renderInsertMark(offset + tokenLength, `${segment.id}-after`));
      offset += tokenLength;
    }

    if (without.length === 0) {
      nodes.push(renderInsertMark(0, 'empty'));
    }

    return nodes;
  };

  const renderFlowLayer = (
    without: TemplateSegment[],
    placeholder: TemplatePlaceholderSegment,
    insertAt: number,
  ) => {
    const nodes: ReactNode[] = [];
    let offset = 0;
    let inserted = false;

    const tryInsert = (at: number) => {
      if (inserted || at !== insertAt) {
        return;
      }
      nodes.push(renderChip(placeholder, { isPreview: true }));
      inserted = true;
    };

    for (const segment of without) {
      if (segment.type === 'text') {
        for (let index = 0; index < segment.value.length; index += 1) {
          tryInsert(offset + index);
          nodes.push(
            <span
              key={`${segment.id}-flow-${index}`}
              className='twitch-commands-page-content-template-editor__char'
            >
              {segment.value[index]}
            </span>,
          );
        }
        offset += segment.value.length;
        continue;
      }

      tryInsert(offset);
      nodes.push(renderChip(segment));
      offset += `{${segment.name}}`.length;
    }

    tryInsert(offset);
    if (!inserted) {
      nodes.push(renderChip(placeholder, { isPreview: true }));
    }

    return nodes;
  };

  return (
    <div className={classNames('twitch-commands-page-content-template-editor', className)}>
      <div className='twitch-commands-page-content-template-editor__row'>
        <div
          className={classNames(
            'twitch-commands-page-content-template-editor__surface',
            drag && 'twitch-commands-page-content-template-editor__surface--dragging',
            canReset && 'twitch-commands-page-content-template-editor__surface--clearable',
          )}
        >
          {drag && dragWithout && dropOffset !== null ? (
            <>
              <div
                ref={measureRef}
                className='twitch-commands-page-content-template-editor__measure'
              >
                <div className='twitch-commands-page-content-template-editor__measure-row'>
                  {renderMeasureLayer(dragWithout)}
                </div>
              </div>
              <div className='twitch-commands-page-content-template-editor__flow'>
                {renderFlowLayer(dragWithout, drag.placeholder, dropOffset)}
              </div>
            </>
          ) : (
            <div className='twitch-commands-page-content-template-editor__content'>
              {segments.map((segment, index) => (
                <span key={segment.id} className='twitch-commands-page-content-template-editor__item'>
                  {segment.type === 'text' ? (
                    <input
                      ref={(element) => {
                        if (element) {
                          textInputRefs.current.set(segment.id, element);
                        } else {
                          textInputRefs.current.delete(segment.id);
                        }
                      }}
                      className={classNames(
                        'twitch-commands-page-content-template-editor__text',
                        segment.id === lastTextSegmentId
                          && 'twitch-commands-page-content-template-editor__text--grow',
                      )}
                      type='text'
                      value={segment.value}
                      size={segment.id === lastTextSegmentId
                        ? undefined
                        : Math.max(segment.value.length, 1)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        handleTextChange(segment.id, event.target.value);
                        rememberCaret(segment.id, event.currentTarget);
                      }}
                      onSelect={(event) => {
                        rememberCaret(segment.id, event.currentTarget);
                      }}
                      onKeyUp={(event) => {
                        rememberCaret(segment.id, event.currentTarget);
                      }}
                      onClick={(event) => {
                        rememberCaret(segment.id, event.currentTarget);
                      }}
                      onBlur={(event) => {
                        rememberCaret(segment.id, event.currentTarget);
                      }}
                      onKeyDown={(event) => {
                        handleTextKeyDown(event, index);
                      }}
                    />
                  ) : (
                    renderChip(segment)
                  )}
                </span>
              ))}
            </div>
          )}
          {canReset ? (
            <button
              type='button'
              className='twitch-commands-page-content-template-editor__clear'
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleReset}
            >
              ×
            </button>
          ) : null}
        </div>
        <button
          type='button'
          className='twitch-commands-page-content-template-editor__level-toggle'
          disabled={Boolean(drag)}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={handleLevelToggle}
        >
          <span className='twitch-commands-page-content-template-editor__level-toggle-sizer'>
            {LEVEL_ADD_LABEL}
          </span>
          <span className='twitch-commands-page-content-template-editor__level-toggle-label'>
            {hasLevel ? LEVEL_REMOVE_LABEL : LEVEL_ADD_LABEL}
          </span>
        </button>
      </div>
    </div>
  );
}
