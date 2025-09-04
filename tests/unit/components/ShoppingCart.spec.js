const { render, screen } = require('@testing-library/react');
const ShoppingCart = require('../../../src/views/Member/ShoppingCart');

test('renders shopping cart', () => {
    render(<ShoppingCart />);
    const linkElement = screen.getByText(/shopping cart/i);
    expect(linkElement).toBeInTheDocument();
});