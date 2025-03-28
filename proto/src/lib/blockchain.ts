import Web3 from 'web3';

// Define the ABI directly in the file
const PrivacyContractABI = [
  {
    "inputs": [],
    "name": "getUserPrivacyParams",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "epsilon",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "delta",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PrivacyContract.PrivacyParameters[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserPrivacyParamsByAdmin",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "epsilon",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "delta",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PrivacyContract.PrivacyParameters[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_epsilon",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_delta",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "_dataHash",
        "type": "bytes32"
      }
    ],
    "name": "setPrivacyParameters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_epsilon",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_delta",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "_dataHash",
        "type": "bytes32"
      }
    ],
    "name": "setPrivacyParametersByAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_consent",
        "type": "bool"
      }
    ],
    "name": "setUserConsent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_consent",
        "type": "bool"
      }
    ],
    "name": "setUserConsentByAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "hasUserConsent",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "type": "event",
    "name": "ConsentUpdated",
    "outputs": [
      {
        "internalType": "address",
        "indexed": true,
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "indexed": false,
        "name": "consent",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "indexed": false,
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "inputs": [],
    "type": "event",
    "name": "PrivacyParametersSet",
    "outputs": [
      {
        "internalType": "address",
        "indexed": true,
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "indexed": false,
        "name": "epsilon",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "indexed": false,
        "name": "delta",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "indexed": false,
        "name": "dataHash",
        "type": "bytes32"
      }
    ],
    "anonymous": false
  }
];

let web3Instance: any;
let privacyContractInstance: any;

// Initialize web3 and contract
const initWeb3 = () => {
  if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
    // If we're in the browser and MetaMask is installed
    web3Instance = new Web3((window as any).ethereum);
    console.log('Using MetaMask provider');
  } else {
    // If we're on the server or MetaMask is not installed
    const provider = `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`;
    web3Instance = new Web3(new Web3.providers.HttpProvider(provider));
    console.log('Using Infura provider:', provider);
  }
  return web3Instance;
};

// Initialize contract instance
const initContract = () => {
  const contractAddress = process.env.NEXT_PUBLIC_PRIVACY_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error('NEXT_PUBLIC_PRIVACY_CONTRACT_ADDRESS environment variable is not set');
  }
  
  if (!web3Instance) {
    initWeb3();
  }
  
  try {
    privacyContractInstance = new web3Instance.eth.Contract(
      PrivacyContractABI,
      contractAddress
    );
    return privacyContractInstance;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
};

// Utilities for blockchain interaction
export const generateVirtualAddress = (userId: string) => {
  // Convert userId to a blockchain address format
  const paddedId = userId.padStart(64, '0');
  return '0x' + paddedId.substring(paddedId.length - 40);
};

export const web3 = initWeb3();
export const privacyContract = initContract();
export const contractAddress = process.env.NEXT_PUBLIC_PRIVACY_CONTRACT_ADDRESS; 