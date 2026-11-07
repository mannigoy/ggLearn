import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Button from './Button';
import Chip from './Chip';
import Confirm from './Confirm';
import TextInputField from './TextInputField';
import { ErrorState } from './States';
import Mascot from './Mascot';
import Screen from './Screen';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() },
}));

describe('Button', () => {
  it('ignores presses while busy and reports disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" busy onPress={onPress} accessibilityLabel="Save lesson" />);
    const btn = screen.getByLabelText('Save lesson');
    await fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('Save…')).toBeTruthy();
  });
});

describe('Confirm', () => {
  it('shows Sure?, No restores, Yes calls onYes once', async () => {
    const onYes = jest.fn();
    await render(<Confirm label="Delete" accessibilityLabel="Delete lesson Seeds" onYes={onYes} />);
    await fireEvent.press(screen.getByLabelText('Delete lesson Seeds'));
    expect(screen.getByText('Sure?')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('No, keep Delete lesson Seeds'));
    expect(screen.queryByText('Sure?')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Delete lesson Seeds'));
    await fireEvent.press(screen.getByLabelText('Yes, Delete lesson Seeds'));
    expect(onYes).toHaveBeenCalledTimes(1);
  });
});

describe('Confirm busy', () => {
  it('disables Yes and ignores presses while busy, but No stays enabled', async () => {
    const onYes = jest.fn();
    const view = await render(<Confirm label="Delete" accessibilityLabel="Delete lesson Seeds" onYes={onYes} />);
    await fireEvent.press(screen.getByLabelText('Delete lesson Seeds'));
    await view.rerender(<Confirm label="Delete" accessibilityLabel="Delete lesson Seeds" onYes={onYes} busy />);
    const yes = screen.getByLabelText('Yes, Delete lesson Seeds');
    expect(yes.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('Yes…')).toBeTruthy();
    await fireEvent.press(yes);
    expect(onYes).not.toHaveBeenCalled();
    expect(screen.getByLabelText('No, keep Delete lesson Seeds').props.accessibilityState.disabled).toBe(false);
  });
});

describe('TextInputField', () => {
  it('renders the error with role alert', async () => {
    await render(<TextInputField label="Name" value="" onChangeText={() => {}} error="Name is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });
});

describe('ErrorState', () => {
  it('calls onRetry on Try again', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState message="Oops" onRetry={onRetry} />);
    await fireEvent.press(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('reduce motion', () => {
  afterEach(() => jest.restoreAllMocks());

  const loopSpy = () =>
    jest.spyOn(Animated, 'loop').mockReturnValue({ start: jest.fn(), stop: jest.fn() });

  it('Mascot does not animate when reduce motion is on', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const loop = loopSpy();
    await render(<Mascot size={80} />);
    await act(async () => {});
    expect(screen.getByTestId('mascot')).toBeTruthy();
    expect(loop).not.toHaveBeenCalled();
  });

  it('Mascot animates when reduce motion is off', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const loop = loopSpy();
    await render(<Mascot size={80} />);
    await act(async () => {});
    expect(loop).toHaveBeenCalled();
  });

  const pressedTransform = async (reduce) => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduce);
    await render(<Button label="Go" onPress={() => {}} />);
    await act(async () => {});
    const btn = screen.getByLabelText('Go');
    await fireEvent(btn, 'responderGrant', { persist() {}, nativeEvent: { touches: [], timestamp: 0 }, currentTarget: { measure() {} } });
    return StyleSheet.flatten(screen.getByLabelText('Go').props.style).transform;
  };

  it('Button press applies no transform under reduce motion', async () => {
    expect(await pressedTransform(true)).toBeUndefined();
  });

  it('Button press moves down and shrinks otherwise', async () => {
    expect(await pressedTransform(false)).toEqual([{ translateY: 2 }, { scale: 0.97 }]);
  });

  const chipTransform = async (reduce) => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduce);
    await render(<Chip label="Go" onPress={() => {}} />);
    await act(async () => {});
    const chip = screen.getByLabelText('Go');
    await fireEvent(chip, 'responderGrant', { persist() {}, nativeEvent: { touches: [], timestamp: 0 }, currentTarget: { measure() {} } });
    return StyleSheet.flatten(screen.getByLabelText('Go').props.style).transform;
  };

  it('Chip press applies no transform under reduce motion', async () => {
    expect(await chipTransform(true)).toBeUndefined();
  });

  it('Chip press scales down otherwise', async () => {
    expect(await chipTransform(false)).toEqual([{ scale: 0.97 }]);
  });

  it('removes the reduceMotionChanged subscription on unmount', async () => {
    const remove = jest.fn();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const add = jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove });
    const view = await render(<Button label="Go" onPress={() => {}} />);
    await act(async () => {});
    expect(add).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));
    await view.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

describe('Chip role', () => {
  it('defaults to a button reporting selected', async () => {
    await render(<Chip label="K" selected onPress={() => {}} />);
    const chip = screen.getByRole('button', { name: 'K' });
    expect(chip.props.accessibilityState).toEqual({ selected: true });
  });

  it('radio role reports checked', async () => {
    await render(<Chip label="Student" role="radio" selected onPress={() => {}} />);
    const chip = screen.getByRole('radio', { name: 'Student' });
    expect(chip.props.accessibilityState).toEqual({ checked: true });
  });
});

describe('Screen back control', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders no back control without the back prop', async () => {
    await render(<Screen title="Hi" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a labelled 48 by 48 button that goes back when it can', async () => {
    router.canGoBack.mockReturnValue(true);
    await render(<Screen back={{ label: 'Back to courses', fallback: '/courses' }} />);
    const btn = screen.getByRole('button', { name: 'Back to courses' });
    const style = StyleSheet.flatten(btn.props.style);
    expect(style.minWidth).toBeGreaterThanOrEqual(48);
    expect(style.minHeight).toBeGreaterThanOrEqual(48);
    await fireEvent.press(btn);
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('replaces with the fallback when there is nothing to go back to', async () => {
    router.canGoBack.mockReturnValue(false);
    await render(<Screen back={{ label: 'Back', fallback: '/course/c1' }} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.replace).toHaveBeenCalledWith('/course/c1');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('falls back to /courses when no fallback is given', async () => {
    router.canGoBack.mockReturnValue(false);
    await render(<Screen back={{ label: 'Back' }} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.replace).toHaveBeenCalledWith('/courses');
  });
});
