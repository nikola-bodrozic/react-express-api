import React, { useRef, useState, useEffect, ForwardRefExoticComponent, RefAttributes } from 'react';

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

const FormValidator: React.FC = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [email, setEmail] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const refreshTimer = setTimeout(async () => {
      if (!hasSubmitted && recaptchaRef.current) {
        await recaptchaRef.current.reset();
        const recaptchaToken = await recaptchaRef.current.executeAsync();
        if (recaptchaToken) {
          hashToken(recaptchaToken).then((hash) => {
            console.log('🔄 Refreshed token hash:', hash);
          });
        }
      }
    }, 1000 * 115);

    return () => clearTimeout(refreshTimer);
  }, [hasSubmitted]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const hashToken = async (recaptchaToken: string): Promise<string> => {
    const utf8 = new TextEncoder().encode(recaptchaToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
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

    hashToken(recaptchaToken).then((hash) => {
      console.log('🔒 Submitted token hash:', hash);
    });

    try {
      const response = await axios.post('/verify', { recaptchaToken, email });

      if (response.data.success === true) {
        setHasSubmitted(true);
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

export default FormValidator;
