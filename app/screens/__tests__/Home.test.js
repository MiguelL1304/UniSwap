import React from 'react';
import { render } from '@testing-library/react-native';
import Home from '../Tabs/Home';

describe('<Home />', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Home />);
    const homeText = getByText('Home Screen');
    expect(homeText).toBeTruthy();
  });
});