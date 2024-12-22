import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { axiosClient } from './axiosClient';
import { AxiosInstance } from "axios";
import { LOGIN_MESSAGE } from "../../constants"

jest.mock('./axiosClient');
const mockedAxiosClient = axiosClient as jest.Mocked<AxiosInstance>;

describe('App', () => {
    it('displays success message when login succeeds', async () => {
        const mockLoginResponse = { data: { msg: LOGIN_MESSAGE } };
        mockedAxiosClient.post.mockResolvedValue(mockLoginResponse);

        const { getByText, getByTestId } = render(<App />);
        const usernameInput = getByTestId('username');
        const passwordInput = getByTestId('password');
        const submitButton = getByText('Login');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(getByText(LOGIN_MESSAGE)).toBeInTheDocument());
    });


});