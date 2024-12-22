import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Form from './Form';
import { AxiosInstance } from "axios";
import { axiosClient } from './axiosClient';
import { LOGIN_MESSAGE } from "../../../constants"

jest.mock('./axiosClient');
const mockedAxiosClient = axiosClient as jest.Mocked<AxiosInstance>;

describe('Form submitting', () => {
    it('displays success message when login succeeds', async () => {
        const mockLoginResponse = { data: { msg: LOGIN_MESSAGE } };
        mockedAxiosClient.post.mockResolvedValue(mockLoginResponse);

        const { getByText, getByTestId } = render(<Form />);
        const usernameInput = getByTestId('username');
        const passwordInput = getByTestId('password');
        const submitButton = getByText('Login');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => expect(getByText(LOGIN_MESSAGE)).toBeInTheDocument());
    });


});