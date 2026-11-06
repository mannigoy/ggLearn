import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Button from './Button';
import Confirm from './Confirm';
import TextInputField from './TextInputField';
import { ErrorState } from './States';
import Mascot from './Mascot';

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
    await fireEvent.press(screen.getByText('No'));
    expect(screen.queryByText('Sure?')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Delete lesson Seeds'));
    await fireEvent.press(screen.getByText('Yes'));
    expect(onYes).toHaveBeenCalledTimes(1);
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

describe('Mascot', () => {
  it('renders with reduce motion on', async () => {
    const spy = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await render(<Mascot size={80} />);
    await act(async () => {});
    expect(spy).toHaveBeenCalled();
    expect(screen.getByTestId('mascot')).toBeTruthy();
    spy.mockRestore();
  });
});
