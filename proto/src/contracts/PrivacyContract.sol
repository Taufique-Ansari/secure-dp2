// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PrivacyContract
 * @dev Stores and manages user privacy settings and data handling preferences
 */
contract PrivacyContract {
    // Struct to store differential privacy parameters
    struct PrivacyParameters {
        uint256 epsilon;
        uint256 delta;
        uint256 timestamp;
        bytes32 dataHash;
    }

    // Mapping to store user consent
    mapping(address => bool) private userConsent;
    
    // Mapping to store user privacy parameters
    mapping(address => PrivacyParameters[]) private userPrivacyParams;

    // Events
    event ConsentUpdated(address indexed user, bool consent, uint256 timestamp);
    event PrivacyParametersSet(address indexed user, uint256 epsilon, uint256 delta, bytes32 dataHash);

    /**
     * @dev Set user consent for data collection and processing
     * @param _consent Boolean indicating whether user consents
     */
    function setUserConsent(bool _consent) external {
        userConsent[msg.sender] = _consent;
        emit ConsentUpdated(msg.sender, _consent, block.timestamp);
    }

    /**
     * @dev Admin function to set consent on behalf of a user (for server-side operations)
     * @param _user User address
     * @param _consent Boolean indicating whether user consents
     */
    function setUserConsentByAdmin(address _user, bool _consent) external {
        // In a production environment, add appropriate access control
        userConsent[_user] = _consent;
        emit ConsentUpdated(_user, _consent, block.timestamp);
    }

    /**
     * @dev Check if a user has given consent
     * @param _user User address to check
     * @return Boolean indicating consent status
     */
    function hasUserConsent(address _user) external view returns (bool) {
        return userConsent[_user];
    }

    /**
     * @dev Set privacy parameters for a data processing operation
     * @param _epsilon Epsilon value for differential privacy
     * @param _delta Delta value for differential privacy
     * @param _dataHash Hash of the data being processed
     */
    function setPrivacyParameters(uint256 _epsilon, uint256 _delta, bytes32 _dataHash) external {
        PrivacyParameters memory params = PrivacyParameters({
            epsilon: _epsilon,
            delta: _delta,
            timestamp: block.timestamp,
            dataHash: _dataHash
        });
        
        userPrivacyParams[msg.sender].push(params);
        emit PrivacyParametersSet(msg.sender, _epsilon, _delta, _dataHash);
    }

    /**
     * @dev Admin function to set privacy parameters on behalf of a user (for server operations)
     * @param _user User address
     * @param _epsilon Epsilon value for differential privacy
     * @param _delta Delta value for differential privacy
     * @param _dataHash Hash of the data being processed
     */
    function setPrivacyParametersByAdmin(address _user, uint256 _epsilon, uint256 _delta, bytes32 _dataHash) external {
        // In a production environment, add appropriate access control
        PrivacyParameters memory params = PrivacyParameters({
            epsilon: _epsilon,
            delta: _delta,
            timestamp: block.timestamp,
            dataHash: _dataHash
        });
        
        userPrivacyParams[_user].push(params);
        emit PrivacyParametersSet(_user, _epsilon, _delta, _dataHash);
    }

    /**
     * @dev Get all privacy parameters for the calling user
     * @return Array of PrivacyParameters
     */
    function getUserPrivacyParams() external view returns (PrivacyParameters[] memory) {
        return userPrivacyParams[msg.sender];
    }

    /**
     * @dev Admin function to get privacy parameters for any user
     * @param _user User address
     * @return Array of PrivacyParameters
     */
    function getUserPrivacyParamsByAdmin(address _user) external view returns (PrivacyParameters[] memory) {
        // In a production environment, add appropriate access control
        return userPrivacyParams[_user];
    }
} 