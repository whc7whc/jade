const { render, screen } = require('@testing-library/react');
const LevelView = require('../LevelView');

test('hello world!', () => {
	render(<LevelView />);
	const linkElement = screen.getByText(/hello world/i);
	expect(linkElement).toBeInTheDocument();
});