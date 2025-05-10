import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RadarChart from './RadarChart';

// Mock requestAnimationFrame for testing animations
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0) as unknown as number;
};
global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

describe('RadarChart Component', () => {
  const initialLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const initialData = [80, 60, 90, 70, 50, 75];

  test('renders correctly with initial props', () => {
    render(<RadarChart data={initialData} labels={initialLabels} />);

    // Check if labels are rendered
    initialLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    // Check for SVG element
    expect(screen.getByRole('graphics-document')).toBeInTheDocument(); // SVG role

    // Check for the main polygon representing data
    const polygon = screen.getByRole('graphics-document').querySelector('polygon');
    expect(polygon).toBeInTheDocument();
  });

  test('renders null and logs error if data/labels length is not 6', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<RadarChart data={[1,2,3]} labels={['a','b','c']} />);
    expect(container.firstChild).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('RadarChart requires 6 data points and 6 labels.');
    consoleErrorSpy.mockRestore();
  });

  test('updates and animates when data prop changes', async () => {
    const { rerender } = render(
      <RadarChart data={initialData} labels={initialLabels} size={300} maxValue={100} />
    );

    const polygon1 = screen.getByRole('graphics-document').querySelector('polygon');
    const initialPoints = polygon1?.getAttribute('points');

    const newData = [40, 85, 60, 95, 70, 50];
    rerender(<RadarChart data={newData} labels={initialLabels} size={300} maxValue={100} />);
    
    // Wait for animation to progress (requestAnimationFrame is mocked to run quickly)
    // We need to allow state updates within useEffect and requestAnimationFrame to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate passage of time for animation
    });
    
    const polygon2 = screen.getByRole('graphics-document').querySelector('polygon');
    const updatedPoints = polygon2?.getAttribute('points');

    expect(updatedPoints).not.toBe(initialPoints);
    // More specific assertions could be made here if we calculate expected point coordinates
    // For now, we confirm the points attribute changed, indicating an update.

    // Check if vertex points are rendered (there should be 6 of them)
    const vertexCircles = screen.getByRole('graphics-document').querySelectorAll('circle[r="4"]');
    expect(vertexCircles.length).toBe(6);

  });

  test('renders concentric circles for scale', () => {
    render(<RadarChart data={initialData} labels={initialLabels} />);
    const svg = screen.getByRole('graphics-document');
    // Expect 4 concentric circles + 6 vertex circles
    // The concentric circles have fill="none"
    const concentricCircles = Array.from(svg.querySelectorAll('circle[fill="none"]'));
    expect(concentricCircles.length).toBe(4); 
  });

}); 