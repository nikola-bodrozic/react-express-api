import React, { useRef, useState, ForwardRefExoticComponent, RefAttributes } from 'react';

import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

// Cast ReCAPTCHA to the proper type via 'unknown'
const SafeReCAPTCHA = ReCAPTCHA as unknown as ForwardRefExoticComponent<
Omit<ReCAPTCHAProps, 'ref'> & RefAttributes<ReCAPTCHA>
>;

interface ReCAPTCHAProps {
  sitekey: string;
  size?: 'invisible' | 'normal' | 'compact';
  badge?: 'bottomright' | 'bottomleft' | 'inline';
  onChange?: (token: string | null) => void;
  onErrored?: () => void;
  onExpired?: () => void;
}

const CAPTCHAFormValidator: React.FC = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recaptchaToken = await recaptchaRef.current?.executeAsync();
    recaptchaRef.current?.reset();

    if (!recaptchaToken) {
      console.warn('⚠️ CAPTCHA token unavailable');
      alert('CAPTCHA failed. Try again.');
      return;
    }

    try {
      const response = await axios.post('/verify', { recaptchaToken, email });

      if (response.data.success === true) {
        alert('✅ Email verified!');
        console.log('Verification passed.');
      } else {
        alert('❌ Verification failed.');
        console.warn('reCAPTCHA error codes:', response.data['error-codes']);
      }
    } catch (error) {
      console.error('🚨 Server error:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>Google reCAPTCHA v2 invisible</p>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Your email"
        required
      />
      <SafeReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_APP_CAPTCHA_PUBLIC}
        size="invisible"
        badge="inline"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default CAPTCHAFormValidator;
