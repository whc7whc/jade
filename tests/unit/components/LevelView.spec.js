const { render, screen } = require('@testing-library/react');
const LevelView = require('../../../src/views/Member/LevelView');

test('renders LevelView component', () => {
    render(<LevelView />);
    const linkElement = screen.getByText(/level view/i);
    expect(linkElement).toBeInTheDocument();
});