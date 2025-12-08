import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Gif } from 'util/loadGif';

interface ControlsState {
    isDragging?: boolean;
}

/**
 * Controls for the git player.
 */
export function Controls(props: {
    gif: Gif;
    frame: number;
    playing: boolean;
    updateIsDragging: (isDragging: boolean) => void;
    updateFrame: (frame: number) => void;
    updatePlaying: (playing: boolean) => void;
}) {
    const [state, setState] = useState<ControlsState>({});

    const stateRef = useRef<ControlsState>();
    stateRef.current = state;

    const propsRef = useRef(props);
    propsRef.current = props;

    const timerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);

    const stopRepeating = () => {
        if (timerRef.current) {clearTimeout(timerRef.current);}
        if (intervalRef.current) {clearInterval(intervalRef.current);}
        timerRef.current = null;
        intervalRef.current = null;
    };

    const startRepeating = (direction: 1 | -1) => {
        stopRepeating();

        if (propsRef.current.playing) {
            propsRef.current.updatePlaying(false);
        }

        const tick = () => {
            const nextFrame = propsRef.current.frame + direction;
            propsRef.current.updateFrame(nextFrame);
        };

        tick();

        timerRef.current = setTimeout(() => {
            intervalRef.current = setInterval(tick, 50);
        }, 300);
    };

    useEffect(() => {
        const listener = () => {
            if (stateRef.current?.isDragging) {
                setState({ ...stateRef.current, isDragging: false });
            }
        };

        document.addEventListener('mouseup', listener);

        return () => {
            document.removeEventListener('mouseup', listener);
        };
    }, [props.updateIsDragging]);

    return (
        <div style={{
            flex: 1,
            padding: '1em 2em',
            borderTop: '1px solid var(--vscode-editorWidget-border)',
            background: 'var(--vscode-editorWidget-background)',
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                paddingBottom: '0.6em',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <input
                    className='frame-slider'
                    type='range'
                    min='0'
                    max={props.gif.frames.length - 1}
                    value={props.frame}
                    style={{
                        display: 'block',
                        flex: 1,
                    }}
                    onInput={e => {
                        const frame = +(e.target as HTMLInputElement).value;
                        props.updateFrame(frame);
                    }}
                    onMouseDown={e => {
                        props.updatePlaying(false);
                        setState({ ...state, isDragging: true });
                    }} />

                <div style={{
                    textAlign: 'center',
                }}>
                    <span style={{
                        display: 'block',
                        float: 'left',
                        marginLeft: '0.2em',
                    }}>{1}</span>

                    <span style={{}}>{props.frame + 1}</span>

                    <span style={{
                        display: 'block',
                        float: 'right',
                        marginRight: '0.2em',
                    }}>{props.gif.frames.length}</span>
                </div>
            </div>

            <div style={{
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <ControlButton
                    className='previousButton'
                    title={'Previous Frame'}
                    icon={'codicon-debug-step-back'}
                    style={{
                        marginRight: '1em',
                    }}
                    onMouseDown={() => startRepeating(-1)}
                    onMouseUp={stopRepeating}
                    onMouseLeave={stopRepeating} />

                <ControlButton
                    className='playButton'
                    title={props.playing ? 'Pause' : 'Play'}
                    icon={props.playing ? 'codicon-pause' : 'codicon-play'}
                    onClick={() => {
                        props.updatePlaying(!props.playing);
                    }} />

                <ControlButton
                    className='nextButton'
                    title={'Next Frame'}
                    icon={'codicon-debug-step-over'}
                    style={{
                        marginLeft: '1em',
                    }}
                    onMouseDown={() => startRepeating(1)}
                    onMouseUp={stopRepeating}
                    onMouseLeave={stopRepeating} />
            </div>
        </div>
    );
}

function ControlButton(props: {
    className?: string,
    title: string,
    icon: string,
    style?: any,
    onClick?: (e: any) => void,
    onMouseDown?: (e: any) => void,
    onMouseUp?: (e: any) => void,
    onMouseLeave?: (e: any) => void,
}) {
    return (
        <button
            className={'vscode-button ' + props.className}
            title={props.title}
            style={{
                width: '24px',
                height: '24px',
                padding: 0,
                border: 0,
                outline: 0,
                background: 'none',
                color: 'var(--vscode-foreground)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...props.style
            }}
            onClick={props.onClick}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            onMouseLeave={props.onMouseLeave}
        >
            <i className={'codicon ' + props.icon} />
        </button>
    );
}
