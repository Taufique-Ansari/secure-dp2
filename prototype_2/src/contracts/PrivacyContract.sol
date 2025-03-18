// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrivacyContract {
    struct PrivacyParameters {
        uint256 epsilon;      // Privacy budget
        uint256 delta;        // Privacy parameter
        uint256 timestamp;    // When parameters were set
        bytes32 dataHash;     // Hash of the data
    }

    // Stores privacy parameters for each user
    mapping(address => PrivacyParameters[]) public userPrivacyParams;
    mapping(address => bool) public userConsent;

    event PrivacyParamsUpdated(address indexed user, uint256 epsilon, uint256 delta);
    event UserConsentUpdated(address indexed user, bool consent);

    function setPrivacyParameters(uint256 _epsilon, uint256 _delta, bytes32 _dataHash) public {
        PrivacyParameters memory params = PrivacyParameters({
            epsilon: _epsilon,
            delta: _delta,
            timestamp: block.timestamp,
            dataHash: _dataHash
        });
        
        userPrivacyParams[msg.sender].push(params);
        emit PrivacyParamsUpdated(msg.sender, _epsilon, _delta);
    }

    function setUserConsent(bool _consent) public {
        userConsent[msg.sender] = _consent;
        emit UserConsentUpdated(msg.sender, _consent);
    }

    function getUserPrivacyParams() public view returns (PrivacyParameters[] memory) {
        return userPrivacyParams[msg.sender];
    }

    function hasUserConsent(address _user) public view returns (bool) {
        return userConsent[_user];
    }
} 