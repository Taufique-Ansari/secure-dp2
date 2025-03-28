import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatePrivacyConsent } from '../actions/userActions';

const PrivacyConsent = () => {
    const [consent, setConsent] = useState(false);
    const dispatch = useDispatch();

    const handleConsentChange = async (e) => {
        const newConsent = e.target.checked;
        setConsent(newConsent);
        await dispatch(updatePrivacyConsent(newConsent));
    };

    return (
        <div className="privacy-consent">
            <h3>Privacy Settings</h3>
            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="privacyConsent"
                    checked={consent}
                    onChange={handleConsentChange}
                />
                <label className="form-check-label" htmlFor="privacyConsent">
                    I consent to the collection and processing of my data using differential privacy
                    and blockchain technology for enhanced security.
                </label>
            </div>
        </div>
    );
};

export default PrivacyConsent; 